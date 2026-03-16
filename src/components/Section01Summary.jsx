import { formatCurrency, formatPercent } from '../engine/calculations';

function StatCard({ label, value, detail, type = 'neutral' }) {
  const colorMap = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-white',
    accent: 'text-anthropic',
  };

  return (
    <div className="card p-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">
        {label}
      </div>
      <div className={`text-2xl md:text-3xl font-mono font-bold ${colorMap[type]}`}>
        {value}
      </div>
      {detail && (
        <div className="text-xs text-slate-400 mt-1.5">{detail}</div>
      )}
    </div>
  );
}

export default function Section01Summary({ costs }) {
  if (!costs || costs.length === 0) return null;

  const sorted = [...costs].sort((a, b) => a.netCost - b.netCost);
  const cheapest = sorted[0];
  const mostExpensive = sorted[sorted.length - 1];
  const anthropic = costs.find(c => c.providerId === 'anthropic');
  const avgCost = costs.reduce((s, c) => s + c.netCost, 0) / costs.length;

  const claudeSavingsVsAvg = anthropic
    ? ((anthropic.netCost - avgCost) / avgCost)
    : 0;

  const cacheImpactPct = anthropic && anthropic.grossCost > 0
    ? anthropic.cacheSavings / (anthropic.grossCost + anthropic.cacheSavings)
    : 0;

  const annualMin = cheapest.netCost * 12;
  const annualMax = mostExpensive.netCost * 12;

  return (
    <section className="max-w-7xl mx-auto px-6 py-8 animate-section" style={{ animationDelay: '100ms' }}>
      <div className="section-label">[ 01 ] Executive Summary</div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Cheapest Provider"
          value={formatCurrency(cheapest.netCost)}
          detail={cheapest.providerName}
          type={cheapest.providerId === 'anthropic' ? 'accent' : 'positive'}
        />
        <StatCard
          label="Most Expensive"
          value={formatCurrency(mostExpensive.netCost)}
          detail={mostExpensive.providerName}
          type="negative"
        />
        <StatCard
          label="Claude Monthly Cost"
          value={anthropic ? formatCurrency(anthropic.netCost) : '—'}
          detail={`${claudeSavingsVsAvg > 0 ? '+' : ''}${formatPercent(claudeSavingsVsAvg, 0)} vs. avg · Rank #${sorted.findIndex(c => c.providerId === 'anthropic') + 1}`}
          type={claudeSavingsVsAvg <= 0 ? 'accent' : 'neutral'}
        />
        <StatCard
          label="Cache Impact (Claude)"
          value={cacheImpactPct > 0 ? `\u2193 ${formatPercent(cacheImpactPct, 0)}` : 'N/A'}
          detail={anthropic ? formatCurrency(anthropic.cacheSavings) + ' saved' : ''}
          type="positive"
        />
        <StatCard
          label="Batch Savings"
          value={anthropic && anthropic.batchSavings > 0 ? formatCurrency(anthropic.batchSavings) : '\u2014'}
          detail={anthropic && anthropic.batchSavings > 0 ? 'monthly savings' : 'No batch in this workload'}
          type={anthropic && anthropic.batchSavings > 0 ? 'positive' : 'neutral'}
        />
        <StatCard
          label="Annual TCO Spread"
          value={`${formatCurrency(annualMin)} \u2013 ${formatCurrency(annualMax)}`}
          detail="Min to max across providers"
          type="neutral"
        />
      </div>
    </section>
  );
}
