import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function SourcesDrawer({ sources = [] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-xs">
      <div className="mb-4 pb-3 border-b border-slate-200">
        <h3 className="text-base font-bold text-slate-900">Attributed Sources & References</h3>
        <p className="text-xs text-slate-500">Web articles and academic publications</p>
      </div>

      <div className="space-y-2.5">
        {sources.map((src, idx) => {
          const isAcademic = src.source_type === 'academic';

          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200 gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300 uppercase">
                    {src.source_type}
                  </span>

                  <h4 className="text-sm font-medium text-slate-900 hover:text-blue-600 transition">
                    <a href={src.url} target="_blank" rel="noreferrer">
                      {src.title}
                    </a>
                  </h4>
                </div>

                {isAcademic && (src.authors?.length > 0 || src.year) && (
                  <p className="text-xs text-slate-500">
                    {src.authors?.length > 0 && `Authors: ${src.authors.join(', ')}`}
                    {src.year && ` (${src.year})`}
                  </p>
                )}
              </div>

              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200 transition shrink-0 self-start sm:self-auto"
              >
                <span>Visit Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}


