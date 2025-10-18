import { Config } from '../../types';
import { IVCSClient } from './base';
import { GitLabAdapter } from './gitlab-adapter';
import { GitHubAdapter } from './github-adapter';

/**
 * Factory function to create the appropriate VCS client based on configuration
 */
export function createVCSClient(config: Config): IVCSClient {
  switch (config.vcsPlatform) {
    case 'gitlab':
      return new GitLabAdapter(config);

    case 'github':
      return new GitHubAdapter(config);

    default:
      throw new Error(`Unsupported VCS platform: ${config.vcsPlatform}`);
  }
}
