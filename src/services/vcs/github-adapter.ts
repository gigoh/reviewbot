import { GitHubClient } from '../github';
import { IVCSClient } from './base';
import { Config, MergeRequestInfo, DiffChange } from '../../types';

/**
 * Adapter for GitHub client to implement IVCSClient interface
 */
export class GitHubAdapter implements IVCSClient {
  private client: GitHubClient;

  constructor(config: Config) {
    this.client = new GitHubClient(config);
  }

  async getMergeRequest(projectId: string, mrIid: number): Promise<MergeRequestInfo> {
    // projectId format: "owner/repo"
    const [owner, repo] = projectId.split('/');
    return this.client.getMergeRequest(owner, repo, mrIid);
  }

  async getMergeRequestChanges(projectId: string, mrIid: number): Promise<DiffChange[]> {
    const [owner, repo] = projectId.split('/');
    return this.client.getMergeRequestChanges(owner, repo, mrIid);
  }

  async postComment(projectId: string, mrIid: number, comment: string): Promise<void> {
    const [owner, repo] = projectId.split('/');
    return this.client.postComment(owner, repo, mrIid, comment);
  }

  async postLineComment(
    projectId: string,
    mrIid: number,
    filePath: string,
    lineNumber: number,
    comment: string,
    diffRefs?: { baseSha: string; headSha: string; startSha: string }
  ): Promise<void> {
    const [owner, repo] = projectId.split('/');
    return this.client.postLineComment(owner, repo, mrIid, filePath, lineNumber, comment, diffRefs);
  }
}
