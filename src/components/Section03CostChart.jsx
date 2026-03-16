import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import { formatCurrency } from '../engine/calculations';

const COLORS = {
  anthropic: '#D4A574',
  openai: '#10B981',
  google: '#4285F4',
  xai: '#EF4444',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-[#1a1f35] border border-[#2a3050] rounded-lg p-3 shadow-xl text-xs">
      <div className="font-mono font-bold text-white mb-2">{data.providerName}</div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Model</span>
          <span className="text-white font-mono">{data.modelName}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Input Cost</span>
          <span className="text-white font-mono">{formatCurrency(data.inputCost, 2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Output Cost</span>
          <span className="text-white font-mono">{formatCurrency(data.outputCost, 2)}</span>
        </div>
        {data.cacheSavings > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-emerald-400">Cache Savings</span>
            <span className="text-emerald-400 font-mono">-{formatCurrency(data.cacheSavings, 2)}</span>
          </div>
        )}
        {data.batchSavings > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-emerald-400">Batch Savings</span>
            <span className="text-emerald-400 font-mono">-{formatCurrency(data.batchSavings, 2)}</span>
          </div>
        )}
        {data.longContextPremium > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-red-400">Long Context Premium</span>
            <span className="text-red-400 font-mono">+{formatCurrency(data.longContextPremium, 2)}</span>
          </div>
        )}
        <div className="border-t border-[#2a3050] pt-1 mt-1 flex justify-between gap-4">
          <span className="text-white font-bold">Net Monthly</span>
          <span className="text-white font-mono font-bold">{formatCurrency(data.netCost, 2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function Section03CostChart({ costs, chartMode, onChartModeChange }) {
  if (!costs || costs.length === 0) return null;

  const sorted = [...costs].sort((a, b) => a.netCost - b.netCost);
  const cheapestId = sorted[0]?.providerId;

  const chartData = costs.map((c) => ({
    ...c,
    name: c.providerName,
    tokenCost: c.inputCost + c.outputCost,
    savings: -(c.cacheSavings + c.batchSavings),
    premium: c.longContextPremium,
  }));

  return (
    <section className="max-w-7xl mx-auto px-6 py-8 animate-section" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="section-label mb-0">[ 03 ] Cost Comparison</div>
        <div className="flex gap-1">
          {['grouped', 'stacked'].map((mode) => (
            <button
              key={mode}
              onClick={() => onChartModeChange(mode)}
              className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                chartMode === mode
                  ? 'bg-anthropic/20 text-anthropic border border-anthropic/40'
                  : 'bg-[#1a1f35] text-slate-400 border border-[#2a3050] hover:border-slate-500'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <ResponsiveContainer width="100%" height={400}>
          {chartMode === 'stacked' ? (
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#2a3050' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#2a3050' }}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="inputCost" stackId="cost" name="Input Cost" fill="#6366f1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="outputCost" stackId="cost" name="Output Cost" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#2a3050' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#2a3050' }}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="netCost" name="Net Monthly Cost" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.providerId}
                    fill={COLORS[entry.providerId]}
                    opacity={entry.providerId === cheapestId ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>

        {/* Best value badge */}
        {cheapestId === 'anthropic' && (
          <div className="flex justify-center mt-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-anthropic/10 text-anthropic border border-anthropic/30">
              Best Value
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
