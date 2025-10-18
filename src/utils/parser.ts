import { VCSPlatform } from '../types';

/**
 * Parse VCS URL to extract platform, project identifier, and MR/PR number
 * Supports formats:
 * - GitLab: https://gitlab.com/group/project/-/merge_requests/123
 * - GitLab: https://gitlab.example.com/group/subgroup/project/-/merge_requests/456
 * - GitHub: https://github.com/owner/repo/pull/123
 */
export function parseMergeRequestUrl(url: string): {
  platform: VCSPlatform;
  projectId: string;
  mrIid: number;
} {
  // Try GitHub PR URL format first
  const githubRegex = /^https?:\/\/github\.com\/([^\/]+\/[^\/]+)\/pull\/(\d+)/;
  const githubMatch = url.match(githubRegex);

  if (githubMatch) {
    return {
      platform: 'github',
      projectId: githubMatch[1], // owner/repo
      mrIid: parseInt(githubMatch[2], 10),
    };
  }

  // Try GitLab MR URL format
  const gitlabRegex = /^https?:\/\/[^\/]+\/(.+)\/-\/merge_requests\/(\d+)/;
  const gitlabMatch = url.match(gitlabRegex);

  if (gitlabMatch) {
    return {
      platform: 'gitlab',
      projectId: gitlabMatch[1], // project path
      mrIid: parseInt(gitlabMatch[2], 10),
    };
  }

  throw new Error('Invalid merge/pull request URL format. Supported formats:\n' +
    '  GitLab: https://gitlab.com/group/project/-/merge_requests/123\n' +
    '  GitHub: https://github.com/owner/repo/pull/123');
}
