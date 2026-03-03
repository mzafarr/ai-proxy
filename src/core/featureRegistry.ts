export type LlmProvider = 'openai';

export type FeatureConfig = {
  provider: LlmProvider;
  model: string;
  maxOutputTokens?: number;
  temperature: number;
  systemPrompt: string;
};

const featureRegistry = {
  text_improve: {
    provider: 'openai',
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    systemPrompt:
      'You improve writing for clarity and correctness. Return only the improved text with no explanations.'
  },
  summarize: {
    provider: 'openai',
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    systemPrompt:
      'You summarize text concisely while preserving key meaning. Return only the summary.'
  }
} satisfies Record<string, FeatureConfig>;

export type FeatureName = keyof typeof featureRegistry;

export const getFeatureConfig = (feature: string): FeatureConfig | null => {
  return featureRegistry[feature as FeatureName] ?? null;
};
