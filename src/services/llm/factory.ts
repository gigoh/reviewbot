import { Config } from '../../types';
import { ILLMClient } from './base';
import { AnthropicClient } from './anthropic';
import { OllamaClient } from './ollama';

/**
 * Factory function to create the appropriate LLM client based on configuration
 */
export function createLLMClient(config: Config): ILLMClient {
  switch (config.llmProvider) {
    case 'anthropic':
      if (!config.anthropicApiKey) {
        throw new Error('Anthropic API key is required for Anthropic provider');
      }
      return new AnthropicClient(config.anthropicApiKey);

    case 'ollama':
      if (!config.ollamaEndpoint || !config.ollamaModel) {
        throw new Error('Ollama endpoint and model are required for Ollama provider');
      }
      return new OllamaClient(config.ollamaEndpoint, config.ollamaModel);

    default:
      throw new Error(`Unsupported LLM provider: ${config.llmProvider}`);
  }
}
