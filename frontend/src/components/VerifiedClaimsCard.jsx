import React from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

export default function VerifiedClaimsCard({ claims = [] }) {
  if (!claims || claims.length === 0) return null;

  const getStatusTag = (status = 'supported') => {
    switch (status.toLowerCase()) {
      case 'supported':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'conflicting':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'unsupported':
      default:
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
    }
  };

  const getConfidenceTag = (confidence = 'medium') => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'bg-slate-800 text-slate-200 border-slate-700 font-medium';
      case 'medium':
        return 'bg-slate-800/80 text-slate-300 border-slate-700 font-medium';
      case 'low':
      default:
        return 'bg-slate-800/50 text-slate-400 border-slate-800 font-normal';
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800 shadow-xl">
      <div className="mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-white">Verified Claims & Fact-Check Audit</h3>
            <p className="text-xs text-slate-400">Evaluated against web search & academic literature evidence</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {claims.length} {claims.length === 1 ? 'Claim' : 'Claims'} Evaluated
        </span>
      </div>

      <div className="space-y-3">
        {claims.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                {item.claim}
              </h4>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[11px] px-2 py-0.5 rounded border uppercase font-medium tracking-wide ${getStatusTag(item.status)}`}>
                  {item.status || 'supported'}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded border uppercase font-mono ${getConfidenceTag(item.confidence)}`}>
                  Confidence: {item.confidence}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded border border-slate-800/80">
              <span className="font-semibold text-white">Verification Rationale: </span>
              {item.explanation}
            </p>

            {item.sources && item.sources.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 pt-0.5">
                <span className="font-medium text-slate-400">Attributed Sources:</span>
                {item.sources.map((src, sIdx) => (
                  <a
                    key={sIdx}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                  >
                    <span>{src.title.length > 35 ? src.title.slice(0, 35) + '...' : src.title}</span>
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
