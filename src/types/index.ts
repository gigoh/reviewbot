export type LLMProvider = 'anthropic' | 'ollama';

export interface Config {
  gitlabUrl: string;
  gitlabToken: string;
  llmProvider: LLMProvider;
  anthropicApiKey?: string;
  ollamaEndpoint?: string;
  ollamaModel?: string;
  maxDiffSize?: number;
  reviewPromptTemplate?: string;
}

export interface LLMResponse {
  text: string;
}

export interface MergeRequestInfo {
  projectId: string | number;
  mrIid: number;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  webUrl: string;
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
