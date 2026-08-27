import React from 'react';
import { ShieldCheck, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

export default function VerifiedClaimsCard({ claims = [] }) {
  if (!claims || claims.length === 0) return null;

  const getConfidenceBadge = (confidence) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
      case 'medium':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/40';
      case 'low':
      default:
        return 'bg-rose-950/60 text-rose-400 border-rose-500/40';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-8 border border-gray-800 shadow-xl">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-800">
        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Verified Claims & Fact Checker Audit</h3>
          <p className="text-xs text-gray-400">Fact-checked by Fact Checker Agent against web & academic evidence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {claims.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-100 flex-1 leading-snug">
                {item.claim}
              </h4>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getConfidenceBadge(
                  item.confidence
                )}`}
              >
                {item.confidence}
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed bg-gray-950/40 p-2.5 rounded-lg border border-gray-800/60">
              <span className="font-semibold text-gray-400">Rationale: </span>
              {item.explanation}
            </p>

            {item.sources && item.sources.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] text-gray-500 font-medium">Attributed to:</span>
                {item.sources.map((src, sIdx) => (
                  <a
                    key={sIdx}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-indigo-300 hover:text-indigo-200 transition"
                  >
                    <span>{src.title.length > 25 ? src.title.slice(0, 25) + '...' : src.title}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
