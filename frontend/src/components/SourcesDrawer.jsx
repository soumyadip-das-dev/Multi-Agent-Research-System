import React from 'react';
import { BookMarked, ExternalLink, Globe, BookOpen } from 'lucide-react';

export default function SourcesDrawer({ sources = [] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-8 border border-gray-800 shadow-xl">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-800">
        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
          <BookMarked className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Attributed Sources & References</h3>
          <p className="text-xs text-gray-400">Authentic web articles and Semantic Scholar paper URLs</p>
        </div>
      </div>

      <div className="space-y-3">
        {sources.map((src, idx) => {
          const isAcademic = src.source_type === 'academic';

          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gray-900/60 border border-gray-800/80 hover:border-indigo-500/40 transition gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      isAcademic
                        ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                        : 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                    }`}
                  >
                    {isAcademic ? <BookOpen className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                    {src.source_type}
                  </span>

                  <h4 className="text-sm font-semibold text-gray-100 hover:text-indigo-300 transition">
                    <a href={src.url} target="_blank" rel="noreferrer">
                      {src.title}
                    </a>
                  </h4>
                </div>

                {isAcademic && (src.authors?.length > 0 || src.year) && (
                  <p className="text-xs text-gray-400">
                    {src.authors?.length > 0 && `Authors: ${src.authors.join(', ')}`}
                    {src.year && ` • (${src.year})`}
                  </p>
                )}
              </div>

              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-300 hover:text-indigo-200 text-xs font-medium border border-gray-700 transition shrink-0 self-start sm:self-auto"
              >
                <span>Visit Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
