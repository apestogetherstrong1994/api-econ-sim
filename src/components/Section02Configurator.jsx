import { WORKLOAD_PRESETS } from '../data/workloads';
import { formatCompact, formatPercent } from '../engine/calculations';

const TIER_OPTIONS = [
  { value: 'budget', label: 'Budget' },
  { value: 'mid', label: 'Mid' },
  { value: 'frontier', label: 'Frontier' },
  { value: 'routing', label: 'Routing' },
];

function SliderControl({ label, value, onChange, min, max, step, format, logScale }) {
  const displayValue = format ? format(value) : value;

  const handleChange = (e) => {
    let v = parseFloat(e.target.value);
    if (logScale) {
      v = Math.round(Math.pow(10, v));
    }
    onChange(v);
  };

  const sliderValue = logScale ? Math.log10(Math.max(1, value)) : value;
  const sliderMin = logScale ? Math.log10(Math.max(1, min)) : min;
  const sliderMax = logScale ? Math.log10(max) : max;
  const sliderStep = logScale ? 0.01 : step;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <label className="text-xs text-slate-400">{label}</label>
        <span className="text-sm font-mono text-white">{displayValue}</span>
      </div>
      <input
        type="range"
        min={sliderMin}
        max={sliderMax}
        step={sliderStep}
        value={sliderValue}
        onChange={handleChange}
        className="w-full"
      />
    </div>
  );
}

export default function Section02Configurator({ activePreset, workload, onPresetChange, onWorkloadChange }) {
  const handleParamChange = (key, value) => {
    onWorkloadChange({ ...workload, [key]: value, id: 'custom' });
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-8 animate-section" style={{ animationDelay: '200ms' }}>
      <div className="section-label">[ 02 ] Workload Configurator</div>

      {/* Preset selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {WORKLOAD_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onPresetChange(preset)}
            className={`card p-3 text-left transition-all cursor-pointer ${
              activePreset === preset.id
                ? 'border-anthropic/60 bg-anthropic/5 shadow-[0_0_15px_rgba(212,165,116,0.1)]'
                : 'hover:border-slate-600'
            }`}
          >
            <div className="text-lg mb-1">{preset.icon}</div>
            <div className="text-xs font-medium text-white leading-tight">{preset.name}</div>
            <div className="text-[10px] text-slate-500 mt-1 leading-snug">{preset.description}</div>
          </button>
        ))}
      </div>

      {/* Parameter sliders */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          <SliderControl
            label="Monthly API Requests"
            value={workload.monthlyRequests}
            onChange={(v) => handleParamChange('monthlyRequests', v)}
            min={1000}
            max={10000000}
            step={1000}
            logScale
            format={formatCompact}
          />
          <SliderControl
            label="Avg Input Tokens / Request"
            value={workload.avgInputTokens}
            onChange={(v) => handleParamChange('avgInputTokens', v)}
            min={100}
            max={50000}
            step={100}
            format={formatCompact}
          />
          <SliderControl
            label="Avg Output Tokens / Request"
            value={workload.avgOutputTokens}
            onChange={(v) => handleParamChange('avgOutputTokens', v)}
            min={50}
            max={20000}
            step={50}
            format={formatCompact}
          />
          <SliderControl
            label="Prompt Cache Hit Rate"
            value={workload.cacheHitRate}
            onChange={(v) => handleParamChange('cacheHitRate', v)}
            min={0}
            max={0.95}
            step={0.01}
            format={(v) => formatPercent(v, 0)}
          />
          <SliderControl
            label="Batch-Eligible %"
            value={workload.batchEligiblePct}
            onChange={(v) => handleParamChange('batchEligiblePct', v)}
            min={0}
            max={1}
            step={0.01}
            format={(v) => formatPercent(v, 0)}
          />
          <SliderControl
            label="Long Context % (>200K)"
            value={workload.longContextPct}
            onChange={(v) => handleParamChange('longContextPct', v)}
            min={0}
            max={0.50}
            step={0.01}
            format={(v) => formatPercent(v, 0)}
          />
        </div>

        {/* Quality Tier Toggle */}
        <div className="mt-6 pt-5 border-t border-[#2a3050]">
          <label className="text-xs text-slate-400 block mb-2">Quality Tier</label>
          <div className="flex gap-2">
            {TIER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleParamChange('qualityTier', opt.value)}
                className={`px-4 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                  workload.qualityTier === opt.value
                    ? 'bg-anthropic/20 text-anthropic border border-anthropic/40'
                    : 'bg-[#1a1f35] text-slate-400 border border-[#2a3050] hover:border-slate-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Routing split sliders - only visible when routing is selected */}
        {workload.qualityTier === 'routing' && (
          <div className="mt-4 grid grid-cols-3 gap-6">
            <SliderControl
              label="% Budget Tier"
              value={workload.routingSplit?.budget || 0.70}
              onChange={(v) => {
                const split = { ...(workload.routingSplit || { budget: 0.70, mid: 0.25, frontier: 0.05 }) };
                const remaining = 1 - v;
                const otherTotal = split.mid + split.frontier;
                split.budget = v;
                if (otherTotal === 0) {
                  split.mid = remaining / 2;
                  split.frontier = remaining / 2;
                } else {
                  split.mid = remaining * (split.mid / otherTotal);
                  split.frontier = remaining * (split.frontier / otherTotal);
                }
                handleParamChange('routingSplit', split);
              }}
              min={0}
              max={1}
              step={0.01}
              format={(v) => formatPercent(v, 0)}
            />
            <SliderControl
              label="% Mid Tier"
              value={workload.routingSplit?.mid || 0.25}
              onChange={(v) => {
                const split = { ...(workload.routingSplit || { budget: 0.70, mid: 0.25, frontier: 0.05 }) };
                const remaining = 1 - v;
                const otherTotal = split.budget + split.frontier;
                split.mid = v;
                if (otherTotal === 0) {
                  split.budget = remaining / 2;
                  split.frontier = remaining / 2;
                } else {
                  split.budget = remaining * (split.budget / otherTotal);
                  split.frontier = remaining * (split.frontier / otherTotal);
                }
                handleParamChange('routingSplit', split);
              }}
              min={0}
              max={1}
              step={0.01}
              format={(v) => formatPercent(v, 0)}
            />
            <SliderControl
              label="% Frontier Tier"
              value={workload.routingSplit?.frontier || 0.05}
              onChange={(v) => {
                const split = { ...(workload.routingSplit || { budget: 0.70, mid: 0.25, frontier: 0.05 }) };
                const remaining = 1 - v;
                const otherTotal = split.budget + split.mid;
                split.frontier = v;
                if (otherTotal === 0) {
                  split.budget = remaining / 2;
                  split.mid = remaining / 2;
                } else {
                  split.budget = remaining * (split.budget / otherTotal);
                  split.mid = remaining * (split.mid / otherTotal);
                }
                handleParamChange('routingSplit', split);
              }}
              min={0}
              max={1}
              step={0.01}
              format={(v) => formatPercent(v, 0)}
            />
          </div>
        )}
        <p className="text-[10px] text-slate-600 mt-4 font-mono">
          Preset workloads are representative industry archetypes. Adjust sliders to model your specific use case. &ldquo;Routing&rdquo; tier simulates intelligent model selection across budget/mid/frontier.
        </p>
      </div>
    </section>
  );
}
