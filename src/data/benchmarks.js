// Approximate benchmark scores, Q1 2026 public evaluations
// Composite score = weighted average: MMLU 25%, HumanEval 25%, SWE-bench 25%, MATH 25%

export const BENCHMARKS = {
  // ─── Current-generation flagship models ────────────────────────────────────
  'claude-opus-4.6':   { mmlu: 92, humaneval: 93, swe_bench: 65, math: 88 },
  'claude-sonnet-4.6': { mmlu: 89, humaneval: 90, swe_bench: 60, math: 84 },
  'claude-haiku-4.5':  { mmlu: 84, humaneval: 82, swe_bench: 45, math: 72 },
  'gpt-5.4':           { mmlu: 91, humaneval: 92, swe_bench: 62, math: 87 },
  'gpt-5':             { mmlu: 87, humaneval: 86, swe_bench: 50, math: 78 },
  'gpt-5-mini':        { mmlu: 80, humaneval: 78, swe_bench: 38, math: 68 },
  'gemini-3.1-pro':    { mmlu: 90, humaneval: 89, swe_bench: 58, math: 85 },
  'gemini-2.5-pro':    { mmlu: 88, humaneval: 87, swe_bench: 55, math: 82 },
  'gemini-2.5-flash':  { mmlu: 82, humaneval: 79, swe_bench: 40, math: 70 },
  'grok-4-frontier':   { mmlu: 88, humaneval: 85, swe_bench: 52, math: 80 },
  'grok-4-mid':        { mmlu: 88, humaneval: 85, swe_bench: 52, math: 80 },
  'grok-4.1-fast':     { mmlu: 75, humaneval: 70, swe_bench: 30, math: 60 },

  // ─── Legacy / older-generation models (still available via API) ────────────
  'claude-3-opus':      { mmlu: 86, humaneval: 85, swe_bench: 48, math: 75 },
  'claude-3.5-sonnet':  { mmlu: 88, humaneval: 88, swe_bench: 55, math: 82 },
  'claude-3.5-haiku':   { mmlu: 82, humaneval: 78, swe_bench: 40, math: 68 },
  'gpt-4.1':            { mmlu: 86, humaneval: 84, swe_bench: 54, math: 79 },
  'gpt-4o':             { mmlu: 87, humaneval: 85, swe_bench: 48, math: 76 },
  'gpt-4o-mini':        { mmlu: 79, humaneval: 75, swe_bench: 34, math: 65 },
  'o3':                 { mmlu: 90, humaneval: 91, swe_bench: 58, math: 90 },
  'o4-mini':            { mmlu: 86, humaneval: 87, swe_bench: 50, math: 85 },
  'gemini-2.0-flash':   { mmlu: 78, humaneval: 73, swe_bench: 33, math: 63 },
  'gemini-1.5-pro':     { mmlu: 82, humaneval: 78, swe_bench: 40, math: 70 },
  'grok-3':             { mmlu: 84, humaneval: 80, swe_bench: 42, math: 73 },

  // ─── Open Source — cheapest cloud inference (Together AI / Fireworks) ──────
  'deepseek-v3':        { mmlu: 86, humaneval: 84, swe_bench: 50, math: 80 },
  'deepseek-r1':        { mmlu: 85, humaneval: 83, swe_bench: 49, math: 92 },
  'llama-4-maverick':   { mmlu: 85, humaneval: 82, swe_bench: 47, math: 76 },
  'llama-4-scout':      { mmlu: 80, humaneval: 77, swe_bench: 38, math: 68 },
  'llama-3.3-70b':      { mmlu: 79, humaneval: 76, swe_bench: 35, math: 65 },
  'qwen-3-235b':        { mmlu: 85, humaneval: 83, swe_bench: 48, math: 78 },
  'qwen-3-72b':         { mmlu: 81, humaneval: 78, swe_bench: 40, math: 71 },
  'mistral-large-2':    { mmlu: 82, humaneval: 79, swe_bench: 41, math: 72 },
};

export function getCompositeScore(modelId) {
  const b = BENCHMARKS[modelId];
  if (!b) return 0;
  return (b.mmlu + b.humaneval + b.swe_bench + b.math) / 4;
}

export const BENCHMARK_LABELS = {
  mmlu: 'MMLU',
  humaneval: 'HumanEval',
  swe_bench: 'SWE-bench',
  math: 'MATH',
  composite: 'Composite',
};
