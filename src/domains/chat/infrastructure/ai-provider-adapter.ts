import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface SendMessageParams {
  message: string;
  context: string;
  lang: 'en' | 'vi';
}

export type StreamChunk = string;

export interface AIProvider {
  sendMessage(params: SendMessageParams): AsyncIterable<StreamChunk>;
}

const MAX_TOKENS = 800;

function buildSystemPrompt(context: string, lang: 'en' | 'vi'): string {
  const instruction =
    lang === 'vi'
      ? 'Bạn là trợ lý của Jeremy. Chỉ trả lời dựa trên ngữ cảnh bên dưới. Nếu không biết, hãy nói rõ. Trả lời bằng tiếng Việt.'
      : "You are Jeremy's assistant. Answer ONLY from the context below. If unknown, say so. Respond in English.";
  return `${instruction}\n\nContext:\n${context}`;
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI | null = null;

  constructor(apiKey: string | undefined) {
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  async *sendMessage(params: SendMessageParams): AsyncIterable<StreamChunk> {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }

    const stream = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(params.context, params.lang) },
        { role: 'user', content: params.message },
      ],
      max_tokens: MAX_TOKENS,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}

class GeminiProvider implements AIProvider {
  private apiKey: string | undefined;

  constructor(apiKey: string | undefined) {
    this.apiKey = apiKey;
  }

  async *sendMessage(params: SendMessageParams): AsyncIterable<StreamChunk> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const model = 'gemini-2.0-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;

    const body = {
      contents: [
        { role: 'user', parts: [{ text: buildSystemPrompt(params.context, params.lang) }] },
        { role: 'user', parts: [{ text: params.message }] },
      ],
      generationConfig: { maxOutputTokens: MAX_TOKENS },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const json = trimmed.slice(6).trim();
          if (json === '[DONE]') return;
          if (!json) continue;

          try {
            const parsed = JSON.parse(json);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield text;
          } catch {
            // ignore malformed JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

class ClaudeProvider implements AIProvider {
  private client: Anthropic | null = null;

  constructor(apiKey: string | undefined) {
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  async *sendMessage(params: SendMessageParams): AsyncIterable<StreamChunk> {
    if (!this.client) {
      throw new Error('Anthropic API key not configured');
    }

    const stream = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: MAX_TOKENS,
      system: buildSystemPrompt(params.context, params.lang),
      messages: [{ role: 'user', content: params.message }],
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        const delta = event.delta as { text?: string };
        if (delta.text) {
          yield delta.text;
        }
      }
    }
  }
}

export function createProviderChain(env: {
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
}): AIProvider[] {
  return [
    new OpenAIProvider(env.OPENAI_API_KEY),
    new GeminiProvider(env.GEMINI_API_KEY),
    new ClaudeProvider(env.ANTHROPIC_API_KEY),
  ];
}

export async function* sendMessageWithFallback(
  params: SendMessageParams,
  env: {
    OPENAI_API_KEY?: string;
    GEMINI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
  }
): AsyncIterable<StreamChunk> {
  const providers = createProviderChain(env);
  let lastError: Error | undefined;

  for (const provider of providers) {
    try {
      yield* provider.sendMessage(params);
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('All AI providers failed');
}
