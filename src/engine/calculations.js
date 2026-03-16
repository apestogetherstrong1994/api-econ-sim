import { PROVIDERS, PROVIDER_ORDER, getModelForTier } from '../data/providers';
import { BENCHMARKS, getCompositeScore } from '../data/benchmarks';

// ─── Formatting Utilities ────────────────────────────────────────────────────

export function formatCurrency(n, decimals = 0) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatCompact(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatPercent(n, decimals = 1) {
  return `${(n * 100).toFixed(decimals)}%`;
}

export function formatCostPer(n) {
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 0.01) return `$${n.toFixed(5)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

// ─── Core Cost Formula ───────────────────────────────────────────────────────
// Implements PRD Section 5 calculation

export function calculateModelCost(model, workload) {
  const {
    monthlyRequests: R,
    avgInputTokens: I,
    avgOutputTokens: O,
    cacheHitRate: C,
    batchEligiblePct: B,
    longContextPct: L,
  } = workload;

  if (!model) {
    return {
      inputCost: 0, outputCost: 0, cacheSavings: 0, batchSavings: 0,
      longContextPremium: 0, grossCost: 0, netCost: 0, costPerRequest: 0,
      modelName: 'N/A',
    };
  }

  const totalInputTokens = R * I;
  const totalOutputTokens = R * O;

  // Split input tokens by caching
  const cachedInputTokens = totalInputTokens * C;
  const freshInputTokens = totalInputTokens * (1 - C);

  // Input cost: fresh tokens at full price, cached tokens at cache read price
  const Pi = model.input;
  const Pcr = model.cacheRead ?? model.input; // If no cache pricing, full price
  const hasCaching = model.cacheRead !== undefined;

  const freshInputCost = (freshInputTokens / 1_000_000) * Pi;
  const cachedInputCost = hasCaching
    ? (cachedInputTokens / 1_000_000) * Pcr
    : (cachedInputTokens / 1_000_000) * Pi;

  const inputCost = freshInputCost + cachedInputCost;

  // Cache savings = what we saved vs paying full price for everything
  const fullInputCost = (totalInputTokens / 1_000_000) * Pi;
  const cacheSavings = fullInputCost - inputCost;

  // Output cost
  const outputCost = (totalOutputTokens / 1_000_000) * model.output;

  // Long context premium
  let longContextPremium = 0;
  if (L > 0) {
    if (model.inputOver200k) {
      // Google-style: different pricing tiers
      const lcInputExtra = (totalInputTokens * L / 1_000_000) * (model.inputOver200k - model.input);
      const lcOutputExtra = (totalOutputTokens * L / 1_000_000) * ((model.outputOver200k || model.output) - model.output);
      longContextPremium = lcInputExtra + lcOutputExtra;
    } else if (model.longContextMultiplier) {
      // Anthropic-style: multiplier
      const mult = model.longContextMultiplier - 1;
      longContextPremium = L * (inputCost + outputCost) * mult;
    }
  }

  // Batch savings
  const hasBatch = model.batchInput !== undefined;
  let batchSavings = 0;
  if (hasBatch && B > 0) {
    const batchInputSavings = (totalInputTokens * B / 1_000_000) * (model.input - model.batchInput);
    const batchOutputSavings = (totalOutputTokens * B / 1_000_000) * (model.output - model.batchOutput);
    batchSavings = batchInputSavings + batchOutputSavings;
  }

  const grossCost = inputCost + outputCost + longContextPremium;
  const netCost = grossCost - batchSavings;

  return {
    modelName: model.name,
    inputCost: freshInputCost + cachedInputCost,
    outputCost,
    cacheSavings,
    batchSavings,
    longContextPremium,
    grossCost,
    netCost: Math.max(0, netCost),
    costPerRequest: R > 0 ? Math.max(0, netCost) / R : 0,
    inputPrice: model.input,
    outputPrice: model.output,
    hasCaching,
    hasBatch,
  };
}

// ─── All-Provider Cost Comparison ────────────────────────────────────────────

export function calculateAllProviderCosts(workload) {
  const tier = workload.qualityTier;

  if (tier === 'routing') {
    return calculateRoutingCosts(
      workload,
      workload.routingSplit || { budget: 0.70, mid: 0.25, frontier: 0.05 }
    );
  }

  return PROVIDER_ORDER.map((providerId) => {
    const model = getModelForTier(providerId, tier);
    const cost = calculateModelCost(model, workload);
    return {
      providerId,
      providerName: PROVIDERS[providerId].name,
      color: PROVIDERS[providerId].color,
      ...cost,
    };
  });
}

// ─── Multi-Model Routing ─────────────────────────────────────────────────────

export function calculateRoutingCosts(workload, routingSplit) {
  return PROVIDER_ORDER.map((providerId) => {
    let totalNet = 0;
    let totalGross = 0;
    let totalCacheSavings = 0;
    let totalBatchSavings = 0;
    let totalLongContextPremium = 0;
    let totalInputCost = 0;
    let totalOutputCost = 0;
    const tierBreakdown = {};

    for (const [tier, pct] of Object.entries(routingSplit)) {
      if (pct <= 0) continue;
      const model = getModelForTier(providerId, tier);
      const tierWorkload = { ...workload, monthlyRequests: workload.monthlyRequests * pct };
      const cost = calculateModelCost(model, tierWorkload);
      tierBreakdown[tier] = { model: model?.name, pct, ...cost };
      totalNet += cost.netCost;
      totalGross += cost.grossCost;
      totalCacheSavings += cost.cacheSavings;
      totalBatchSavings += cost.batchSavings;
      totalLongContextPremium += cost.longContextPremium;
      totalInputCost += cost.inputCost;
      totalOutputCost += cost.outputCost;
    }

    return {
      providerId,
      providerName: PROVIDERS[providerId].name,
      color: PROVIDERS[providerId].color,
      modelName: 'Routing Mix',
      inputCost: totalInputCost,
      outputCost: totalOutputCost,
      cacheSavings: totalCacheSavings,
      batchSavings: totalBatchSavings,
      longContextPremium: totalLongContextPremium,
      grossCost: totalGross,
      netCost: totalNet,
      costPerRequest: workload.monthlyRequests > 0 ? totalNet / workload.monthlyRequests : 0,
      tierBreakdown,
      hasCaching: true,
      hasBatch: providerId === 'anthropic' || providerId === 'openai',
    };
  });
}

// ─── Sensitivity Analysis ────────────────────────────────────────────────────

const SENSITIVITY_PARAMS = [
  { key: 'cacheHitRate', label: 'Cache Hit Rate', format: formatPercent },
  { key: 'batchEligiblePct', label: 'Batch Eligible %', format: formatPercent },
  { key: 'monthlyRequests', label: 'Monthly Requests', format: formatCompact },
  { key: 'avgOutputTokens', label: 'Avg Output Tokens', format: formatCompact },
  { key: 'avgInputTokens', label: 'Avg Input Tokens', format: formatCompact },
  { key: 'longContextPct', label: 'Long Context %', format: formatPercent },
];

export function runSensitivityAnalysis(workload) {
  const baseCosts = calculateAllProviderCosts(workload);
  const anthropicBase = baseCosts.find(c => c.providerId === 'anthropic')?.netCost || 0;

  return SENSITIVITY_PARAMS.map(({ key, label }) => {
    const baseVal = workload[key];
    // For rates (0-1), use ±0.2 absolute; for counts, use ±50%
    const isRate = key.includes('Rate') || key.includes('Pct');
    const lowVal = isRate ? Math.max(0, baseVal - 0.20) : baseVal * 0.5;
    const highVal = isRate ? Math.min(1, baseVal + 0.20) : baseVal * 1.5;

    const lowWorkload = { ...workload, [key]: lowVal };
    const highWorkload = { ...workload, [key]: highVal };

    const lowCosts = calculateAllProviderCosts(lowWorkload);
    const highCosts = calculateAllProviderCosts(highWorkload);

    const anthropicLow = lowCosts.find(c => c.providerId === 'anthropic')?.netCost || 0;
    const anthropicHigh = highCosts.find(c => c.providerId === 'anthropic')?.netCost || 0;

    return {
      param: label,
      key,
      baseValue: baseVal,
      lowValue: lowVal,
      highValue: highVal,
      baseCost: anthropicBase,
      lowCost: anthropicLow,
      highCost: anthropicHigh,
      lowDelta: anthropicLow - anthropicBase,
      highDelta: anthropicHigh - anthropicBase,
      spread: Math.abs(anthropicHigh - anthropicLow),
    };
  }).sort((a, b) => b.spread - a.spread);
}

// ─── 2x2 Scenario Matrix ────────────────────────────────────────────────────

export function computeScenarioMatrix(workload) {
  const scenarios = [
    { label: 'Low Cache\nNo Batch', cacheHitRate: 0.20, batchEligiblePct: 0.0 },
    { label: 'Low Cache\nHeavy Batch', cacheHitRate: 0.20, batchEligiblePct: 0.70 },
    { label: 'High Cache\nNo Batch', cacheHitRate: 0.80, batchEligiblePct: 0.0 },
    { label: 'High Cache\nHeavy Batch', cacheHitRate: 0.80, batchEligiblePct: 0.70 },
  ];

  return scenarios.map(scenario => {
    const w = { ...workload, ...scenario };
    const costs = calculateAllProviderCosts(w);
    const sorted = [...costs].sort((a, b) => a.netCost - b.netCost);
    return {
      ...scenario,
      costs,
      ranked: sorted.map(c => ({ providerId: c.providerId, providerName: c.providerName, netCost: c.netCost, color: c.color })),
      winner: sorted[0],
    };
  });
}

// ─── Price-Performance Frontier ──────────────────────────────────────────────

export function computeFrontierData(workload, benchmarkKey = 'composite') {
  const allModels = [];

  for (const providerId of PROVIDER_ORDER) {
    const provider = PROVIDERS[providerId];
    for (const [modelId, model] of Object.entries(provider.models)) {
      const cost = calculateModelCost(model, workload);
      const score = benchmarkKey === 'composite'
        ? getCompositeScore(modelId)
        : (BENCHMARKS[modelId]?.[benchmarkKey] || 0);

      if (score > 0) {
        allModels.push({
          modelId,
          modelName: model.name,
          providerId,
          providerName: provider.name,
          color: provider.color,
          costPerRequest: cost.costPerRequest,
          monthlyCost: cost.netCost,
          score,
          tier: model.tier,
        });
      }
    }
  }

  // Compute Pareto frontier: models where no other model is both cheaper and higher-scoring
  const pareto = [];
  const sorted = [...allModels].sort((a, b) => a.costPerRequest - b.costPerRequest);
  let maxScore = -Infinity;
  for (const m of sorted) {
    if (m.score > maxScore) {
      pareto.push(m);
      maxScore = m.score;
    }
  }

  return { allModels, pareto };
}

// ─── Strategic Insights Generator ────────────────────────────────────────────

export function generateInsights(providerCosts, workload) {
  const insights = [];
  const anthropic = providerCosts.find(c => c.providerId === 'anthropic');
  const others = providerCosts.filter(c => c.providerId !== 'anthropic');
  const sorted = [...providerCosts].sort((a, b) => a.netCost - b.netCost);
  const cheapest = sorted[0];
  const mostExpensive = sorted[sorted.length - 1];
  const avgCost = providerCosts.reduce((s, c) => s + c.netCost, 0) / providerCosts.length;

  if (!anthropic) return insights;

  // Insight: Anthropic is cheapest
  if (cheapest.providerId === 'anthropic') {
    const second = sorted[1];
    const savings = ((second.netCost - anthropic.netCost) / second.netCost * 100).toFixed(0);
    insights.push({
      type: 'positive',
      headline: `Anthropic is the cheapest provider for this workload`,
      detail: `${formatCurrency(anthropic.netCost)}/mo vs ${second.providerName} at ${formatCurrency(second.netCost)}/mo`,
      implication: `${savings}% savings over the next-cheapest option. Claude delivers best-in-class value here.`,
    });
  } else {
    // How much more expensive is Anthropic?
    const premium = ((anthropic.netCost - cheapest.netCost) / cheapest.netCost * 100).toFixed(0);
    if (premium <= 15) {
      insights.push({
        type: 'neutral',
        headline: `Anthropic is within ${premium}% of the cheapest provider`,
        detail: `${formatCurrency(anthropic.netCost)}/mo vs ${cheapest.providerName} at ${formatCurrency(cheapest.netCost)}/mo`,
        implication: `The cost premium is modest and may be offset by Claude's superior quality on complex tasks.`,
      });
    } else {
      insights.push({
        type: 'negative',
        headline: `${cheapest.providerName} is ${premium}% cheaper for this workload`,
        detail: `${formatCurrency(cheapest.netCost)}/mo vs Anthropic at ${formatCurrency(anthropic.netCost)}/mo`,
        implication: `Consider model routing or batch processing to close the gap.`,
      });
    }
  }

  // Insight: Cache impact
  if (workload.cacheHitRate > 0) {
    const noCacheWorkload = { ...workload, cacheHitRate: 0 };
    const noCacheCosts = calculateAllProviderCosts(noCacheWorkload);
    const anthropicNoCache = noCacheCosts.find(c => c.providerId === 'anthropic');
    if (anthropicNoCache) {
      const cacheImpact = ((anthropicNoCache.netCost - anthropic.netCost) / anthropicNoCache.netCost * 100).toFixed(0);
      insights.push({
        type: 'positive',
        headline: `Prompt caching saves Anthropic ${cacheImpact}% on this workload`,
        detail: `${formatCurrency(anthropic.cacheSavings)}/mo in cache savings at ${formatPercent(workload.cacheHitRate)} hit rate`,
        implication: `Anthropic's cache read pricing ($${anthropic.inputPrice * 0.1}/MTok) is among the most aggressive in the market.`,
      });
    }
  }

  // Insight: Batch potential
  if (workload.batchEligiblePct > 0 && anthropic.hasBatch) {
    insights.push({
      type: 'positive',
      headline: `Batch API saves ${formatCurrency(anthropic.batchSavings)}/mo`,
      detail: `${formatPercent(workload.batchEligiblePct)} of requests are batch-eligible with 50% discount`,
      implication: `Both Anthropic and OpenAI offer batch pricing. Google and xAI do not — a key differentiator for async workloads.`,
    });
  } else if (workload.batchEligiblePct === 0) {
    // Calculate what they could save
    const batchWorkload = { ...workload, batchEligiblePct: 0.5 };
    const batchCosts = calculateAllProviderCosts(batchWorkload);
    const anthropicBatch = batchCosts.find(c => c.providerId === 'anthropic');
    if (anthropicBatch) {
      const potentialSavings = anthropic.netCost - anthropicBatch.netCost;
      if (potentialSavings > 100) {
        insights.push({
          type: 'neutral',
          headline: `Batch processing could save ${formatCurrency(potentialSavings)}/mo`,
          detail: `If 50% of requests were batch-eligible, Anthropic cost drops to ${formatCurrency(anthropicBatch.netCost)}/mo`,
          implication: `Evaluate whether latency requirements allow async processing for a portion of traffic.`,
        });
      }
    }
  }

  // Insight: Annual TCO
  const annualSpread = (mostExpensive.netCost - cheapest.netCost) * 12;
  if (annualSpread > 10000) {
    insights.push({
      type: 'neutral',
      headline: `Annual TCO spread is ${formatCurrency(annualSpread)}`,
      detail: `From ${formatCurrency(cheapest.netCost * 12)}/yr (${cheapest.providerName}) to ${formatCurrency(mostExpensive.netCost * 12)}/yr (${mostExpensive.providerName})`,
      implication: `Provider selection has material impact on annual spend. Worth optimizing.`,
    });
  }

  // Insight: Model routing potential
  if (workload.qualityTier !== 'routing' && workload.qualityTier !== 'budget') {
    const routingWorkload = {
      ...workload,
      qualityTier: 'routing',
      routingSplit: { budget: 0.70, mid: 0.25, frontier: 0.05 },
    };
    const routingCosts = calculateAllProviderCosts(routingWorkload);
    const anthropicRouting = routingCosts.find(c => c.providerId === 'anthropic');
    if (anthropicRouting && anthropic.netCost > 0) {
      const routingSavings = anthropic.netCost - anthropicRouting.netCost;
      const routingPct = (routingSavings / anthropic.netCost * 100).toFixed(0);
      if (routingSavings > 100) {
        insights.push({
          type: 'positive',
          headline: `Intelligent routing could save ${routingPct}% (${formatCurrency(routingSavings)}/mo)`,
          detail: `Route 70% budget / 25% mid / 5% frontier vs current single-tier approach`,
          implication: `Anthropic's 3-tier lineup (Haiku \u2192 Sonnet \u2192 Opus) is purpose-built for model routing.`,
        });
      }
    }
  }

  return insights.slice(0, 5);
}
