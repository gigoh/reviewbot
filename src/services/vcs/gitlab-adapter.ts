import { GitLabClient } from '../gitlab';
import { IVCSClient } from './base';
import { Config, MergeRequestInfo, DiffChange } from '../../types';

/**
 * Adapter for GitLab client to implement IVCSClient interface
 */
export class GitLabAdapter implements IVCSClient {
  private client: GitLabClient;

  constructor(config: Config) {
    this.client = new GitLabClient(config);
  }

  async getMergeRequest(projectId: string, mrIid: number): Promise<MergeRequestInfo> {
    return this.client.getMergeRequest(projectId, mrIid);
  }

  async getMergeRequestChanges(projectId: string, mrIid: number): Promise<DiffChange[]> {
    return this.client.getMergeRequestChanges(projectId, mrIid);
  }

  async postComment(projectId: string, mrIid: number, comment: string): Promise<void> {
    return this.client.postComment(projectId, mrIid, comment);
  }

  async postLineComment(
    projectId: string,
    mrIid: number,
    filePath: string,
    lineNumber: number,
    comment: string,
    diffRefs?: { baseSha: string; headSha: string; startSha: string }
  ): Promise<void> {
    return this.client.postLineComment(projectId, mrIid, filePath, lineNumber, comment, diffRefs);
  }
}
