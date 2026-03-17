// All prices per 1M tokens (USD), March 2026
// Source: Official pricing pages for each provider

export const PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    color: '#D4A574',
    models: {
      'claude-opus-4.6': {
        name: 'Claude Opus 4.6',
        tier: 'frontier',
        input: 5.00,
        output: 25.00,
        cacheWrite: 6.25,
        cacheRead: 0.50,
        batchInput: 2.50,
        batchOutput: 12.50,
        contextWindow: 200000,
        longContextMultiplier: 2.0,
      },
      'claude-sonnet-4.6': {
        name: 'Claude Sonnet 4.6',
        tier: 'mid',
        input: 3.00,
        output: 15.00,
        cacheWrite: 3.75,
        cacheRead: 0.30,
        batchInput: 1.50,
        batchOutput: 7.50,
        contextWindow: 200000,
      },
      'claude-haiku-4.5': {
        name: 'Claude Haiku 4.5',
        tier: 'budget',
        input: 1.00,
        output: 5.00,
        cacheWrite: 1.25,
        cacheRead: 0.10,
        batchInput: 0.50,
        batchOutput: 2.50,
        contextWindow: 200000,
      },
    },
  },
  openai: {
    name: 'OpenAI',
    color: '#10B981',
    models: {
      'gpt-5.4': {
        name: 'GPT-5.4',
        tier: 'frontier',
        input: 2.50,
        output: 10.00,
        cacheRead: 0.625,
        batchInput: 1.25,
        batchOutput: 5.00,
        contextWindow: 1050000,
      },
      'gpt-5': {
        name: 'GPT-5',
        tier: 'mid',
        input: 1.25,
        output: 10.00,
        cacheRead: 0.125,
        batchInput: 0.625,
        batchOutput: 5.00,
        contextWindow: 128000,
      },
      'gpt-5-mini': {
        name: 'GPT-5 Mini',
        tier: 'budget',
        input: 0.25,
        output: 2.00,
        cacheRead: 0.025,
        contextWindow: 128000,
      },
    },
  },
  google: {
    name: 'Google',
    color: '#4285F4',
    models: {
      'gemini-3.1-pro': {
        name: 'Gemini 3.1 Pro',
        tier: 'frontier',
        input: 2.00,
        output: 12.00,
        inputOver200k: 4.00,
        outputOver200k: 18.00,
        contextWindow: 1000000,
      },
      'gemini-2.5-pro': {
        name: 'Gemini 2.5 Pro',
        tier: 'mid',
        input: 1.25,
        output: 10.00,
        inputOver200k: 2.50,
        outputOver200k: 15.00,
        cacheRead: 0.3125,
        contextWindow: 1000000,
      },
      'gemini-2.5-flash': {
        name: 'Gemini 2.5 Flash',
        tier: 'budget',
        input: 0.30,
        output: 2.50,
        cacheRead: 0.0375,
        contextWindow: 1000000,
      },
    },
  },
  xai: {
    name: 'xAI',
    color: '#EF4444',
    models: {
      'grok-4-frontier': {
        name: 'Grok 4',
        tier: 'frontier',
        input: 3.00,
        output: 15.00,
        cacheRead: 0.30,
        contextWindow: 2000000,
      },
      'grok-4-mid': {
        name: 'Grok 4',
        tier: 'mid',
        input: 3.00,
        output: 15.00,
        cacheRead: 0.30,
        contextWindow: 2000000,
      },
      'grok-4.1-fast': {
        name: 'Grok 4.1 Fast',
        tier: 'budget',
        input: 0.20,
        output: 0.50,
        cacheRead: 0.02,
        contextWindow: 2000000,
      },
    },
  },
};

// Tier mapping: which model each provider uses at each quality tier
export const TIER_MAP = {
  frontier: {
    anthropic: 'claude-opus-4.6',
    openai: 'gpt-5.4',
    google: 'gemini-3.1-pro',
    xai: 'grok-4-frontier',
  },
  mid: {
    anthropic: 'claude-sonnet-4.6',
    openai: 'gpt-5',
    google: 'gemini-2.5-pro',
    xai: 'grok-4-mid',
  },
  budget: {
    anthropic: 'claude-haiku-4.5',
    openai: 'gpt-5-mini',
    google: 'gemini-2.5-flash',
    xai: 'grok-4.1-fast',
  },
};

export const PROVIDER_ORDER = ['anthropic', 'openai', 'google', 'xai'];

