import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { loadConfig } from '../../src/config';

describe('Configuration Loader', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('VCS Token Validation', () => {
    it('should throw error when neither GitLab nor GitHub tokens are provided', () => {
      delete process.env.GITLAB_TOKEN;
      delete process.env.GITHUB_TOKEN;
      process.env.ANTHROPIC_API_KEY = 'test-key';

      expect(() => loadConfig()).toThrow('At least one of GITLAB_TOKEN or GITHUB_TOKEN environment variable is required');
    });

    it('should accept only GitLab token', () => {
      process.env.GITLAB_TOKEN = 'gitlab-token';
      delete process.env.GITHUB_TOKEN;
      process.env.ANTHROPIC_API_KEY = 'test-key';

      const config = loadConfig();

      expect(config.gitlabToken).toBe('gitlab-token');
      expect(config.githubToken).toBeUndefined();
    });

    it('should accept only GitHub token', () => {
      delete process.env.GITLAB_TOKEN;
      process.env.GITHUB_TOKEN = 'github-token';
      process.env.ANTHROPIC_API_KEY = 'test-key';

      const config = loadConfig();

      expect(config.gitlabToken).toBeUndefined();
      expect(config.githubToken).toBe('github-token');
    });

    it('should accept both GitLab and GitHub tokens', () => {
      process.env.GITLAB_TOKEN = 'gitlab-token';
      process.env.GITHUB_TOKEN = 'github-token';
      process.env.ANTHROPIC_API_KEY = 'test-key';

      const config = loadConfig();

      expect(config.gitlabToken).toBe('gitlab-token');
      expect(config.githubToken).toBe('github-token');
    });
  });

  describe('Anthropic Provider Configuration', () => {
    beforeEach(() => {
      process.env.GITLAB_TOKEN = 'gitlab-token';
      process.env.LLM_PROVIDER = 'anthropic';
    });

    it('should throw error when ANTHROPIC_API_KEY is missing', () => {
      delete process.env.ANTHROPIC_API_KEY;

      expect(() => loadConfig()).toThrow('ANTHROPIC_API_KEY environment variable is required when using Anthropic provider');
    });

    it('should load Anthropic configuration successfully', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';

      const config = loadConfig();

      expect(config.llmProvider).toBe('anthropic');
      expect(config.anthropicApiKey).toBe('sk-ant-test-key');
      expect(config.ollamaEndpoint).toBeUndefined();
      expect(config.ollamaModel).toBeUndefined();
    });

    it('should use default LLM provider as anthropic when not specified', () => {
      delete process.env.LLM_PROVIDER;
      process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';

      const config = loadConfig();

      expect(config.llmProvider).toBe('anthropic');
    });
  });

  describe('Ollama Provider Configuration', () => {
    beforeEach(() => {
      process.env.GITLAB_TOKEN = 'gitlab-token';
      process.env.LLM_PROVIDER = 'ollama';
    });

    it('should load Ollama configuration with defaults', () => {
      const config = loadConfig();

      expect(config.llmProvider).toBe('ollama');
      expect(config.ollamaEndpoint).toBe('http://localhost:11434');
      expect(config.ollamaModel).toBe('gemma3:4b');
      expect(config.anthropicApiKey).toBeUndefined();
    });

    it('should load custom Ollama endpoint and model', () => {
      process.env.OLLAMA_ENDPOINT = 'http://custom:8080';
      process.env.OLLAMA_MODEL = 'llama2:13b';

      const config = loadConfig();

      expect(config.ollamaEndpoint).toBe('http://custom:8080');
      expect(config.ollamaModel).toBe('llama2:13b');
    });
  });

  describe('GitLab URL Configuration', () => {
    beforeEach(() => {
      process.env.GITLAB_TOKEN = 'gitlab-token';
      process.env.ANTHROPIC_API_KEY = 'test-key';
    });

    it('should use default GitLab URL when not specified', () => {
      delete process.env.GITLAB_URL;

      const config = loadConfig();

      expect(config.gitlabUrl).toBe('https://gitlab.com');
    });

    it('should use custom GitLab URL when specified', () => {
      process.env.GITLAB_URL = 'https://gitlab.example.com';

      const config = loadConfig();

      expect(config.gitlabUrl).toBe('https://gitlab.example.com');
    });
  });

  describe('Review Language Configuration', () => {
    beforeEach(() => {
      process.env.GITLAB_TOKEN = 'gitlab-token';
      process.env.ANTHROPIC_API_KEY = 'test-key';
    });

    it('should use english as default review language', () => {
      delete process.env.REVIEW_LANGUAGE;

      const config = loadConfig();

      expect(config.reviewLanguage).toBe('english');
    });

    it('should accept korean language', () => {
      process.env.REVIEW_LANGUAGE = 'korean';

      const config = loadConfig();

      expect(config.reviewLanguage).toBe('korean');
    });

    it('should accept japanese language', () => {
      process.env.REVIEW_LANGUAGE = 'japanese';

      const config = loadConfig();

      expect(config.reviewLanguage).toBe('japanese');
    });

    it('should accept chinese language', () => {
      process.env.REVIEW_LANGUAGE = 'chinese';

      const config = loadConfig();

      expect(config.reviewLanguage).toBe('chinese');
    });
  });

  describe('Max Diff Size Configuration', () => {
    beforeEach(() => {
      process.env.GITLAB_TOKEN = 'gitlab-token';
      process.env.ANTHROPIC_API_KEY = 'test-key';
    });

    it('should use default max diff size of 50000', () => {
      delete process.env.MAX_DIFF_SIZE;

      const config = loadConfig();

      expect(config.maxDiffSize).toBe(50000);
    });

    it('should accept custom max diff size', () => {
      process.env.MAX_DIFF_SIZE = '100000';

      const config = loadConfig();

      expect(config.maxDiffSize).toBe(100000);
    });

    it('should parse numeric string correctly', () => {
      process.env.MAX_DIFF_SIZE = '25000';

      const config = loadConfig();

      expect(config.maxDiffSize).toBe(25000);
    });
  });

  describe('Review Prompt Template Configuration', () => {
    beforeEach(() => {
      process.env.GITLAB_TOKEN = 'gitlab-token';
      process.env.ANTHROPIC_API_KEY = 'test-key';
    });

    it('should use default template when not specified', () => {
      delete process.env.REVIEW_PROMPT_TEMPLATE;

      const config = loadConfig();

      expect(config.reviewPromptTemplate).toBe('default');
    });

    it('should accept concise template', () => {
      process.env.REVIEW_PROMPT_TEMPLATE = 'concise';

      const config = loadConfig();

      expect(config.reviewPromptTemplate).toBe('concise');
    });

    it('should accept security template', () => {
      process.env.REVIEW_PROMPT_TEMPLATE = 'security';

      const config = loadConfig();

      expect(config.reviewPromptTemplate).toBe('security');
    });

    it('should accept performance template', () => {
      process.env.REVIEW_PROMPT_TEMPLATE = 'performance';

      const config = loadConfig();

      expect(config.reviewPromptTemplate).toBe('performance');
    });
  });

  describe('Verbose Flag', () => {
    beforeEach(() => {
      process.env.GITLAB_TOKEN = 'gitlab-token';
      process.env.ANTHROPIC_API_KEY = 'test-key';
    });

    it('should default verbose to false', () => {
      const config = loadConfig();

      expect(config.verbose).toBe(false);
    });

    it('should accept verbose flag from parameter', () => {
      const config = loadConfig(true);

      expect(config.verbose).toBe(true);
    });

    it('should keep verbose false when not provided', () => {
      const config = loadConfig(false);

      expect(config.verbose).toBe(false);
    });
  });

  describe('Unsupported LLM Provider', () => {
    beforeEach(() => {
      process.env.GITLAB_TOKEN = 'gitlab-token';
    });

    it('should throw error for unsupported provider', () => {
      process.env.LLM_PROVIDER = 'unsupported-provider';

      expect(() => loadConfig()).toThrow('Unsupported LLM provider: unsupported-provider. Supported providers: anthropic, ollama');
    });
  });

  describe('Complete Configuration Examples', () => {
    it('should load complete Anthropic + GitLab config', () => {
      process.env.GITLAB_URL = 'https://gitlab.com';
      process.env.GITLAB_TOKEN = 'glpat-token';
      delete process.env.GITHUB_TOKEN;
      process.env.LLM_PROVIDER = 'anthropic';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-key';
      process.env.REVIEW_LANGUAGE = 'korean';
      process.env.MAX_DIFF_SIZE = '75000';
      process.env.REVIEW_PROMPT_TEMPLATE = 'security';

      const config = loadConfig(true);

      expect(config.gitlabUrl).toBe('https://gitlab.com');
      expect(config.gitlabToken).toBe('glpat-token');
      expect(config.llmProvider).toBe('anthropic');
      expect(config.anthropicApiKey).toBe('sk-ant-key');
      expect(config.reviewLanguage).toBe('korean');
      expect(config.maxDiffSize).toBe(75000);
      expect(config.reviewPromptTemplate).toBe('security');
      expect(config.verbose).toBe(true);
    });

    it('should load complete Ollama + GitHub config', () => {
      delete process.env.GITLAB_TOKEN;
      process.env.GITHUB_TOKEN = 'ghp-token';
      process.env.LLM_PROVIDER = 'ollama';
      process.env.OLLAMA_ENDPOINT = 'http://localhost:11434';
      process.env.OLLAMA_MODEL = 'mistral:7b';
      process.env.REVIEW_LANGUAGE = 'english';
      process.env.REVIEW_PROMPT_TEMPLATE = 'performance';

      const config = loadConfig();

      expect(config.gitlabUrl).toBe('https://gitlab.com');
      expect(config.githubToken).toBe('ghp-token');
      expect(config.llmProvider).toBe('ollama');
      expect(config.ollamaEndpoint).toBe('http://localhost:11434');
      expect(config.ollamaModel).toBe('mistral:7b');
      expect(config.reviewLanguage).toBe('english');
      expect(config.maxDiffSize).toBe(50000);
      expect(config.reviewPromptTemplate).toBe('performance');
      expect(config.verbose).toBe(false);
    });
  });
});
