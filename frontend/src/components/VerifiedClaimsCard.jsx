import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function VerifiedClaimsCard({ claims = [] }) {
  if (!claims || claims.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-xs">
      <div className="mb-4 pb-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Verified Claims Audit</h3>
          <p className="text-xs text-slate-500">Fact-checking evaluation against gathered evidence</p>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {claims.length} Claims
        </span>
      </div>

      <div className="space-y-3">
        {claims.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded bg-slate-50 border border-slate-200 space-y-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                {item.claim}
              </h4>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-slate-300 text-slate-800 bg-white uppercase">
                  {item.status || 'supported'}
                </span>
                <span className="text-[11px] font-mono text-slate-600">
                  Confidence: {item.confidence}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded border border-slate-200">
              <span className="font-semibold text-slate-900">Rationale: </span>
              {item.explanation}
            </p>

            {item.sources && item.sources.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 pt-1">
                <span className="font-medium text-slate-600">Sources:</span>
                {item.sources.map((src, sIdx) => (
                  <a
                    key={sIdx}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-800 hover:underline"
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
