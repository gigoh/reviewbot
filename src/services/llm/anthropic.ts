import Anthropic from '@anthropic-ai/sdk';
import { ILLMClient } from './base';
import { LLMResponse } from '../../types';
import { Logger } from '../../utils/logger';

export class AnthropicClient implements ILLMClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
    });
  }

  async generateCompletion(prompt: string): Promise<LLMResponse> {
    try {
      Logger.debug('Calling Anthropic API for completion');

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';

      return { text };
    } catch (error: any) {
      Logger.error('Failed to generate completion from Anthropic', error);
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }
}
