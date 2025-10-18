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

      const requestPayload = {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user' as const,
            content: prompt,
          },
        ],
      };

      Logger.verboseRequest('Anthropic API', 'POST', requestPayload);

      const response = await this.client.messages.create(requestPayload);

      Logger.verboseResponse('Anthropic API', response.stop_reason || 'completed', {
        id: response.id,
        model: response.model,
        role: response.role,
        content: response.content,
        usage: response.usage,
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';

      return { text };
    } catch (error: any) {
      Logger.error('Failed to generate completion from Anthropic', error);
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }
}
