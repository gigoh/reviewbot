import { MergeRequestInfo, DiffChange } from '../../types';

/**
 * Abstract interface for VCS (Version Control System) clients
 */
export interface IVCSClient {
  /**
   * Fetch merge/pull request information
   */
  getMergeRequest(projectId: string, mrIid: number): Promise<MergeRequestInfo>;

  /**
   * Fetch all changes (diffs) for a merge/pull request
   */
  getMergeRequestChanges(projectId: string, mrIid: number): Promise<DiffChange[]>;

  /**
   * Post a general comment on the merge/pull request
   */
  postComment(projectId: string, mrIid: number, comment: string): Promise<void>;

  /**
   * Post a line-specific comment on a file in the merge/pull request
   */
  postLineComment(
    projectId: string,
    mrIid: number,
    filePath: string,
    lineNumber: number,
    comment: string,
    diffRefs?: { baseSha: string; headSha: string; startSha: string }
  ): Promise<void>;
}
