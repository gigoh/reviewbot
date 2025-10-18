import dotenv from 'dotenv';
import { Config, LLMProvider, ReviewLanguage, VCSPlatform } from '../types';

dotenv.config();

export function loadConfig(verbose?: boolean): Config {
  const vcsPlatform = (process.env.VCS_PLATFORM || 'gitlab') as VCSPlatform;
  const gitlabUrl = process.env.GITLAB_URL || 'https://gitlab.com';
  const gitlabToken = process.env.GITLAB_TOKEN;
  const githubToken = process.env.GITHUB_TOKEN;
  const llmProvider = (process.env.LLM_PROVIDER || 'anthropic') as LLMProvider;
  const reviewLanguage = (process.env.REVIEW_LANGUAGE || 'english') as ReviewLanguage;

  // Validate platform-specific configuration
  if (vcsPlatform === 'gitlab' && !gitlabToken) {
    throw new Error('GITLAB_TOKEN environment variable is required when using GitLab');
  }

  if (vcsPlatform === 'github' && !githubToken) {
    throw new Error('GITHUB_TOKEN environment variable is required when using GitHub');
  }

  // Validate provider-specific configuration
  if (llmProvider === 'anthropic') {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required when using Anthropic provider');
    }

    return {
      vcsPlatform,
      gitlabUrl,
      gitlabToken,
      githubToken,
      llmProvider,
      anthropicApiKey,
      reviewLanguage,
      maxDiffSize: process.env.MAX_DIFF_SIZE
        ? parseInt(process.env.MAX_DIFF_SIZE, 10)
        : 50000,
      reviewPromptTemplate: process.env.REVIEW_PROMPT_TEMPLATE || 'default',
      verbose: verbose || false,
    };
  } else if (llmProvider === 'ollama') {
    const ollamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'gemma3:4b';

    return {
      vcsPlatform,
      gitlabUrl,
      gitlabToken,
      githubToken,
      llmProvider,
      ollamaEndpoint,
      ollamaModel,
      reviewLanguage,
      maxDiffSize: process.env.MAX_DIFF_SIZE
        ? parseInt(process.env.MAX_DIFF_SIZE, 10)
        : 50000,
      reviewPromptTemplate: process.env.REVIEW_PROMPT_TEMPLATE || 'default',
      verbose: verbose || false,
    };
  } else {
    throw new Error(`Unsupported LLM provider: ${llmProvider}. Supported providers: anthropic, ollama`);
  }
}
