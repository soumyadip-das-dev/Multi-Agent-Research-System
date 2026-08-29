import React from 'react';
import { Loader2, Check } from 'lucide-react';

const AGENT_STEPS = [
  { id: 1, name: '1. Orchestrator', role: 'Decomposes task' },
  { id: 2, name: '2. Web Search', role: 'Executes web_search' },
  { id: 3, name: '3. Academic Search', role: 'Executes academic_search' },
  { id: 4, name: '4. Fact Checker', role: 'Audits evidence' },
  { id: 5, name: '5. Synthesizer', role: 'Compiles report' },
];

export default function ProgressTracker({ isLoading, isCompleted }) {
  if (!isLoading && !isCompleted) return null;

  return (
    <div className="bg-slate-900 rounded-xl p-5 mb-6 border border-slate-800 shadow-xl">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400" />
          )}
          <span>Workflow Node Execution</span>
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {isCompleted ? 'Status: 100% Completed' : 'Status: Processing Graph Nodes...'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {AGENT_STEPS.map((step) => {
          const isDone = isCompleted;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border text-xs text-left transition-all ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  : isLoading
                  ? 'bg-blue-950/40 border-blue-800/60 text-blue-200 animate-pulse'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="font-semibold">{step.name}</div>
              <div className="text-[11px] opacity-75 mt-0.5">{step.role}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
