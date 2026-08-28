import React from 'react';
import { Search, Loader2 } from 'lucide-react';

const PRESET_QUERIES = [
  "What is the impact of generative AI on software engineering jobs?",
  "Quantum computing applications in modern cryptography",
  "CRISPR gene editing therapy breakthroughs in oncology",
  "Autonomous driver assistance systems and road safety statistics"
];

export default function QueryInput({ query, setQuery, onSubmit, isLoading }) {
  return (
    <div className="bg-white rounded-xl p-5 mb-6 border border-slate-200 shadow-xs">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            Research Topic
          </label>
        </div>


        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a research question or topic (e.g., What is the impact of generative AI on software engineering?)"
          rows={3}
          disabled={isLoading}
          className="w-full bg-slate-50 text-slate-900 rounded-lg p-3 text-sm border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none transition duration-150 placeholder-slate-400 resize-none disabled:opacity-60"
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500">Examples:</span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(preset)}
                disabled={isLoading}
                className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
              >
                {preset.length > 32 ? preset.slice(0, 32) + '...' : preset}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Running Agents...</span>
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


