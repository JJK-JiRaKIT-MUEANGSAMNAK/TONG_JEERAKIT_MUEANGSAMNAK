/**
 * GitHub API Helper (Server-side ONLY)
 *
 * Provides functions to interact directly with the GitHub REST API (https://api.github.com)
 * without intermediate services or Docker containers.
 *
 * Security Notice:
 * - This module is intended for server-side execution only (Server Actions, Route Handlers, SSR).
 * - process.env.GITHUB_TOKEN is never sent back or leaked to the client/browser.
 * - Never use NEXT_PUBLIC_GITHUB_TOKEN.
 */

const GITHUB_API_BASE_URL = 'https://api.github.com'

export const TARGET_REPOSITORY = 'JJK-JiRaKIT-MUEANGSAMNAK/TONG_JEERAKIT_MUEANGSAMNAK'

export interface GitHubRepoInfo {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  html_url: string
  description: string | null
  fork: boolean
  url: string
  default_branch: string
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  visibility?: string
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  owner: {
    login: string
    id: number
    avatar_url: string
    html_url: string
    type: string
  }
  [key: string]: unknown
}

export interface GitHubRequestOptions extends RequestInit {
  params?: Record<string, string>
}

export interface GitHubTestResult {
  success: boolean
  hasTokenConfigured: boolean
  targetRepo: string
  data?: GitHubRepoInfo
  error?: string
  statusCode?: number
}

/**
 * Returns GitHub API headers for server-side requests.
 * Adds `Authorization: Bearer <token>` if GITHUB_TOKEN is configured in process.env.
 */
function getGitHubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN?.trim()

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'RentalPOS-App/1.0',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

/**
 * Generic server-side fetch wrapper for the GitHub REST API.
 * Never leaks the Authorization header or token in errors or returned objects.
 */
export async function fetchGitHubApi<T = unknown>(
  endpoint: string,
  options: GitHubRequestOptions = {}
): Promise<T> {
  const { params, headers: customHeaders, ...fetchOptions } = options

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = new URL(`${GITHUB_API_BASE_URL}${cleanEndpoint}`)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const defaultHeaders = getGitHubHeaders()
  const headers = {
    ...defaultHeaders,
    ...customHeaders,
  }

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    let errorDetail = ''
    try {
      const errorJson = (await response.json()) as { message?: string }
      if (errorJson?.message) {
        errorDetail = `: ${errorJson.message}`
      }
    } catch {
      // Body was not JSON or empty
    }

    const error = new Error(
      `GitHub API request failed with status ${response.status} (${response.statusText})${errorDetail}`
    ) as Error & { statusCode?: number }
    error.statusCode = response.status
    throw error
  }

  return (await response.json()) as T
}

/**
 * Reads information for a given repository (owner/repo).
 * Defaults to `JJK-JiRaKIT-MUEANGSAMNAK/TONG_JEERAKIT_MUEANGSAMNAK`.
 */
export async function getRepositoryInfo(
  repoFullName: string = TARGET_REPOSITORY
): Promise<GitHubRepoInfo> {
  return fetchGitHubApi<GitHubRepoInfo>(`/repos/${repoFullName}`)
}

/**
 * Test function to verify reading data for the specified repository:
 * JJK-JiRaKIT-MUEANGSAMNAK/TONG_JEERAKIT_MUEANGSAMNAK
 *
 * Safe to return to callers: never contains GITHUB_TOKEN.
 */
export async function testTargetRepository(
  repoFullName: string = TARGET_REPOSITORY
): Promise<GitHubTestResult> {
  const hasTokenConfigured = Boolean(process.env.GITHUB_TOKEN?.trim())

  try {
    const data = await getRepositoryInfo(repoFullName)
    return {
      success: true,
      hasTokenConfigured,
      targetRepo: repoFullName,
      data,
    }
  } catch (error: unknown) {
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? (error as { statusCode?: number }).statusCode
        : undefined

    const errorMessage = error instanceof Error ? error.message : String(error)

    return {
      success: false,
      hasTokenConfigured,
      targetRepo: repoFullName,
      error: errorMessage,
      statusCode,
    }
  }
}