// Helper to get model by provider and tier
export function getModelForTier(providerId, tier) {
  const modelId = TIER_MAP[tier]?.[providerId];
  if (!modelId) return null;
  return PROVIDERS[providerId]?.models[modelId] || null;
}

// ─── Additional models for Price-Performance Frontier (Section 06 only) ─────
// These are older-generation and open-source models that don't participate
// in the main tier-based cost comparison (Sections 01-05, 07).

export const FRONTIER_PROVIDER_INFO = {
  opensource: { name: 'Open Source', color: '#A78BFA' },
};

export const FRONTIER_EXTRA_MODELS = [
  // Anthropic Legacy — still available via API
  { id: 'claude-3-opus',      name: 'Claude 3 Opus',      providerId: 'anthropic', input: 15.00, output: 75.00, contextWindow: 200000, tier: 'legacy' },
  { id: 'claude-3.5-sonnet',  name: 'Claude 3.5 Sonnet',  providerId: 'anthropic', input: 3.00,  output: 15.00, contextWindow: 200000, tier: 'legacy' },
  { id: 'claude-3.5-haiku',   name: 'Claude 3.5 Haiku',   providerId: 'anthropic', input: 0.80,  output: 4.00,  contextWindow: 200000, tier: 'legacy' },

  // OpenAI Additional — still available via API
  { id: 'gpt-4.1',      name: 'GPT-4.1',      providerId: 'openai', input: 2.00, output: 8.00,  contextWindow: 1050000, tier: 'mid' },
  { id: 'gpt-4o',       name: 'GPT-4o',        providerId: 'openai', input: 2.50, output: 10.00, contextWindow: 128000,  tier: 'mid' },
  { id: 'gpt-4o-mini',  name: 'GPT-4o Mini',   providerId: 'openai', input: 0.15, output: 0.60,  contextWindow: 128000,  tier: 'budget' },
  { id: 'o3',           name: 'o3',             providerId: 'openai', input: 2.00, output: 8.00,  contextWindow: 200000,  tier: 'frontier' },
  { id: 'o4-mini',      name: 'o4-mini',        providerId: 'openai', input: 1.10, output: 4.40,  contextWindow: 200000,  tier: 'mid' },

  // Google Additional — still available via API
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', providerId: 'google', input: 0.10, output: 0.40, contextWindow: 1000000, tier: 'budget' },
  { id: 'gemini-1.5-pro',   name: 'Gemini 1.5 Pro',   providerId: 'google', input: 1.25, output: 5.00, contextWindow: 2000000, tier: 'legacy' },

  // xAI Legacy
  { id: 'grok-3', name: 'Grok 3', providerId: 'xai', input: 3.00, output: 15.00, contextWindow: 131072, tier: 'legacy' },

  // Open Source — priced at cheapest cloud inference (Together AI / Fireworks)
  { id: 'deepseek-v3',       name: 'DeepSeek-V3',       providerId: 'opensource', input: 0.20, output: 0.90, contextWindow: 131072,  tier: 'mid' },
  { id: 'deepseek-r1',       name: 'DeepSeek-R1',       providerId: 'opensource', input: 0.55, output: 2.19, contextWindow: 131072,  tier: 'frontier' },
  { id: 'llama-4-maverick',  name: 'Llama 4 Maverick',  providerId: 'opensource', input: 0.27, output: 0.85, contextWindow: 1000000, tier: 'frontier' },
  { id: 'llama-4-scout',     name: 'Llama 4 Scout',     providerId: 'opensource', input: 0.18, output: 0.30, contextWindow: 512000,  tier: 'mid' },
  { id: 'llama-3.3-70b',     name: 'Llama 3.3 70B',     providerId: 'opensource', input: 0.12, output: 0.30, contextWindow: 131072,  tier: 'budget' },
  { id: 'qwen-3-235b',       name: 'Qwen 3 235B',       providerId: 'opensource', input: 0.50, output: 1.50, contextWindow: 131072,  tier: 'frontier' },
  { id: 'qwen-3-72b',        name: 'Qwen 3 72B',        providerId: 'opensource', input: 0.20, output: 0.60, contextWindow: 131072,  tier: 'mid' },
  { id: 'mistral-large-2',   name: 'Mistral Large 2',   providerId: 'opensource', input: 0.80, output: 2.40, contextWindow: 131072,  tier: 'frontier' },
];
