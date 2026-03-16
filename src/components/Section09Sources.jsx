export default function Section09Sources() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-8 animate-section" style={{ animationDelay: '900ms' }}>
      <div className="section-label">[ 09 ] Sources &amp; Methodology</div>

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-mono text-slate-300 mb-3">Pricing Sources</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-anthropic mt-1 shrink-0" />
                <div>
                  <span className="text-white">Anthropic API Pricing</span>
                  <br />
                  <span className="text-slate-500 font-mono">anthropic.com/pricing</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-openai mt-1 shrink-0" />
                <div>
                  <span className="text-white">OpenAI API Pricing</span>
                  <br />
                  <span className="text-slate-500 font-mono">openai.com/api/pricing</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-google mt-1 shrink-0" />
                <div>
                  <span className="text-white">Google AI Studio Pricing</span>
                  <br />
                  <span className="text-slate-500 font-mono">ai.google.dev/pricing</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-xai mt-1 shrink-0" />
                <div>
                  <span className="text-white">xAI API Pricing</span>
                  <br />
                  <span className="text-slate-500 font-mono">docs.x.ai/docs</span>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-mono text-slate-300 mb-3">Methodology</h3>
            <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <li>Prices as of March 2026. Standard API pricing without enterprise negotiated rates.</li>
              <li>Cache cost model assumes warm cache (amortized first-request write cost). Fresh tokens charged at standard input rate, cached tokens at cache read rate.</li>
              <li>Batch discounts applied to eligible percentage of total input + output costs. Only Anthropic and OpenAI offer batch pricing.</li>
              <li>Long context premium applies Anthropic&apos;s 2x multiplier and Google&apos;s tiered pricing (above 200K tokens).</li>
              <li>Benchmark scores are approximate composites from public Q1 2026 evaluations.</li>
            </ul>

            <div className="mt-4 p-3 rounded bg-[#0f1220] border border-[#2a3050]">
              <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                Disclaimer: This analysis uses publicly available pricing data. Actual enterprise pricing
                may vary based on committed spend agreements. Benchmark scores are illustrative composites
                and may not reflect the latest evaluations.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#2a3050] text-center">
          <p className="text-[10px] text-slate-600 font-mono">
            Built by Dev Gupta &middot; Supplemental Application Material for Anthropic Finance &amp; Strategy
          </p>
        </div>
      </div>
    </section>
  );
}
