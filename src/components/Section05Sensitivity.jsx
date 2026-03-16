import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../engine/calculations';

function TornadoTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="bg-[#1a1f35] border border-[#2a3050] rounded-lg p-3 shadow-xl text-xs">
      <div className="font-mono font-bold text-white mb-1">{d.param}</div>
      <div className="text-slate-400">
        Low: {formatCurrency(d.lowCost, 0)} ({d.lowDelta >= 0 ? '+' : ''}{formatCurrency(d.lowDelta, 0)})
      </div>
      <div className="text-slate-400">
        Base: {formatCurrency(d.baseCost, 0)}
      </div>
      <div className="text-slate-400">
        High: {formatCurrency(d.highCost, 0)} ({d.highDelta >= 0 ? '+' : ''}{formatCurrency(d.highDelta, 0)})
      </div>
    </div>
  );
}

export default function Section05Sensitivity({ sensitivityData, scenarioMatrix }) {
  if (!sensitivityData || sensitivityData.length === 0) return null;

  // Transform data for tornado chart - show deviation from base
  const tornadoData = sensitivityData.map((d) => ({
    ...d,
    lowBar: d.lowDelta,
    highBar: d.highDelta,
  }));

  return (
    <section className="max-w-7xl mx-auto px-6 py-8 animate-section" style={{ animationDelay: '500ms' }}>
      <div className="section-label">[ 05 ] Sensitivity Analysis</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tornado Chart */}
        <div className="card p-6">
          <h3 className="text-sm font-mono text-slate-300 mb-4">
            What drives Anthropic's cost? (&plusmn;20% parameter change)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tornadoData} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#2a3050' }}
                tickLine={false}
                tickFormatter={(v) => `${v >= 0 ? '+' : ''}$${(v / 1000).toFixed(1)}K`}
              />
              <YAxis
                type="category"
                dataKey="param"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#2a3050' }}
                tickLine={false}
                width={120}
              />
              <Tooltip content={<TornadoTooltip />} />
              <ReferenceLine x={0} stroke="#2a3050" />
              <Bar dataKey="lowBar" name="Decrease">
                {tornadoData.map((entry, i) => (
                  <Cell key={i} fill={entry.lowDelta < 0 ? '#10B981' : '#EF4444'} opacity={0.7} />
                ))}
              </Bar>
              <Bar dataKey="highBar" name="Increase">
                {tornadoData.map((entry, i) => (
                  <Cell key={i} fill={entry.highDelta > 0 ? '#EF4444' : '#10B981'} opacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 2x2 Scenario Matrix */}
        <div className="card p-6">
          <h3 className="text-sm font-mono text-slate-300 mb-4">
            Who wins? Cache vs. Batch scenarios
          </h3>
          {scenarioMatrix && (
            <div className="grid grid-cols-2 gap-3">
              {scenarioMatrix.map((scenario, i) => (
                <div
                  key={i}
                  className="bg-[#0f1220] border border-[#2a3050] rounded-lg p-3"
                >
                  <div className="text-[10px] font-mono text-slate-500 mb-2 whitespace-pre-line leading-tight">
                    {scenario.label}
                  </div>
                  <div className="space-y-1">
                    {scenario.ranked.slice(0, 4).map((r, j) => (
                      <div key={r.providerId} className="flex items-center gap-2 text-xs">
                        <span className={`font-mono ${j === 0 ? 'text-white font-bold' : 'text-slate-500'}`}>
                          #{j + 1}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: r.color }}
                        />
                        <span className={j === 0 ? 'text-white' : 'text-slate-500'}>
                          {r.providerName}
                        </span>
                        <span className="ml-auto font-mono text-slate-400 text-[10px]">
                          {formatCurrency(r.netCost, 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
