import { LLMResponse } from '../../types';

/**
 * Abstract interface for LLM clients
 */
export interface ILLMClient {
  /**
   * Generate a completion from the LLM
   */
  generateCompletion(prompt: string): Promise<LLMResponse>;
}
