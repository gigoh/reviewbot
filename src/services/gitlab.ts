import { Gitlab } from '@gitbeaker/rest';
import { Config, MergeRequestInfo, DiffChange } from '../types';
import { Logger } from '../utils/logger';

export class GitLabClient {
  private client: InstanceType<typeof Gitlab>;

  constructor(config: Config) {
    this.client = new Gitlab({
      host: config.gitlabUrl,
      token: config.gitlabToken,
    });
  }

  /**
   * Fetch merge request information
   */
  async getMergeRequest(
    projectId: string,
    mrIid: number
  ): Promise<MergeRequestInfo> {
    try {
      Logger.debug(`Fetching MR ${mrIid} from project ${projectId}`);

      const mr = await this.client.MergeRequests.show(projectId, mrIid);

      return {
        projectId: mr.project_id as string | number,
        mrIid: mr.iid as number,
        title: mr.title as string,
        description: (mr.description as string) || '',
        sourceBranch: mr.source_branch as string,
        targetBranch: mr.target_branch as string,
        webUrl: mr.web_url as string,
      };
    } catch (error: any) {
      Logger.error('Failed to fetch merge request', error);
      throw new Error(`Failed to fetch merge request: ${error.message}`);
    }
  }

  /**
   * Fetch all changes (diffs) for a merge request
   */
  async getMergeRequestChanges(
    projectId: string,
    mrIid: number
  ): Promise<DiffChange[]> {
    try {
      Logger.debug(`Fetching changes for MR ${mrIid}`);

      const mrChanges = await this.client.MergeRequests.allDiffs(projectId, mrIid);

      const changes: DiffChange[] = mrChanges.map((change: any) => ({
        oldPath: change.old_path,
        newPath: change.new_path,
        diff: change.diff,
        newFile: change.new_file,
        deletedFile: change.deleted_file,
        renamedFile: change.renamed_file,
      }));

      return changes;
    } catch (error: any) {
      Logger.error('Failed to fetch merge request changes', error);
      throw new Error(`Failed to fetch merge request changes: ${error.message}`);
    }
  }

  /**
   * Post a comment on the merge request
   */
  async postComment(
    projectId: string,
    mrIid: number,
    comment: string
  ): Promise<void> {
    try {
      Logger.debug(`Posting comment to MR ${mrIid}`);

      await this.client.MergeRequestNotes.create(projectId, mrIid, comment);

      Logger.success('Comment posted successfully');
    } catch (error: any) {
      Logger.error('Failed to post comment', error);
      throw new Error(`Failed to post comment: ${error.message}`);
    }
  }
}
