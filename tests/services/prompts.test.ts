import { describe, it, expect } from 'bun:test';
import { getPromptTemplate, getAvailableTemplates } from '../../src/services/prompts';
import { MergeRequestInfo, ReviewLanguage } from '../../src/types';

describe('Prompt Templates', () => {
  const mockMrInfo: MergeRequestInfo = {
    platform: 'gitlab',
    projectId: 'test/project',
    mrIid: 123,
    title: 'Add user authentication',
    description: 'Implement JWT-based authentication',
    sourceBranch: 'feature/auth',
    targetBranch: 'main',
    webUrl: 'https://gitlab.com/test/project/-/merge_requests/123',
  };

  const mockDiffContent = `
================================================================================
FILE: src/auth.ts
================================================================================
+function authenticate(user: string, password: string) {
+  return jwt.sign({ user }, SECRET_KEY);
+}
`;

  describe('getAvailableTemplates', () => {
    it('should return all available templates', () => {
      const templates = getAvailableTemplates();

      expect(templates).toHaveLength(4);
      expect(templates.map(t => t.name)).toEqual(['default', 'concise', 'security', 'performance']);

      templates.forEach(template => {
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(typeof template.name).toBe('string');
        expect(typeof template.description).toBe('string');
      });
    });

    it('should have descriptions for all templates', () => {
      const templates = getAvailableTemplates();

      templates.forEach(template => {
        expect(template.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getPromptTemplate', () => {
    it('should return the default template when requested', () => {
      const template = getPromptTemplate('default');

      expect(template).toBeDefined();
      expect(template.name).toBe('default');
      expect(template.description).toContain('Comprehensive');
    });

    it('should return the concise template when requested', () => {
      const template = getPromptTemplate('concise');

      expect(template).toBeDefined();
      expect(template.name).toBe('concise');
      expect(template.description).toContain('Quick');
    });

    it('should return the security template when requested', () => {
      const template = getPromptTemplate('security');

      expect(template).toBeDefined();
      expect(template.name).toBe('security');
      expect(template.description).toContain('Security');
    });

    it('should return the performance template when requested', () => {
      const template = getPromptTemplate('performance');

      expect(template).toBeDefined();
      expect(template.name).toBe('performance');
      expect(template.description).toContain('Performance');
    });

    it('should be case-insensitive when getting templates', () => {
      const template1 = getPromptTemplate('DEFAULT');
      const template2 = getPromptTemplate('default');

      expect(template1.name).toBe(template2.name);
    });

    it('should fallback to default template for unknown template names', () => {
      const originalWarn = console.warn;
      let warnCalled = false;
      let warnMessage = '';
      console.warn = (msg: string) => {
        warnCalled = true;
        warnMessage = msg;
      };

      const template = getPromptTemplate('unknown-template');

      expect(template.name).toBe('default');
      expect(warnCalled).toBe(true);
      expect(warnMessage).toBe('Unknown template "unknown-template", falling back to default');

      console.warn = originalWarn;
    });
  });

  describe('Default Template', () => {
    it('should generate English-only prompt for english language', () => {
      const template = getPromptTemplate('default');
      const prompt = template.generatePrompt(mockMrInfo, mockDiffContent, 'english');

      expect(prompt).toContain('You are an expert code reviewer');
      expect(prompt).toContain(mockMrInfo.title);
      expect(prompt).toContain(mockMrInfo.description);
      expect(prompt).toContain(mockMrInfo.sourceBranch);
      expect(prompt).toContain(mockMrInfo.targetBranch);
      expect(prompt).toContain(mockDiffContent);
      expect(prompt).toContain('Code Quality');
      expect(prompt).toContain('Best Practices');
      expect(prompt).toContain('Potential Bugs');
      expect(prompt).toContain('Performance');
      expect(prompt).toContain('Security');
      expect(prompt).toContain('Testing');
      expect(prompt).toContain('APPROVE, APPROVE_WITH_SUGGESTIONS, or REQUEST_CHANGES');

      // Should NOT contain bilingual markers
      expect(prompt).not.toContain('Korean');
      expect(prompt).not.toContain('Japanese');
      expect(prompt).not.toContain('Chinese');
    });

    it('should generate bilingual prompt for korean language', () => {
      const template = getPromptTemplate('default');
      const prompt = template.generatePrompt(mockMrInfo, mockDiffContent, 'korean');

      expect(prompt).toContain('You are an expert code reviewer');
      expect(prompt).toContain('BOTH Korean and English');
      expect(prompt).toContain('Korean (한국어)');
      expect(prompt).toContain('**English:**');
      expect(prompt).toContain(mockMrInfo.title);
      expect(prompt).toContain(mockDiffContent);
    });

    it('should generate bilingual prompt for japanese language', () => {
      const template = getPromptTemplate('default');
      const prompt = template.generatePrompt(mockMrInfo, mockDiffContent, 'japanese');

      expect(prompt).toContain('BOTH Japanese and English');
      expect(prompt).toContain('Japanese (日本語)');
    });

    it('should generate bilingual prompt for chinese language', () => {
      const template = getPromptTemplate('default');
      const prompt = template.generatePrompt(mockMrInfo, mockDiffContent, 'chinese');

      expect(prompt).toContain('BOTH Chinese and English');
      expect(prompt).toContain('Chinese (中文)');
    });
  });

  describe('Concise Template', () => {
    it('should generate concise prompt focusing on critical issues', () => {
      const template = getPromptTemplate('concise');
      const prompt = template.generatePrompt(mockMrInfo, mockDiffContent, 'english');

      expect(prompt).toContain('CONCISE review');
      expect(prompt).toContain('critical issues');
      expect(prompt).toContain('Critical bugs or security vulnerabilities');
      expect(prompt).toContain('Major performance issues');
      expect(prompt).toContain('architectural concerns');
      expect(prompt).toContain('Keep your review brief');
      expect(prompt).not.toContain('Testing');
    });

    it('should mention bilingual output for non-english languages', () => {
      const template = getPromptTemplate('concise');
      const prompt = template.generatePrompt(mockMrInfo, mockDiffContent, 'korean');

      expect(prompt).toContain('both korean and English');
    });
  });

  describe('Security Template', () => {
    it('should generate security-focused prompt', () => {
      const template = getPromptTemplate('security');
      const prompt = template.generatePrompt(mockMrInfo, mockDiffContent, 'english');

      expect(prompt).toContain('security-focused code reviewer');
      expect(prompt).toContain('security vulnerabilities');
      expect(prompt).toContain('Authentication & Authorization');
      expect(prompt).toContain('Input Validation');
      expect(prompt).toContain('Injection Vulnerabilities');
      expect(prompt).toContain('Sensitive Data');
      expect(prompt).toContain('Cryptography');
      expect(prompt).toContain('Dependencies');
      expect(prompt).toContain('Access Control');
      expect(prompt).toContain('Data Exposure');
      expect(prompt).toContain('Security Summary');
      expect(prompt).toContain('Security Issues');
      expect(prompt).toContain('Security Recommendations');
    });

    it('should mention security terms clarity for non-english languages', () => {
      const template = getPromptTemplate('security');
      const prompt = template.generatePrompt(mockMrInfo, mockDiffContent, 'japanese');

      expect(prompt).toContain('both japanese and English');
      expect(prompt).toContain('security terms in English for clarity');
    });
  });

  describe('Performance Template', () => {
    it('should generate performance-focused prompt', () => {
      const template = getPromptTemplate('performance');
      const prompt = template.generatePrompt(mockMrInfo, mockDiffContent, 'english');

      expect(prompt).toContain('performance-focused code reviewer');
      expect(prompt).toContain('performance and scalability');
      expect(prompt).toContain('Algorithm Complexity');
      expect(prompt).toContain('Database Queries');
      expect(prompt).toContain('Memory Usage');
      expect(prompt).toContain('Network Calls');
      expect(prompt).toContain('Scalability');
      expect(prompt).toContain('Resource Management');
      expect(prompt).toContain('Async Operations');
      expect(prompt).toContain('Performance Summary');
      expect(prompt).toContain('Performance Issues');
      expect(prompt).toContain('Optimization Opportunities');
    });

    it('should support bilingual output', () => {
      const template = getPromptTemplate('performance');
      const prompt = template.generatePrompt(mockMrInfo, mockDiffContent, 'chinese');

      expect(prompt).toContain('both chinese and English');
    });
  });

  describe('Template Integration', () => {
    it('should include all required MR information in all templates', () => {
      const templateNames = ['default', 'concise', 'security', 'performance'];

      templateNames.forEach(templateName => {
        const template = getPromptTemplate(templateName);
        const prompt = template.generatePrompt(mockMrInfo, mockDiffContent, 'english');

        expect(prompt).toContain(mockMrInfo.title);
        expect(prompt).toContain(mockDiffContent);
      });
    });

    it('should handle empty description gracefully', () => {
      const mrInfoNoDesc: MergeRequestInfo = {
        ...mockMrInfo,
        description: '',
      };

      const template = getPromptTemplate('default');
      const prompt = template.generatePrompt(mrInfoNoDesc, mockDiffContent, 'english');

      expect(prompt).toContain('No description provided');
    });

    it('should handle all ReviewLanguage types', () => {
      const languages: ReviewLanguage[] = ['english', 'korean', 'japanese', 'chinese'];
      const template = getPromptTemplate('default');

      languages.forEach(lang => {
        const prompt = template.generatePrompt(mockMrInfo, mockDiffContent, lang);
        expect(prompt).toBeDefined();
        expect(prompt.length).toBeGreaterThan(100);
      });
    });
  });
});
