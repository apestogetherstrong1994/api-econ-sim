export default function Section00Header() {
  return (
    <header className="border-b border-[#2a3050] relative">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">[ 00 ]</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-anthropic/10 text-anthropic border border-anthropic/20">
                Interactive Tool
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                Confidential
              </span>
            </div>
            <h1 className="font-mono text-2xl md:text-3xl font-bold text-white tracking-tight">
              AI API Economics Simulator
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-xl">
              Total Cost of Ownership Analysis &mdash; Frontier AI APIs, March 2026
            </p>
            <p className="text-slate-500 text-xs mt-2 font-mono">
              Dev Gupta &middot; Anthropic Finance &amp; Strategy, Product Intelligence
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              Last Updated
            </div>
            <div className="text-sm font-mono text-slate-400">
              March 2026
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
