import { formatCurrency, formatCostPer } from '../engine/calculations';

export default function Section04Breakdown({ costs }) {
  if (!costs || costs.length === 0) return null;

  const sorted = [...costs].sort((a, b) => a.netCost - b.netCost);
  const rankings = {};
  sorted.forEach((c, i) => { rankings[c.providerId] = i + 1; });

  // Find min/max for each metric to highlight cells
  const metrics = ['inputCost', 'outputCost', 'netCost', 'costPerRequest'];
  const minMax = {};
  metrics.forEach((m) => {
    const vals = costs.map((c) => c[m]).filter((v) => v > 0);
    minMax[m] = { min: Math.min(...vals), max: Math.max(...vals) };
  });

  function cellClass(providerId, metric, value) {
    const base = providerId === 'anthropic' ? 'bg-anthropic/5' : '';
    if (value <= 0) return base;
    if (value === minMax[metric]?.min) return `${base} text-emerald-400`;
    if (value === minMax[metric]?.max) return `${base} text-red-400`;
    return base;
  }

  const rows = [
    { label: 'Model Used', key: 'modelName', format: (v) => v },
    { label: 'Input Price / MTok', key: 'inputPrice', format: (v) => `$${v?.toFixed(2) || '—'}` },
    { label: 'Output Price / MTok', key: 'outputPrice', format: (v) => `$${v?.toFixed(2) || '—'}` },
    { label: 'Gross Token Cost', key: 'grossCost', format: (v) => formatCurrency(v, 0), highlight: true },
    { label: 'Cache Savings', key: 'cacheSavings', format: (v) => v > 0 ? `-${formatCurrency(v, 0)}` : '—', isGood: true },
    { label: 'Batch Savings', key: 'batchSavings', format: (v) => v > 0 ? `-${formatCurrency(v, 0)}` : '—', isGood: true },
    { label: 'Long Context Premium', key: 'longContextPremium', format: (v) => v > 0 ? `+${formatCurrency(v, 0)}` : '$0' },
    { label: 'Monthly Net Cost', key: 'netCost', format: (v) => formatCurrency(v, 0), bold: true, highlight: true },
    { label: 'Annual Net Cost', key: 'netCost', format: (v) => formatCurrency(v * 12, 0), bold: true },
    { label: 'Cost per Request', key: 'costPerRequest', format: (v) => formatCostPer(v), highlight: true },
    { label: 'Rank', key: null, format: null },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-8 animate-section" style={{ animationDelay: '400ms' }}>
      <div className="section-label">[ 04 ] Detailed Cost Breakdown</div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a3050]">
              <th className="text-left p-3 text-xs font-mono uppercase tracking-wider text-slate-500 w-48">
                Metric
              </th>
              {costs.map((c) => (
                <th
                  key={c.providerId}
                  className={`text-right p-3 text-xs font-mono uppercase tracking-wider ${
                    c.providerId === 'anthropic' ? 'text-anthropic bg-anthropic/5' : 'text-slate-400'
                  }`}
                >
                  {c.providerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-[#2a3050]/50 ${
                  i % 2 === 0 ? 'bg-[#0f1220]' : ''
                } ${row.bold ? 'font-bold' : ''}`}
              >
                <td className="p-3 text-xs text-slate-400 font-mono">{row.label}</td>
                {costs.map((c) => {
                  if (row.label === 'Rank') {
                    const rank = rankings[c.providerId];
                    return (
                      <td
                        key={c.providerId}
                        className={`text-right p-3 font-mono text-sm ${
                          c.providerId === 'anthropic' ? 'bg-anthropic/5' : ''
                        } ${rank === 1 ? 'text-emerald-400' : 'text-slate-400'}`}
                      >
                        #{rank}
                      </td>
                    );
                  }
                  const value = c[row.key];
                  return (
                    <td
                      key={c.providerId}
                      className={`text-right p-3 font-mono text-sm ${
                        cellClass(c.providerId, row.key, value)
                      } ${row.isGood && value > 0 ? 'text-emerald-400' : ''}`}
                    >
                      {row.format(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
