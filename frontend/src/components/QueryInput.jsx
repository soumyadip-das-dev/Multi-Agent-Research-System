import React from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';

const PRESET_QUERIES = [
  "What is the impact of generative AI on software engineering jobs?",
  "Quantum computing applications in modern cryptography",
  "CRISPR gene editing therapy breakthroughs in oncology",
  "Autonomous driver assistance systems and road safety statistics"
];

export default function QueryInput({ query, setQuery, onSubmit, isLoading }) {
  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl mb-8 border border-gray-800">
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-semibold text-gray-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            Enter Research Question
          </span>
          <span className="text-xs text-gray-400 font-normal">
            Decomposed into 5 specialized agent nodes
          </span>
        </label>

        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What is the impact of generative AI on software engineering jobs?"
            rows={3}
            disabled={isLoading}
            className="w-full bg-gray-900/90 text-gray-100 rounded-xl p-4 text-sm border border-gray-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition duration-200 placeholder-gray-500 resize-none disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">Sample Topics:</span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(preset)}
                disabled={isLoading}
                className="text-xs px-3 py-1 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700/60 transition"
              >
                {preset.length > 35 ? preset.slice(0, 35) + '...' : preset}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg glow-primary transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Orchestrating Research...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Start Multi-Agent Research</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
