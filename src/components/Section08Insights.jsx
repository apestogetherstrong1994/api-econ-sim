const TYPE_STYLES = {
  positive: {
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    icon: '\u2191',
    iconColor: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-400',
  },
  negative: {
    bg: 'bg-red-500/5',
    border: 'border-red-500/20',
    icon: '\u2193',
    iconColor: 'text-red-400',
    badgeColor: 'bg-red-500/10 text-red-400',
  },
  neutral: {
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
    icon: '\u2194',
    iconColor: 'text-blue-400',
    badgeColor: 'bg-blue-500/10 text-blue-400',
  },
};

export default function Section08Insights({ insights }) {
  if (!insights || insights.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-8 animate-section" style={{ animationDelay: '800ms' }}>
      <div className="section-label">[ 08 ] Strategic Insights</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, i) => {
          const style = TYPE_STYLES[insight.type] || TYPE_STYLES.neutral;
          return (
            <div
              key={i}
              className={`card p-5 ${style.bg} border ${style.border}`}
            >
              <div className="flex items-start gap-3">
                <span className={`text-lg ${style.iconColor} mt-0.5`}>
                  {style.icon}
                </span>
                <div>
                  <h4 className="text-sm text-white font-medium leading-snug mb-2">
                    {insight.headline}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    {insight.detail}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    {insight.implication}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-600 mt-3 font-mono">
        Insights are dynamically generated from current workload parameters by comparing provider costs, cache/batch impact, and routing potential. Thresholds: cost gap &gt;15% flagged, savings &gt;$100/mo surfaced.
      </p>
    </section>
  );
}
