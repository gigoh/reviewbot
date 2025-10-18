import { ILLMClient } from './base';
import { LLMResponse } from '../../types';
import { Logger } from '../../utils/logger';

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export class OllamaClient implements ILLMClient {
  private endpoint: string;
  private model: string;

  constructor(endpoint: string, model: string) {
    this.endpoint = endpoint;
    this.model = model;
  }

  async generateCompletion(prompt: string): Promise<LLMResponse> {
    try {
      Logger.debug(`Calling Ollama API at ${this.endpoint} with model ${this.model}`);

      const requestBody: OllamaGenerateRequest = {
        model: this.model,
        prompt,
        stream: false,
      };

      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Ollama API returned status ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as OllamaGenerateResponse;

      return { text: data.response };
    } catch (error: any) {
      Logger.error('Failed to generate completion from Ollama', error);
      throw new Error(`Ollama API error: ${error.message}`);
    }
  }
}
