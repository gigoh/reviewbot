import { Config, DiffChange, MergeRequestInfo, ReviewResult, ReviewComment } from '../types';
import { Logger } from '../utils/logger';
import { ILLMClient } from './llm/base';
import { createLLMClient } from './llm/factory';
import { getPromptTemplate } from './prompts';

export class AIReviewer {
  private llmClient: ILLMClient;
  private maxDiffSize: number;
  private config: Config;

  constructor(config: Config) {
    this.llmClient = createLLMClient(config);
    this.maxDiffSize = config.maxDiffSize || 50000;
    this.config = config;
  }

  /**
   * Review code changes using Claude AI
   */
  async reviewChanges(
    mrInfo: MergeRequestInfo,
    changes: DiffChange[]
  ): Promise<ReviewResult> {
    try {
      Logger.info('Starting AI-powered code review...');

      // Filter out deleted files and binary files
      const relevantChanges = changes.filter(
        (change) => !change.deletedFile && change.diff
      );

      if (relevantChanges.length === 0) {
        return {
          summary: 'No code changes to review (only deletions or binary files)',
          comments: [],
          overallAssessment: 'No review needed',
        };
      }

      // Prepare the diff content
      const diffContent = this.formatDiffsForReview(relevantChanges);

      // Check if diff is too large
      if (diffContent.length > this.maxDiffSize) {
        Logger.warn(
          `Diff size (${diffContent.length}) exceeds max size (${this.maxDiffSize}). Truncating...`
        );
      }

      const truncatedDiff = diffContent.substring(0, this.maxDiffSize);

      // Create the review prompt
      const prompt = this.createReviewPrompt(mrInfo, truncatedDiff);

      // Call LLM API
      Logger.debug('Calling LLM API for code review');
      const response = await this.llmClient.generateCompletion(prompt);

      // Parse the response into structured format
      const result = this.parseReviewResponse(response.text);

      Logger.success('AI review completed successfully');
      return result;
    } catch (error: any) {
      Logger.error('Failed to perform AI review', error);
      throw new Error(`Failed to perform AI review: ${error.message}`);
    }
  }

  /**
   * Format diffs into a readable format for the AI
   */
  private formatDiffsForReview(changes: DiffChange[]): string {
    let formatted = '';

    for (const change of changes) {
      formatted += `\n${'='.repeat(80)}\n`;

      if (change.newFile) {
        formatted += `NEW FILE: ${change.newPath}\n`;
      } else if (change.renamedFile) {
        formatted += `RENAMED: ${change.oldPath} -> ${change.newPath}\n`;
      } else {
        formatted += `FILE: ${change.newPath}\n`;
      }

      formatted += `${'='.repeat(80)}\n`;
      formatted += change.diff;
      formatted += '\n';
    }

    return formatted;
  }

  /**
   * Create the prompt for the LLM to review the code
   */
  private createReviewPrompt(mrInfo: MergeRequestInfo, diffContent: string): string {
    const templateName = this.config.reviewPromptTemplate || 'default';
    const template = getPromptTemplate(templateName);
    return template.generatePrompt(mrInfo, diffContent, this.config.reviewLanguage);
  }

  /**
   * Parse Claude's response into structured ReviewResult
   */
  private parseReviewResponse(reviewText: string): ReviewResult {
    const comments: ReviewComment[] = [];
    let summary = '';
    let overallAssessment = '';

    // Extract summary
    const summaryMatch = reviewText.match(/##\s*Summary\s*\n([\s\S]*?)(?=##|$)/i);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    }

    // Extract overall assessment
    const assessmentMatch = reviewText.match(/##\s*Overall Assessment\s*\n([\s\S]*?)$/i);
    if (assessmentMatch) {
      overallAssessment = assessmentMatch[1].trim();
    }

    // Extract detailed comments
    const commentsMatch = reviewText.match(
      /##\s*Detailed Comments\s*\n([\s\S]*?)(?=##\s*Overall Assessment|$)/i
    );

    if (commentsMatch) {
      const commentsSection = commentsMatch[1];
      const commentLines = commentsSection.split('\n').filter((line) => line.trim().startsWith('-'));

      for (const line of commentLines) {
        const commentMatch = line.match(/\[(.*?)\]\s*([^:]*):?(\d*-?\d*)\s*-\s*(.*)/);
        if (commentMatch) {
          const [, severityRaw, filePath, lineRange, comment] = commentMatch;
          const severity = this.normalizeSeverity(severityRaw);

          comments.push({
            filePath: filePath.trim(),
            lineNumber: lineRange ? parseInt(lineRange.split('-')[0], 10) : undefined,
            comment: comment.trim(),
            severity,
          });
        }
      }
    }

    return {
      summary: summary || 'Review completed',
      comments,
      overallAssessment: overallAssessment || 'No assessment provided',
    };
  }

  /**
   * Normalize severity levels
   */
  private normalizeSeverity(severity: string): 'info' | 'suggestion' | 'warning' | 'critical' {
    const normalized = severity.toLowerCase().trim();

    if (normalized.includes('critical') || normalized.includes('error')) {
      return 'critical';
    }
    if (normalized.includes('warning') || normalized.includes('warn')) {
      return 'warning';
    }
    if (normalized.includes('suggestion') || normalized.includes('suggest')) {
      return 'suggestion';
    }
    return 'info';
  }
}
