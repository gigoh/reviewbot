import dotenv from 'dotenv';
import { Config, LLMProvider, ReviewLanguage } from '../types';

dotenv.config();

export function loadConfig(verbose?: boolean): Config {
  const gitlabUrl = process.env.GITLAB_URL || 'https://gitlab.com';
  const gitlabToken = process.env.GITLAB_TOKEN;
  const githubToken = process.env.GITHUB_TOKEN;
  const llmProvider = (process.env.LLM_PROVIDER || 'anthropic') as LLMProvider;
  const reviewLanguage = (process.env.REVIEW_LANGUAGE || 'english') as ReviewLanguage;

  // Validate that at least one VCS token is configured
  if (!gitlabToken && !githubToken) {
    throw new Error('At least one of GITLAB_TOKEN or GITHUB_TOKEN environment variable is required');
  }

  // Validate provider-specific configuration
  if (llmProvider === 'anthropic') {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required when using Anthropic provider');
    }

    return {
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
