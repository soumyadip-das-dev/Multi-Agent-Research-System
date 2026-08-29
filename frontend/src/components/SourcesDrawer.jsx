import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';

export default function SourcesDrawer({ sources = [] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800 shadow-xl">
      <div className="mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-base font-bold text-white">Attributed Sources & Literature References</h3>
            <p className="text-xs text-slate-400">Web articles and peer-reviewed academic publications</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {sources.length} Total Sources
        </span>
      </div>

      <div className="space-y-2.5">
        {sources.map((src, idx) => {
          const isAcademic = src.source_type === 'academic';

          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 gap-3 hover:border-slate-700 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase ${
                    isAcademic
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                      : 'bg-blue-950/80 text-blue-300 border border-blue-800'
                  }`}>
                    {src.source_type}
                  </span>

                  <h4 className="text-sm font-medium text-slate-100 hover:text-blue-400 transition">
                    <a href={src.url} target="_blank" rel="noreferrer">
                      {src.title}
                    </a>
                  </h4>
                </div>

                {isAcademic && (src.authors?.length > 0 || src.year) && (
                  <p className="text-xs text-slate-400">
                    {src.authors?.length > 0 && `Authors: ${src.authors.join(', ')}`}
                    {src.year && ` (${src.year})`}
                  </p>
                )}
              </div>

              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition shrink-0 self-start sm:self-auto"
              >
                <span>Visit Link</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
