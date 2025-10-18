export type LLMProvider = 'anthropic' | 'ollama';
export type ReviewLanguage = 'english' | 'korean' | 'japanese' | 'chinese';
export type VCSPlatform = 'gitlab' | 'github';

export interface Config {
  vcsPlatform: VCSPlatform;
  gitlabUrl?: string;
  gitlabToken?: string;
  githubToken?: string;
  llmProvider: LLMProvider;
  anthropicApiKey?: string;
  ollamaEndpoint?: string;
  ollamaModel?: string;
  reviewLanguage: ReviewLanguage;
  maxDiffSize?: number;
  reviewPromptTemplate?: string;
  verbose?: boolean;
}

export interface LLMResponse {
  text: string;
}

export interface MergeRequestInfo {
  platform: VCSPlatform;
  projectId: string | number;
  mrIid: number;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  webUrl: string;
  diffRefs?: {
    baseSha: string;
    headSha: string;
    startSha: string;
  };
}

export interface DiffChange {
  oldPath: string;
  newPath: string;
  diff: string;
  newFile: boolean;
  deletedFile: boolean;
  renamedFile: boolean;
}

export interface ReviewComment {
  filePath: string;
  lineNumber?: number;
  comment: string;
  severity: 'info' | 'suggestion' | 'warning' | 'critical';
}

export interface ReviewResult {
  summary: string;
  comments: ReviewComment[];
  overallAssessment: string;
}
