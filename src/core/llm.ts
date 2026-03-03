import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { env } from './config.js';
import { ApiError, isAbortError } from './errors.js';
import type { FeatureConfig } from './featureRegistry.js';

const openai = createOpenAI({
  apiKey: env.openAiApiKey
});

const buildModel = (provider: FeatureConfig['provider'], model: string) => {
  if (provider === 'openai') {
    return openai(model);
  }
  throw new ApiError(500, 'INTERNAL_ERROR', `Unsupported provider: ${provider}`);
};

export const runLlm = async (input: {
  feature: FeatureConfig;
  userText: string;
  timeoutMs: number;
  fallbackMaxTokens: number;
  signal?: AbortSignal;
}): Promise<string> => {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), input.timeoutMs);
  const signal = input.signal
    ? AbortSignal.any([input.signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const result = await generateText({
      model: buildModel(input.feature.provider, input.feature.model),
      system: input.feature.systemPrompt,
      prompt: input.userText,
      maxTokens: input.feature.maxOutputTokens ?? input.fallbackMaxTokens,
      temperature: input.feature.temperature,
      abortSignal: signal
    });

    return result.text.trim();
  } catch (error) {
    if (isAbortError(error)) {
      throw new ApiError(504, 'PROVIDER_TIMEOUT', 'Upstream provider timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
