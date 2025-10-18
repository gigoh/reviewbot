/**
 * Parse GitLab MR URL to extract project path and MR IID
 * Supports formats:
 * - https://gitlab.com/group/project/-/merge_requests/123
 * - https://gitlab.example.com/group/subgroup/project/-/merge_requests/456
 */
export function parseMergeRequestUrl(url: string): { projectPath: string; mrIid: number } {
  const regex = /^https?:\/\/[^\/]+\/(.+)\/-\/merge_requests\/(\d+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error('Invalid GitLab merge request URL format');
  }

  const projectPath = match[1];
  const mrIid = parseInt(match[2], 10);

  return { projectPath, mrIid };
}
