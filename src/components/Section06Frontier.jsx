import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, ComposedChart, ZAxis,
} from 'recharts';
import { BENCHMARK_LABELS } from '../data/benchmarks';
import { formatCostPer } from '../engine/calculations';

const BENCHMARK_OPTIONS = ['composite', 'mmlu', 'humaneval', 'swe_bench', 'math'];

function FrontierTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="bg-[#1a1f35] border border-[#2a3050] rounded-lg p-3 shadow-xl text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
        <span className="font-mono font-bold text-white">{d.modelName}</span>
      </div>
      <div className="text-slate-400">{d.providerName} &middot; {d.tier}</div>
      <div className="mt-1 text-slate-300">
        Cost/req: {formatCostPer(d.costPerRequest)}
      </div>
      <div className="text-slate-300">
        Score: {d.score.toFixed(1)}
      </div>
    </div>
  );
}

export default function Section06Frontier({ frontierData, benchmarkKey, onBenchmarkChange }) {
  if (!frontierData) return null;

  const { allModels, pareto } = frontierData;

  return (
    <section className="max-w-7xl mx-auto px-6 py-8 animate-section" style={{ animationDelay: '600ms' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="section-label mb-0">[ 06 ] Price-Performance Frontier</div>
        <div className="flex gap-1">
          {BENCHMARK_OPTIONS.map((key) => (
            <button
              key={key}
              onClick={() => onBenchmarkChange(key)}
              className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                benchmarkKey === key
                  ? 'bg-anthropic/20 text-anthropic border border-anthropic/40'
                  : 'bg-[#1a1f35] text-slate-400 border border-[#2a3050] hover:border-slate-500'
              }`}
            >
              {BENCHMARK_LABELS[key] || key}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="costPerRequest"
              name="Cost/Request"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#2a3050' }}
              tickLine={false}
              tickFormatter={(v) => formatCostPer(v)}
              label={{
                value: 'Cost per Request',
                position: 'insideBottom',
                offset: -5,
                fill: '#64748b',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <YAxis
              type="number"
              dataKey="score"
              name="Score"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#2a3050' }}
              tickLine={false}
              domain={['auto', 'auto']}
              label={{
                value: BENCHMARK_LABELS[benchmarkKey] || 'Score',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <ZAxis range={[80, 80]} />
            <Tooltip content={<FrontierTooltip />} />

            {/* Pareto frontier line */}
            <Line
              data={pareto}
              type="monotone"
              dataKey="score"
              stroke="#D4A574"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.4}
            />

            {/* Individual provider scatters — dynamically from data */}
            {[...new Set(allModels.map((m) => m.providerId))].map((pid) => {
              const providerModels = allModels.filter((m) => m.providerId === pid);
              if (providerModels.length === 0) return null;
              return (
                <Scatter
                  key={pid}
                  data={providerModels}
                  fill={providerModels[0]?.color}
                  shape="circle"
                  opacity={0.9}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-4">
          {[
            { color: '#D4A574', label: 'Anthropic' },
            { color: '#10B981', label: 'OpenAI' },
            { color: '#4285F4', label: 'Google' },
            { color: '#EF4444', label: 'xAI' },
            { color: '#A78BFA', label: 'Open Source' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-6 border-t border-dashed border-anthropic/40" />
            Pareto Frontier
          </div>
        </div>

        <p className="text-[10px] text-slate-600 text-center mt-3 font-mono">
          Illustrative Q1 2026 benchmarks (composite of MMLU, HumanEval, SWE-bench, MATH). OSS priced at cheapest cloud inference (Together AI / Fireworks).
        </p>
      </div>
    </section>
  );
}
