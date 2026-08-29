import React from 'react';
import { Loader2, Check } from 'lucide-react';

const AGENT_STEPS = [
  { id: 1, name: '1. Orchestrator' },
  { id: 2, name: '2. Web Search' },
  { id: 3, name: '3. Academic Search' },
  { id: 4, name: '4. Fact Checker' },
  { id: 5, name: '5. Synthesizer' },
];

export default function ProgressTracker({ isLoading, isCompleted }) {
  if (!isLoading && !isCompleted) return null;

  return (
    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-slate-600 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5 text-slate-900" />
          )}
          Workflow Progress
        </h3>
        <span className="text-xs text-slate-500 font-mono">
          {isCompleted ? 'Complete' : 'Processing...'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {AGENT_STEPS.map((step) => {
          const isDone = isCompleted;

          return (
            <div
              key={step.id}
              className={`p-3 rounded border text-xs text-center ${
                isDone
                  ? 'bg-slate-50 border-slate-300 text-slate-900 font-medium'
                  : isLoading
                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <div>{step.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
