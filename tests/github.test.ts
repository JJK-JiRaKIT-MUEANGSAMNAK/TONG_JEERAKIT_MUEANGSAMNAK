import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  TARGET_REPOSITORY,
  testTargetRepository,
  fetchGitHubApi,
  getRepositoryInfo,
} from '../lib/github'

describe('GitHub API Helper (Server-side)', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('targets the correct repository constant', () => {
    expect(TARGET_REPOSITORY).toBe(
      'JJK-JiRaKIT-MUEANGSAMNAK/TONG_JEERAKIT_MUEANGSAMNAK'
    )
  })

  it('includes Authorization Bearer header when GITHUB_TOKEN is set', async () => {
    process.env.GITHUB_TOKEN = 'mock-test-token-xyz'

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 123, name: 'TONG_JEERAKIT_MUEANGSAMNAK' }),
    })
    globalThis.fetch = fetchMock

    await getRepositoryInfo()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [calledUrl, calledInit] = fetchMock.mock.calls[0]
    expect(calledUrl).toBe(
      'https://api.github.com/repos/JJK-JiRaKIT-MUEANGSAMNAK/TONG_JEERAKIT_MUEANGSAMNAK'
    )
    expect(calledInit.headers).toMatchObject({
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer mock-test-token-xyz',
      'User-Agent': 'RentalPOS-App/1.0',
    })
  })

  it('does not send Authorization header when GITHUB_TOKEN is missing or empty', async () => {
    delete process.env.GITHUB_TOKEN

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 123, name: 'TONG_JEERAKIT_MUEANGSAMNAK' }),
    })
    globalThis.fetch = fetchMock

    await getRepositoryInfo()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, calledInit] = fetchMock.mock.calls[0]
    expect(calledInit.headers.Authorization).toBeUndefined()
    expect(calledInit.headers['User-Agent']).toBe('RentalPOS-App/1.0')
  })

  it('never leaks GITHUB_TOKEN in testTargetRepository response', async () => {
    process.env.GITHUB_TOKEN = 'secret-token-do-not-leak'

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 999,
        full_name: TARGET_REPOSITORY,
      }),
    })
    globalThis.fetch = fetchMock

    const result = await testTargetRepository()

    expect(result.success).toBe(true)
    expect(result.hasTokenConfigured).toBe(true)
    expect(result.targetRepo).toBe(TARGET_REPOSITORY)

    // Token value should never appear in any part of the returned object
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('secret-token-do-not-leak')
  })

  it('handles API errors gracefully without leaking token', async () => {
    process.env.GITHUB_TOKEN = 'secret-token-do-not-leak'

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Not Found' }),
    })
    globalThis.fetch = fetchMock

    const result = await testTargetRepository()

    expect(result.success).toBe(false)
    expect(result.statusCode).toBe(404)
    expect(result.error).toContain('GitHub API request failed with status 404')

    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('secret-token-do-not-leak')
  })
})
