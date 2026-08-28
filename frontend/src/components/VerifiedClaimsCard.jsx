import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function VerifiedClaimsCard({ claims = [] }) {
  if (!claims || claims.length === 0) return null;

  const getStatusTag = (status = 'supported') => {
    switch (status.toLowerCase()) {
      case 'supported':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'conflicting':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'unsupported':
      default:
        return 'bg-red-50 text-red-800 border-red-200';
    }
  };

  const getConfidenceTag = (confidence = 'medium') => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'bg-slate-100 text-slate-800 border-slate-300 font-medium';
      case 'medium':
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
      case 'low':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 font-normal';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-xs">
      <div className="mb-4 pb-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Verified Claims & Fact Checker Audit</h3>
          <p className="text-xs text-slate-500">Evaluated against gathered web & academic evidence</p>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {claims.length} {claims.length === 1 ? 'Claim' : 'Claims'} Evaluated
        </span>
      </div>

      <div className="space-y-3">
        {claims.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
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

            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded border border-slate-200">
              <span className="font-semibold text-slate-900">Verification Rationale: </span>
              {item.explanation}
            </p>

            {item.sources && item.sources.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 pt-0.5">
                <span className="font-medium text-slate-600">Attributed Sources:</span>
                {item.sources.map((src, sIdx) => (
                  <a
                    key={sIdx}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
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



