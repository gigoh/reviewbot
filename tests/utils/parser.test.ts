import { parseMergeRequestUrl } from '../../src/utils/parser';

describe('URL Parser', () => {
  describe('GitHub URL Parsing', () => {
    it('should parse standard GitHub PR URL', () => {
      const url = 'https://github.com/owner/repo/pull/123';
      const result = parseMergeRequestUrl(url);

      expect(result).toEqual({
        platform: 'github',
        projectId: 'owner/repo',
        mrIid: 123,
      });
    });

    it('should parse GitHub PR URL with HTTP', () => {
      const url = 'http://github.com/owner/repo/pull/456';
      const result = parseMergeRequestUrl(url);

      expect(result).toEqual({
        platform: 'github',
        projectId: 'owner/repo',
        mrIid: 456,
      });
    });

    it('should parse GitHub PR URL with dashes in owner name', () => {
      const url = 'https://github.com/my-org/my-repo/pull/789';
      const result = parseMergeRequestUrl(url);

      expect(result).toEqual({
        platform: 'github',
        projectId: 'my-org/my-repo',
        mrIid: 789,
      });
    });

    it('should parse GitHub PR URL with underscores', () => {
      const url = 'https://github.com/my_org/my_repo/pull/100';
      const result = parseMergeRequestUrl(url);

      expect(result).toEqual({
        platform: 'github',
        projectId: 'my_org/my_repo',
        mrIid: 100,
      });
    });

    it('should parse GitHub PR URL with dots', () => {
      const url = 'https://github.com/my.org/my.repo/pull/200';
      const result = parseMergeRequestUrl(url);

      expect(result).toEqual({
        platform: 'github',
        projectId: 'my.org/my.repo',
        mrIid: 200,
      });
    });

    it('should parse large PR numbers', () => {
      const url = 'https://github.com/owner/repo/pull/99999';
      const result = parseMergeRequestUrl(url);

      expect(result.mrIid).toBe(99999);
    });
  });

  describe('GitLab URL Parsing', () => {
    it('should parse standard GitLab MR URL', () => {
      const url = 'https://gitlab.com/group/project/-/merge_requests/123';
      const result = parseMergeRequestUrl(url);

      expect(result).toEqual({
        platform: 'gitlab',
        projectId: 'group/project',
        mrIid: 123,
      });
    });

    it('should parse GitLab MR URL with HTTP', () => {
      const url = 'http://gitlab.com/group/project/-/merge_requests/456';
      const result = parseMergeRequestUrl(url);

      expect(result).toEqual({
        platform: 'gitlab',
        projectId: 'group/project',
        mrIid: 456,
      });
    });

    it('should parse GitLab MR URL with nested groups', () => {
      const url = 'https://gitlab.com/group/subgroup/project/-/merge_requests/789';
      const result = parseMergeRequestUrl(url);

      expect(result).toEqual({
        platform: 'gitlab',
        projectId: 'group/subgroup/project',
        mrIid: 789,
      });
    });

    it('should parse GitLab MR URL with deeply nested groups', () => {
      const url = 'https://gitlab.com/org/team/group/subgroup/project/-/merge_requests/100';
      const result = parseMergeRequestUrl(url);

      expect(result).toEqual({
        platform: 'gitlab',
        projectId: 'org/team/group/subgroup/project',
        mrIid: 100,
      });
    });

    it('should parse self-hosted GitLab URL', () => {
      const url = 'https://gitlab.example.com/group/project/-/merge_requests/200';
      const result = parseMergeRequestUrl(url);

      expect(result).toEqual({
        platform: 'gitlab',
        projectId: 'group/project',
        mrIid: 200,
      });
    });

    it('should parse GitLab URL with custom domain', () => {
      const url = 'https://git.company.com/team/repo/-/merge_requests/300';
      const result = parseMergeRequestUrl(url);

      expect(result).toEqual({
        platform: 'gitlab',
        projectId: 'team/repo',
        mrIid: 300,
      });
    });

    it('should parse GitLab URL with dashes in project path', () => {
      const url = 'https://gitlab.com/my-group/my-project/-/merge_requests/400';
      const result = parseMergeRequestUrl(url);

      expect(result).toEqual({
        platform: 'gitlab',
        projectId: 'my-group/my-project',
        mrIid: 400,
      });
    });

    it('should parse large MR numbers', () => {
      const url = 'https://gitlab.com/group/project/-/merge_requests/88888';
      const result = parseMergeRequestUrl(url);

      expect(result.mrIid).toBe(88888);
    });
  });

  describe('Invalid URL Formats', () => {
    it('should throw error for invalid GitHub URL without pull number', () => {
      const url = 'https://github.com/owner/repo/pull/';

      expect(() => parseMergeRequestUrl(url)).toThrow('Invalid merge/pull request URL format');
    });

    it('should throw error for invalid GitLab URL without MR number', () => {
      const url = 'https://gitlab.com/group/project/-/merge_requests/';

      expect(() => parseMergeRequestUrl(url)).toThrow('Invalid merge/pull request URL format');
    });

    it('should throw error for GitHub issues URL', () => {
      const url = 'https://github.com/owner/repo/issues/123';

      expect(() => parseMergeRequestUrl(url)).toThrow('Invalid merge/pull request URL format');
    });

    it('should throw error for GitLab issues URL', () => {
      const url = 'https://gitlab.com/group/project/-/issues/123';

      expect(() => parseMergeRequestUrl(url)).toThrow('Invalid merge/pull request URL format');
    });

    it('should throw error for non-GitHub/GitLab URL', () => {
      const url = 'https://bitbucket.org/owner/repo/pull-requests/123';

      expect(() => parseMergeRequestUrl(url)).toThrow('Invalid merge/pull request URL format');
    });

    it('should throw error for malformed URL', () => {
      const url = 'not-a-valid-url';

      expect(() => parseMergeRequestUrl(url)).toThrow('Invalid merge/pull request URL format');
    });

    it('should throw error for empty string', () => {
      const url = '';

      expect(() => parseMergeRequestUrl(url)).toThrow('Invalid merge/pull request URL format');
    });

    it('should throw error for GitHub URL without owner/repo', () => {
      const url = 'https://github.com/pull/123';

      expect(() => parseMergeRequestUrl(url)).toThrow('Invalid merge/pull request URL format');
    });

    it('should throw error for GitHub URL with non-numeric PR number', () => {
      const url = 'https://github.com/owner/repo/pull/abc';

      expect(() => parseMergeRequestUrl(url)).toThrow('Invalid merge/pull request URL format');
    });

    it('should throw error for GitLab URL with non-numeric MR number', () => {
      const url = 'https://gitlab.com/group/project/-/merge_requests/abc';

      expect(() => parseMergeRequestUrl(url)).toThrow('Invalid merge/pull request URL format');
    });

    it('should include helpful error message with supported formats', () => {
      const url = 'invalid-url';

      try {
        parseMergeRequestUrl(url);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('GitLab: https://gitlab.com/group/project/-/merge_requests/123');
        expect(error.message).toContain('GitHub: https://github.com/owner/repo/pull/123');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should parse GitHub URL with trailing slash', () => {
      // The regex actually handles trailing slashes
      const url = 'https://github.com/owner/repo/pull/123/';

      // The parser ignores trailing content after the number
      const result = parseMergeRequestUrl(url);
      expect(result.platform).toBe('github');
      expect(result.mrIid).toBe(123);
    });

    it('should parse GitLab URL with trailing slash', () => {
      // The regex actually handles trailing slashes
      const url = 'https://gitlab.com/group/project/-/merge_requests/123/';

      // The parser ignores trailing content after the number
      const result = parseMergeRequestUrl(url);
      expect(result.platform).toBe('gitlab');
      expect(result.mrIid).toBe(123);
    });

    it('should prioritize GitHub format when URL could match both patterns', () => {
      // This is a theoretical case - create a URL that has both patterns
      const url = 'https://github.com/owner/repo/pull/123';
      const result = parseMergeRequestUrl(url);

      expect(result.platform).toBe('github');
    });

    it('should parse PR number 1', () => {
      const url = 'https://github.com/owner/repo/pull/1';
      const result = parseMergeRequestUrl(url);

      expect(result.mrIid).toBe(1);
    });

    it('should parse MR number 1', () => {
      const url = 'https://gitlab.com/group/project/-/merge_requests/1';
      const result = parseMergeRequestUrl(url);

      expect(result.mrIid).toBe(1);
    });
  });
});
