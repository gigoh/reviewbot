import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { createLLMClient } from '../../../src/services/llm/factory';
import type { Config } from '../../../src/types';

// Note: These tests verify the factory logic and error handling.
// Constructor mocking has been simplified for Bun compatibility.

describe('LLM Factory', () => {
  beforeEach(() => {
    // Clear any mocks if needed
  });

  describe('Anthropic Client Creation', () => {
    it('should create Anthropic client with valid config', () => {
      const config: Config = {
        llmProvider: 'anthropic',
        anthropicApiKey: 'sk-ant-test-key',
        reviewLanguage: 'english',
      };

      const client = createLLMClient(config);

      expect(client).toBeDefined();
      expect(client).toHaveProperty('generateCompletion');
    });

    it('should throw error when API key is missing', () => {
      const config: Config = {
        llmProvider: 'anthropic',
        reviewLanguage: 'english',
      };

      expect(() => createLLMClient(config)).toThrow('Anthropic API key is required for Anthropic provider');
    });

    it('should throw error when API key is undefined', () => {
      const config: Config = {
        llmProvider: 'anthropic',
        anthropicApiKey: undefined,
        reviewLanguage: 'english',
      };

      expect(() => createLLMClient(config)).toThrow('Anthropic API key is required for Anthropic provider');
    });
  });

  describe('Ollama Client Creation', () => {
    it('should create Ollama client with valid config', () => {
      const config: Config = {
        llmProvider: 'ollama',
        ollamaEndpoint: 'http://localhost:11434',
        ollamaModel: 'gemma3:4b',
        reviewLanguage: 'english',
      };

      const client = createLLMClient(config);

      expect(client).toBeDefined();
      expect(client).toHaveProperty('generateCompletion');
    });

    it('should create Ollama client with custom endpoint', () => {
      const config: Config = {
        llmProvider: 'ollama',
        ollamaEndpoint: 'http://custom-server:8080',
        ollamaModel: 'llama2:13b',
        reviewLanguage: 'english',
      };

      const client = createLLMClient(config);

      expect(client).toBeDefined();
      expect(client).toHaveProperty('generateCompletion');
    });

    it('should throw error when endpoint is missing', () => {
      const config: Config = {
        llmProvider: 'ollama',
        ollamaModel: 'gemma3:4b',
        reviewLanguage: 'english',
      };

      expect(() => createLLMClient(config)).toThrow('Ollama endpoint and model are required for Ollama provider');
    });

    it('should throw error when model is missing', () => {
      const config: Config = {
        llmProvider: 'ollama',
        ollamaEndpoint: 'http://localhost:11434',
        reviewLanguage: 'english',
      };

      expect(() => createLLMClient(config)).toThrow('Ollama endpoint and model are required for Ollama provider');
    });

    it('should throw error when both endpoint and model are missing', () => {
      const config: Config = {
        llmProvider: 'ollama',
        reviewLanguage: 'english',
      };

      expect(() => createLLMClient(config)).toThrow('Ollama endpoint and model are required for Ollama provider');
    });
  });

  describe('Unsupported Provider', () => {
    it('should throw error for unsupported provider', () => {
      const config: Config = {
        llmProvider: 'unsupported' as any,
        reviewLanguage: 'english',
      };

      expect(() => createLLMClient(config)).toThrow('Unsupported LLM provider: unsupported');
    });

    it('should throw error with provider name in message', () => {
      const config: Config = {
        llmProvider: 'gpt' as any,
        reviewLanguage: 'english',
      };

      expect(() => createLLMClient(config)).toThrow('Unsupported LLM provider: gpt');
    });
  });

  describe('Client Interface', () => {
    it('should return client with generateCompletion method for Anthropic', () => {
      const config: Config = {
        llmProvider: 'anthropic',
        anthropicApiKey: 'test-key',
        reviewLanguage: 'english',
      };

      const client = createLLMClient(config);

      expect(client).toHaveProperty('generateCompletion');
      expect(typeof client.generateCompletion).toBe('function');
    });

    it('should return client with generateCompletion method for Ollama', () => {
      const config: Config = {
        llmProvider: 'ollama',
        ollamaEndpoint: 'http://localhost:11434',
        ollamaModel: 'gemma3:4b',
        reviewLanguage: 'english',
      };

      const client = createLLMClient(config);

      expect(client).toHaveProperty('generateCompletion');
      expect(typeof client.generateCompletion).toBe('function');
    });
  });
});
