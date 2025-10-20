import { MergeRequestInfo, ReviewLanguage } from '../types';

export interface PromptTemplate {
  name: string;
  description: string;
  generatePrompt: (
    mrInfo: MergeRequestInfo,
    diffContent: string,
    language: ReviewLanguage
  ) => string;
}

// Default comprehensive review template
const defaultTemplate: PromptTemplate = {
  name: 'default',
  description: 'Comprehensive code review covering quality, best practices, bugs, performance, security, and testing',
  generatePrompt: (mrInfo, diffContent, language) => {
    if (language === 'english') {
      return `You are an expert code reviewer. Please review the following merge request and provide constructive feedback.

**Merge Request Information:**
- Title: ${mrInfo.title}
- Description: ${mrInfo.description || 'No description provided'}
- Source Branch: ${mrInfo.sourceBranch}
- Target Branch: ${mrInfo.targetBranch}

**Code Changes:**
${diffContent}

**Instructions:**
Please provide a thorough code review focusing on:
1. **Code Quality**: Is the code well-structured, readable, and maintainable?
2. **Best Practices**: Does it follow language-specific best practices and conventions?
3. **Potential Bugs**: Are there any potential bugs, edge cases, or error handling issues?
4. **Performance**: Are there any performance concerns or optimization opportunities?
5. **Security**: Are there any security vulnerabilities or concerns?
6. **Testing**: Does the code appear to be testable? Are there missing test cases?

**Output Format:**
Please structure your review as follows:

## Summary
[A brief 2-3 sentence summary of the changes and overall quality]

## Detailed Comments
[List specific issues or suggestions, one per line, in this format:]
- [SEVERITY] file_path:line_range - Description of issue/suggestion
  (where SEVERITY is one of: INFO, SUGGESTION, WARNING, CRITICAL)

## Overall Assessment
[Your final verdict: APPROVE, APPROVE_WITH_SUGGESTIONS, or REQUEST_CHANGES]

Be constructive, specific, and prioritize the most important issues.`;
    }

    // Bilingual template for other languages
    const languageMap = {
      korean: { name: 'Korean', native: '한국어', approveExample: '승인, 수정 제안과 함께 승인, or 변경 요청' },
      japanese: { name: 'Japanese', native: '日本語', approveExample: '承認、提案付き承認、または変更要求' },
      chinese: { name: 'Chinese', native: '中文', approveExample: '批准、建议批准或请求更改' },
    };

    const langInfo = languageMap[language] || languageMap.korean;

    return `You are an expert code reviewer. Please review the following merge request and provide constructive feedback in BOTH ${langInfo.name} and English.

**Merge Request Information:**
- Title: ${mrInfo.title}
- Description: ${mrInfo.description || 'No description provided'}
- Source Branch: ${mrInfo.sourceBranch}
- Target Branch: ${mrInfo.targetBranch}

**Code Changes:**
${diffContent}

**Instructions:**
Please provide a thorough code review focusing on:
1. **Code Quality**: Is the code well-structured, readable, and maintainable?
2. **Best Practices**: Does it follow language-specific best practices and conventions?
3. **Potential Bugs**: Are there any potential bugs, edge cases, or error handling issues?
4. **Performance**: Are there any performance concerns or optimization opportunities?
5. **Security**: Are there any security vulnerabilities or concerns?
6. **Testing**: Does the code appear to be testable? Are there missing test cases?

**IMPORTANT: Provide ALL feedback in BOTH ${langInfo.name} and English.**

**Output Format:**
Please structure your review as follows:

## Summary
**${langInfo.name} (${langInfo.native}):**
[A brief 2-3 sentence summary in ${langInfo.name}]

**English:**
[A brief 2-3 sentence summary in English]

## Detailed Comments
[List specific issues or suggestions, one per line, in this format:]
- [SEVERITY] file_path:line_range - [${langInfo.name} description] / [English description]
  (where SEVERITY is one of: INFO, SUGGESTION, WARNING, CRITICAL)

## Overall Assessment
**${langInfo.name} (${langInfo.native}):**
[Your final verdict in ${langInfo.name}: ${langInfo.approveExample}]

**English:**
[Your final verdict in English: APPROVE, APPROVE_WITH_SUGGESTIONS, or REQUEST_CHANGES]

Be constructive, specific, and prioritize the most important issues. Remember to provide BOTH ${langInfo.name} and English for every section.`;
  },
};

// Concise template for quick reviews
const conciseTemplate: PromptTemplate = {
  name: 'concise',
  description: 'Quick, focused review highlighting only critical issues and major suggestions',
  generatePrompt: (mrInfo, diffContent, language) => {
    const basePrompt = `You are an expert code reviewer. Please provide a CONCISE review of the following merge request, focusing only on critical issues and major improvements.

**Merge Request Information:**
- Title: ${mrInfo.title}
- Description: ${mrInfo.description || 'No description provided'}

**Code Changes:**
${diffContent}

**Instructions:**
Focus ONLY on:
1. Critical bugs or security vulnerabilities
2. Major performance issues
3. Significant architectural concerns

Keep your review brief and to the point. Ignore minor style issues.

**Output Format:**

## Summary
[1-2 sentences max]

## Critical Issues
[Only list CRITICAL or WARNING items:]
- [SEVERITY] file_path:line_range - Brief description

## Overall Assessment
[APPROVE, APPROVE_WITH_SUGGESTIONS, or REQUEST_CHANGES]`;

    if (language === 'english') {
      return basePrompt;
    }

    return basePrompt + `\n\nProvide your review in both ${language} and English.`;
  },
};

