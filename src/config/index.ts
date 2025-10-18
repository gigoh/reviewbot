import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

export function loadConfig(): Config {
  const gitlabUrl = process.env.GITLAB_URL || 'https://gitlab.com';
  const gitlabToken = process.env.GITLAB_TOKEN;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (!gitlabToken) {
    throw new Error('GITLAB_TOKEN environment variable is required');
  }

  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  return {
    gitlabUrl,
    gitlabToken,
    anthropicApiKey,
    maxDiffSize: process.env.MAX_DIFF_SIZE
      ? parseInt(process.env.MAX_DIFF_SIZE, 10)
      : 50000,
    reviewPromptTemplate: process.env.REVIEW_PROMPT_TEMPLATE || 'default',
  };
}
