import { AIReviewer } from '../../src/services/reviewer';
import { Config, DiffChange, MergeRequestInfo } from '../../src/types';
import * as promptsModule from '../../src/services/prompts';

// Mock the LLM factory
jest.mock('../../src/services/llm/factory', () => ({
  createLLMClient: jest.fn(() => ({
    generateCompletion: jest.fn(),
  })),
}));

describe('AIReviewer with Prompt Templates', () => {
  const mockConfig: Config = {
    llmProvider: 'anthropic',
    anthropicApiKey: 'test-key',
    reviewLanguage: 'english',
    maxDiffSize: 50000,
    reviewPromptTemplate: 'default',
    verbose: false,
  };

  const mockMrInfo: MergeRequestInfo = {
    platform: 'gitlab',
    projectId: 'test/project',
    mrIid: 123,
    title: 'Add authentication',
    description: 'Implement JWT auth',
    sourceBranch: 'feature/auth',
    targetBranch: 'main',
    webUrl: 'https://gitlab.com/test/project/-/merge_requests/123',
  };

  const mockChanges: DiffChange[] = [
    {
      oldPath: 'src/auth.ts',
      newPath: 'src/auth.ts',
      diff: '+function authenticate() { return true; }',
      newFile: false,
      deletedFile: false,
      renamedFile: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Template Selection', () => {
    it('should use default template when reviewPromptTemplate is not specified', async () => {
      const config = { ...mockConfig, reviewPromptTemplate: undefined };
      const reviewer = new AIReviewer(config);
      const getTemplateSpy = jest.spyOn(promptsModule, 'getPromptTemplate');

      const mockLLMResponse = {
        text: `## Summary
Review completed

## Detailed Comments
- [INFO] src/auth.ts:1 - Looks good

## Overall Assessment
APPROVE`,
      };

      (reviewer as any).llmClient.generateCompletion = jest.fn().mockResolvedValue(mockLLMResponse);

      await reviewer.reviewChanges(mockMrInfo, mockChanges);

      expect(getTemplateSpy).toHaveBeenCalledWith('default');
      getTemplateSpy.mockRestore();
    });

    it('should use specified template from config', async () => {
      const config = { ...mockConfig, reviewPromptTemplate: 'security' };
      const reviewer = new AIReviewer(config);
      const getTemplateSpy = jest.spyOn(promptsModule, 'getPromptTemplate');

      const mockLLMResponse = {
        text: `## Security Summary
No critical issues

## Security Issues
- [INFO] src/auth.ts:1 - Consider security review

## Overall Security Assessment
APPROVE`,
      };

      (reviewer as any).llmClient.generateCompletion = jest.fn().mockResolvedValue(mockLLMResponse);

      await reviewer.reviewChanges(mockMrInfo, mockChanges);

      expect(getTemplateSpy).toHaveBeenCalledWith('security');
      getTemplateSpy.mockRestore();
    });

    it('should use concise template when specified', async () => {
      const config = { ...mockConfig, reviewPromptTemplate: 'concise' };
      const reviewer = new AIReviewer(config);
      const getTemplateSpy = jest.spyOn(promptsModule, 'getPromptTemplate');

      const mockLLMResponse = {
        text: `## Summary
Quick review

## Critical Issues
None found

## Overall Assessment
APPROVE`,
      };

      (reviewer as any).llmClient.generateCompletion = jest.fn().mockResolvedValue(mockLLMResponse);

      await reviewer.reviewChanges(mockMrInfo, mockChanges);

      expect(getTemplateSpy).toHaveBeenCalledWith('concise');
      getTemplateSpy.mockRestore();
    });

    it('should use performance template when specified', async () => {
      const config = { ...mockConfig, reviewPromptTemplate: 'performance' };
      const reviewer = new AIReviewer(config);
      const getTemplateSpy = jest.spyOn(promptsModule, 'getPromptTemplate');

      const mockLLMResponse = {
        text: `## Performance Summary
Good performance

## Performance Issues
- [SUGGESTION] src/auth.ts:1 - Consider caching

## Overall Performance Assessment
APPROVE_WITH_SUGGESTIONS`,
      };

      (reviewer as any).llmClient.generateCompletion = jest.fn().mockResolvedValue(mockLLMResponse);

      await reviewer.reviewChanges(mockMrInfo, mockChanges);

      expect(getTemplateSpy).toHaveBeenCalledWith('performance');
      getTemplateSpy.mockRestore();
    });
  });

  describe('Template and Language Integration', () => {
    it('should pass correct language to template', async () => {
      const config = { ...mockConfig, reviewLanguage: 'korean' as const, reviewPromptTemplate: 'default' };
      const reviewer = new AIReviewer(config);

      const mockTemplate = {
        name: 'default',
        description: 'test',
        generatePrompt: jest.fn().mockReturnValue('test prompt'),
      };

      jest.spyOn(promptsModule, 'getPromptTemplate').mockReturnValue(mockTemplate);

      const mockLLMResponse = {
        text: `## Summary
**Korean (한국어):**
검토 완료

**English:**
Review complete

## Overall Assessment
APPROVE`,
      };

      (reviewer as any).llmClient.generateCompletion = jest.fn().mockResolvedValue(mockLLMResponse);

      await reviewer.reviewChanges(mockMrInfo, mockChanges);

      expect(mockTemplate.generatePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockMrInfo.title,
        }),
        expect.any(String),
        'korean'
      );
    });

    it('should work with all language options', async () => {
      const languages = ['english', 'korean', 'japanese', 'chinese'] as const;

      for (const language of languages) {
        const config = { ...mockConfig, reviewLanguage: language };
        const reviewer = new AIReviewer(config);

        const mockTemplate = {
          name: 'default',
          description: 'test',
          generatePrompt: jest.fn().mockReturnValue('test prompt'),
        };

        jest.spyOn(promptsModule, 'getPromptTemplate').mockReturnValue(mockTemplate);

        const mockLLMResponse = {
          text: `## Summary
Review complete

## Overall Assessment
APPROVE`,
        };

        (reviewer as any).llmClient.generateCompletion = jest.fn().mockResolvedValue(mockLLMResponse);

        await reviewer.reviewChanges(mockMrInfo, mockChanges);

        expect(mockTemplate.generatePrompt).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(String),
          language
        );
      }
    });
  });

  describe('Prompt Generation', () => {
    it('should generate prompt with formatted diff content', async () => {
      const reviewer = new AIReviewer(mockConfig);

      const mockTemplate = {
        name: 'default',
        description: 'test',
        generatePrompt: jest.fn().mockReturnValue('test prompt'),
      };

      jest.spyOn(promptsModule, 'getPromptTemplate').mockReturnValue(mockTemplate);

      const mockLLMResponse = {
        text: `## Summary
Review complete

## Overall Assessment
APPROVE`,
      };

      (reviewer as any).llmClient.generateCompletion = jest.fn().mockResolvedValue(mockLLMResponse);

      await reviewer.reviewChanges(mockMrInfo, mockChanges);

      expect(mockTemplate.generatePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockMrInfo.title,
          description: mockMrInfo.description,
          sourceBranch: mockMrInfo.sourceBranch,
          targetBranch: mockMrInfo.targetBranch,
        }),
        expect.stringContaining('FILE: src/auth.ts'),
        'english'
      );
    });

    it('should handle new files correctly', async () => {
      const newFileChanges: DiffChange[] = [
        {
          oldPath: 'src/new.ts',
          newPath: 'src/new.ts',
          diff: '+export const NEW_FEATURE = true;',
          newFile: true,
          deletedFile: false,
          renamedFile: false,
        },
      ];

      const reviewer = new AIReviewer(mockConfig);

      const mockTemplate = {
        name: 'default',
        description: 'test',
        generatePrompt: jest.fn().mockReturnValue('test prompt'),
      };

      jest.spyOn(promptsModule, 'getPromptTemplate').mockReturnValue(mockTemplate);

      const mockLLMResponse = {
        text: `## Summary
New file added

## Overall Assessment
APPROVE`,
      };

      (reviewer as any).llmClient.generateCompletion = jest.fn().mockResolvedValue(mockLLMResponse);

      await reviewer.reviewChanges(mockMrInfo, newFileChanges);

      expect(mockTemplate.generatePrompt).toHaveBeenCalledWith(
        expect.any(Object),
        expect.stringContaining('NEW FILE: src/new.ts'),
        'english'
      );
    });

    it('should handle renamed files correctly', async () => {
      const renamedFileChanges: DiffChange[] = [
        {
          oldPath: 'src/old.ts',
          newPath: 'src/new.ts',
          diff: 'file content',
          newFile: false,
          deletedFile: false,
          renamedFile: true,
        },
      ];

      const reviewer = new AIReviewer(mockConfig);

      const mockTemplate = {
        name: 'default',
        description: 'test',
        generatePrompt: jest.fn().mockReturnValue('test prompt'),
      };

      jest.spyOn(promptsModule, 'getPromptTemplate').mockReturnValue(mockTemplate);

      const mockLLMResponse = {
        text: `## Summary
File renamed

## Overall Assessment
APPROVE`,
      };

      (reviewer as any).llmClient.generateCompletion = jest.fn().mockResolvedValue(mockLLMResponse);

      await reviewer.reviewChanges(mockMrInfo, renamedFileChanges);

      expect(mockTemplate.generatePrompt).toHaveBeenCalledWith(
        expect.any(Object),
        expect.stringContaining('RENAMED: src/old.ts -> src/new.ts'),
        'english'
      );
    });
  });

  describe('Response Parsing', () => {
    it('should parse review response correctly', async () => {
      const reviewer = new AIReviewer(mockConfig);

      const mockLLMResponse = {
        text: `## Summary
This is a good implementation with some minor issues.

## Detailed Comments
- [CRITICAL] src/auth.ts:45 - Password not hashed
- [WARNING] src/auth.ts:67 - Missing error handling
- [SUGGESTION] src/auth.ts:23 - Consider using const
- [INFO] src/auth.ts:10 - Good use of TypeScript

## Overall Assessment
APPROVE_WITH_SUGGESTIONS - Fix critical issues before merging`,
      };

      (reviewer as any).llmClient.generateCompletion = jest.fn().mockResolvedValue(mockLLMResponse);

      const result = await reviewer.reviewChanges(mockMrInfo, mockChanges);

      expect(result.summary).toContain('This is a good implementation');
      expect(result.comments).toHaveLength(4);
      expect(result.comments[0].severity).toBe('critical');
      expect(result.comments[1].severity).toBe('warning');
      expect(result.comments[2].severity).toBe('suggestion');
      expect(result.comments[3].severity).toBe('info');
      expect(result.overallAssessment).toContain('APPROVE_WITH_SUGGESTIONS');
    });

    it('should skip deleted files', async () => {
      const changesWithDeleted: DiffChange[] = [
        ...mockChanges,
        {
          oldPath: 'src/deleted.ts',
          newPath: 'src/deleted.ts',
          diff: '',
          newFile: false,
          deletedFile: true,
          renamedFile: false,
        },
      ];

      const reviewer = new AIReviewer(mockConfig);

      const mockTemplate = {
        name: 'default',
        description: 'test',
        generatePrompt: jest.fn().mockReturnValue('test prompt'),
      };

      jest.spyOn(promptsModule, 'getPromptTemplate').mockReturnValue(mockTemplate);

      const mockLLMResponse = {
        text: `## Summary
Review complete

## Overall Assessment
APPROVE`,
      };

      (reviewer as any).llmClient.generateCompletion = jest.fn().mockResolvedValue(mockLLMResponse);

      await reviewer.reviewChanges(mockMrInfo, changesWithDeleted);

      const promptArg = mockTemplate.generatePrompt.mock.calls[0][1];
      expect(promptArg).not.toContain('deleted.ts');
    });
  });
});
