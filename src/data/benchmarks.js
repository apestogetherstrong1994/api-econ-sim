// Approximate benchmark scores, Q1 2026 public evaluations
// Composite score = weighted average: MMLU 25%, HumanEval 25%, SWE-bench 25%, MATH 25%

export const BENCHMARKS = {
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
