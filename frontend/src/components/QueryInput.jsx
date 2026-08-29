import React from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';

const PRESET_QUERIES = [
  "What is the impact of generative AI on software engineering jobs?",
  "Quantum computing applications in modern cryptography",
  "CRISPR gene editing breakthroughs in oncology",
  "Autonomous driver assistance systems and safety statistics"
];

export default function QueryInput({ query, setQuery, onSubmit, isLoading }) {
  return (
    <div className="bg-slate-900 rounded-xl p-5 mb-6 border border-slate-800 shadow-xl">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" />
            <span>Research Query</span>
          </label>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Decomposes into 5 Parallel Agent Nodes
          </span>
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a research question or topic (e.g., What is the impact of generative AI on software engineering?)"
          rows={3}
          disabled={isLoading}
          className="w-full bg-slate-950 text-slate-100 rounded-lg p-3 text-sm border border-slate-800 focus:border-blue-500 focus:outline-none transition duration-150 placeholder-slate-500 resize-none disabled:opacity-60"
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400">Suggestions:</span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(preset)}
                disabled={isLoading}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                {preset.length > 30 ? preset.slice(0, 30) + '...' : preset}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex items-center justify-center space-x-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-lg shadow-blue-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Orchestrating...</span>
              </>
            ) : (
              <span>Start Research</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
