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
    <div className="bg-white rounded-xl p-5 mb-6 border border-slate-200 shadow-xs">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          ) : (
            <Check className="w-4 h-4 text-emerald-600" />
          )}
          Execution Progress
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {AGENT_STEPS.map((step) => {
          const isDone = isCompleted || (!isLoading && isCompleted);

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border text-xs text-center ${
                isDone
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : isLoading
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="font-semibold text-slate-900">{step.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}




