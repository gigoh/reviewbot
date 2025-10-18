import { Octokit } from '@octokit/rest';
import { Config, MergeRequestInfo, DiffChange } from '../types';
import { Logger } from '../utils/logger';

export class GitHubClient {
  private client: Octokit;

  constructor(config: Config) {
    this.client = new Octokit({
      auth: config.githubToken,
    });
  }

  /**
   * Fetch pull request information
   */
  async getMergeRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<MergeRequestInfo> {
    try {
      Logger.debug(`Fetching PR ${prNumber} from ${owner}/${repo}`);

      const { data: pr } = await this.client.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
      });

      return {
        platform: 'github',
        projectId: `${owner}/${repo}`,
        mrIid: pr.number,
        title: pr.title,
        description: pr.body || '',
        sourceBranch: pr.head.ref,
        targetBranch: pr.base.ref,
        webUrl: pr.html_url,
        diffRefs: {
          baseSha: pr.base.sha,
          headSha: pr.head.sha,
          startSha: pr.base.sha,
        },
      };
    } catch (error: any) {
      Logger.error('Failed to fetch pull request', error);
      throw new Error(`Failed to fetch pull request: ${error.message}`);
    }
  }

  /**
   * Fetch all changes (diffs) for a pull request
   */
  async getMergeRequestChanges(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<DiffChange[]> {
    try {
      Logger.debug(`Fetching changes for PR ${prNumber}`);

      const { data: files } = await this.client.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber,
      });

      const changes: DiffChange[] = files.map((file) => ({
        oldPath: file.previous_filename || file.filename,
        newPath: file.filename,
        diff: file.patch || '',
        newFile: file.status === 'added',
        deletedFile: file.status === 'removed',
        renamedFile: file.status === 'renamed',
      }));

      return changes;
    } catch (error: any) {
      Logger.error('Failed to fetch pull request changes', error);
      throw new Error(`Failed to fetch pull request changes: ${error.message}`);
    }
  }

  /**
   * Post a general comment on the pull request
   */
  async postComment(
    owner: string,
    repo: string,
    prNumber: number,
    comment: string
  ): Promise<void> {
    try {
      Logger.debug(`Posting general comment to PR ${prNumber}`);

      await this.client.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: comment,
      });

      Logger.success('General comment posted successfully');
    } catch (error: any) {
      Logger.error('Failed to post comment', error);
      throw new Error(`Failed to post comment: ${error.message}`);
    }
  }

  /**
   * Post a line-specific review comment on a file in the pull request
   */
  async postLineComment(
    owner: string,
    repo: string,
    prNumber: number,
    filePath: string,
    lineNumber: number,
    comment: string,
    diffRefs?: { baseSha: string; headSha: string; startSha: string }
  ): Promise<void> {
    try {
      Logger.debug(`Posting line comment to ${filePath}:${lineNumber}`);

      if (!diffRefs) {
        Logger.warn('No diff refs available, posting as general comment instead');
        await this.postComment(owner, repo, prNumber, `**${filePath}:${lineNumber}**\n\n${comment}`);
        return;
      }

      // Create a review comment with position information
      await this.client.pulls.createReviewComment({
        owner,
        repo,
        pull_number: prNumber,
        commit_id: diffRefs.headSha,
        path: filePath,
        body: comment,
        line: lineNumber,
        side: 'RIGHT',
      });

      Logger.debug(`Line comment posted to ${filePath}:${lineNumber}`);
    } catch (error: any) {
      Logger.error(`Failed to post line comment to ${filePath}:${lineNumber}`, error);
      // Fallback: post as general comment with file reference
      Logger.warn('Falling back to general comment');
      await this.postComment(owner, repo, prNumber, `**${filePath}:${lineNumber}**\n\n${comment}`);
    }
  }
}
