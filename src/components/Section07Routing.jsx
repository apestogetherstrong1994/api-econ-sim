import { PROVIDERS, PROVIDER_ORDER, getModelForTier } from '../data/providers';
import { calculateRoutingCosts, calculateModelCost, formatCurrency, formatPercent } from '../engine/calculations';

function RoutingSlider({ label, value, onChange, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <label className="text-xs text-slate-400">{label}</label>
        <span className="text-sm font-mono text-white">{formatPercent(value, 0)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        style={{ accentColor: color }}
      />
    </div>
  );
}

export default function Section07Routing({ workload, routingSplit, onRoutingSplitChange }) {
  const handleSplitChange = (tier, newValue) => {
    const newSplit = { ...routingSplit };
    newSplit[tier] = newValue;

    // Redistribute remaining across other tiers proportionally
    const others = Object.keys(newSplit).filter((k) => k !== tier);
    const remaining = 1 - newValue;
    const otherTotal = others.reduce((s, k) => s + routingSplit[k], 0) || 1;

    for (const k of others) {
      newSplit[k] = remaining * (routingSplit[k] / otherTotal);
    }

    onRoutingSplitChange(newSplit);
  };

  // Calculate routing costs for each provider
  const routingCosts = calculateRoutingCosts(workload, routingSplit);

  // Calculate single-tier mid costs for comparison
  const midWorkload = { ...workload, qualityTier: 'mid' };
  const singleTierCosts = PROVIDER_ORDER.map((pid) => {
    const model = getModelForTier(pid, 'mid');
    return { providerId: pid, ...calculateModelCost(model, midWorkload) };
  });

  return (
    <section className="max-w-7xl mx-auto px-6 py-8 animate-section" style={{ animationDelay: '700ms' }}>
      <div className="section-label">[ 07 ] Model Routing Simulator</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flow diagram + sliders */}
        <div className="card p-6">
          <h3 className="text-sm font-mono text-slate-300 mb-4">Routing Split</h3>

          {/* Visual flow */}
          <div className="mb-6 space-y-2">
            <div className="text-center text-xs font-mono text-slate-500 mb-3">
              Request Flow
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-mono">
              <span className="px-2 py-1 rounded bg-[#0f1220] border border-[#2a3050] text-slate-300">
                Request
              </span>
              <span className="text-slate-600">&rarr;</span>
              <span className="px-2 py-1 rounded bg-[#0f1220] border border-[#2a3050] text-slate-300">
                Router
              </span>
              <span className="text-slate-600">&rarr;</span>
              <div className="space-y-1">
                <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
                  Budget {formatPercent(routingSplit.budget, 0)}
                </div>
                <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px]">
                  Mid {formatPercent(routingSplit.mid, 0)}
                </div>
                <div className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px]">
                  Frontier {formatPercent(routingSplit.frontier, 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <RoutingSlider
              label="Budget Tier"
              value={routingSplit.budget}
              onChange={(v) => handleSplitChange('budget', v)}
              color="#10B981"
            />
            <RoutingSlider
              label="Mid Tier"
              value={routingSplit.mid}
              onChange={(v) => handleSplitChange('mid', v)}
              color="#3B82F6"
            />
            <RoutingSlider
              label="Frontier Tier"
              value={routingSplit.frontier}
              onChange={(v) => handleSplitChange('frontier', v)}
              color="#8B5CF6"
            />
          </div>
        </div>

        {/* Routing cost comparison table */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-sm font-mono text-slate-300 mb-4">
            Blended Cost vs. Single-Tier (Mid)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a3050]">
                  <th className="text-left p-2 text-[10px] font-mono uppercase text-slate-500">Provider</th>
                  <th className="text-right p-2 text-[10px] font-mono uppercase text-slate-500">Single-Tier (Mid)</th>
                  <th className="text-right p-2 text-[10px] font-mono uppercase text-slate-500">Routed Blend</th>
                  <th className="text-right p-2 text-[10px] font-mono uppercase text-slate-500">Savings</th>
                </tr>
              </thead>
              <tbody>
                {PROVIDER_ORDER.map((pid) => {
                  const routing = routingCosts.find((c) => c.providerId === pid);
                  const single = singleTierCosts.find((c) => c.providerId === pid);
                  const savings = single && routing ? single.netCost - routing.netCost : 0;
                  const savingsPct = single && single.netCost > 0 ? savings / single.netCost : 0;

                  return (
                    <tr
                      key={pid}
                      className={`border-b border-[#2a3050]/50 ${
                        pid === 'anthropic' ? 'bg-anthropic/5' : ''
                      }`}
                    >
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: PROVIDERS[pid].color }}
                          />
                          <span className="text-xs text-white">{PROVIDERS[pid].name}</span>
                        </div>
                      </td>
                      <td className="text-right p-2 font-mono text-xs text-slate-400">
                        {single ? formatCurrency(single.netCost, 0) : '—'}
                      </td>
                      <td className="text-right p-2 font-mono text-xs text-white font-medium">
                        {routing ? formatCurrency(routing.netCost, 0) : '—'}
                      </td>
                      <td className="text-right p-2 font-mono text-xs text-emerald-400">
                        {savings > 0 ? (
                          <>-{formatCurrency(savings, 0)} ({formatPercent(savingsPct, 0)})</>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-slate-600 mt-4 font-mono">
            Anthropic&apos;s 3-tier lineup (Haiku &rarr; Sonnet &rarr; Opus) is purpose-built for intelligent model routing.
          </p>
        </div>
      </div>
    </section>
  );
}