// Security-focused template
const securityTemplate: PromptTemplate = {
  name: 'security',
  description: 'Security-focused review emphasizing vulnerabilities, authentication, authorization, and data protection',
  generatePrompt: (mrInfo, diffContent, language) => {
    const basePrompt = `You are a security-focused code reviewer. Please review the following merge request with emphasis on security vulnerabilities and best practices.

**Merge Request Information:**
- Title: ${mrInfo.title}
- Description: ${mrInfo.description || 'No description provided'}
- Source Branch: ${mrInfo.sourceBranch}
- Target Branch: ${mrInfo.targetBranch}

**Code Changes:**
${diffContent}

**Security Review Focus:**
1. **Authentication & Authorization**: Are authentication and authorization properly implemented?
2. **Input Validation**: Is user input properly validated and sanitized?
3. **Injection Vulnerabilities**: SQL injection, command injection, XSS, etc.
4. **Sensitive Data**: Are secrets, API keys, or sensitive data properly handled?
5. **Cryptography**: Are cryptographic operations done correctly?
6. **Dependencies**: Are there known vulnerabilities in dependencies?
7. **Access Control**: Are permissions and access controls properly enforced?
8. **Data Exposure**: Is sensitive data unnecessarily exposed in logs, errors, or responses?

**Output Format:**

## Security Summary
[Brief overview of security posture]

## Security Issues
[List security-related issues:]
- [SEVERITY] file_path:line_range - Security issue description
  (SEVERITY: CRITICAL for exploitable vulnerabilities, WARNING for potential issues, SUGGESTION for improvements)

## Security Recommendations
[List security best practice recommendations]

## Overall Security Assessment
[APPROVE, APPROVE_WITH_SUGGESTIONS, or REQUEST_CHANGES with security justification]`;

    if (language === 'english') {
      return basePrompt;
    }

    return basePrompt + `\n\nProvide your review in both ${language} and English, with security terms in English for clarity.`;
  },
};

// Performance-focused template
const performanceTemplate: PromptTemplate = {
  name: 'performance',
  description: 'Performance-focused review emphasizing optimization, scalability, and resource usage',
  generatePrompt: (mrInfo, diffContent, language) => {
    const basePrompt = `You are a performance-focused code reviewer. Please review the following merge request with emphasis on performance and scalability.

**Merge Request Information:**
- Title: ${mrInfo.title}
- Description: ${mrInfo.description || 'No description provided'}
- Source Branch: ${mrInfo.sourceBranch}
- Target Branch: ${mrInfo.targetBranch}

**Code Changes:**
${diffContent}

**Performance Review Focus:**
1. **Algorithm Complexity**: Are algorithms efficient? Any O(n²) that could be O(n)?
2. **Database Queries**: N+1 queries, missing indexes, inefficient queries?
3. **Memory Usage**: Memory leaks, unnecessary allocations, caching opportunities?
4. **Network Calls**: Unnecessary API calls, missing parallelization, no caching?
5. **Scalability**: Will this scale with increased load?
6. **Resource Management**: Proper cleanup of resources (connections, files, etc.)?
7. **Async Operations**: Are async operations used where appropriate?

**Output Format:**

## Performance Summary
[Brief overview of performance impact]

## Performance Issues
[List performance-related issues:]
- [SEVERITY] file_path:line_range - Performance issue and potential impact
  (Include estimated complexity or impact when possible)

## Optimization Opportunities
[List potential optimizations]

## Overall Performance Assessment
[APPROVE, APPROVE_WITH_SUGGESTIONS, or REQUEST_CHANGES with performance justification]`;

    if (language === 'english') {
      return basePrompt;
    }

    return basePrompt + `\n\nProvide your review in both ${language} and English.`;
  },
};

// Template registry
const templates: Record<string, PromptTemplate> = {
  default: defaultTemplate,
  concise: conciseTemplate,
  security: securityTemplate,
  performance: performanceTemplate,
};

/**
 * Get a prompt template by name
 */
export function getPromptTemplate(templateName: string): PromptTemplate {
  const template = templates[templateName.toLowerCase()];
  if (!template) {
    console.warn(`Unknown template "${templateName}", falling back to default`);
    return templates.default;
  }
  return template;
}

/**
 * Get all available template names and descriptions
 */
export function getAvailableTemplates(): Array<{ name: string; description: string }> {
  return Object.values(templates).map((t) => ({
    name: t.name,
    description: t.description,
  }));
}
