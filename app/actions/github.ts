'use server'

import {
  testTargetRepository,
  TARGET_REPOSITORY,
  GitHubTestResult,
} from '@/lib/github'

/**
 * Server Action to test GitHub repository connection from the client or UI.
 * Strictly guarantees that GITHUB_TOKEN is NEVER exposed or returned to the browser.
 */
export async function testGitHubConnectionAction(
  repoFullName: string = TARGET_REPOSITORY
): Promise<GitHubTestResult> {
  return testTargetRepository(repoFullName)
}
