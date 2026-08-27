import React from 'react';
import { Network, Globe, BookOpen, ShieldCheck, FileText, Check, Loader2 } from 'lucide-react';

const AGENT_STEPS = [
  { id: 1, name: 'Orchestrator Agent', desc: 'Analyzes & decomposes question into subtasks', icon: Network },
  { id: 2, name: 'Research Agent', desc: 'Queries web sources & extracts market evidence', icon: Globe },
  { id: 3, name: 'Academic Agent', desc: 'Searches Semantic Scholar paper literature', icon: BookOpen },
  { id: 4, name: 'Fact Checker Agent', desc: 'Evaluates claims & assigns confidence levels', icon: ShieldCheck },
  { id: 5, name: 'Synthesizer Agent', desc: 'Compiles final report adhering strictly to sources', icon: FileText },
];

export default function ProgressTracker({ isLoading, isCompleted, currentStep = 5 }) {
  if (!isLoading && !isCompleted) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 mb-8 border border-gray-800">
      <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400" />
          )}
          Agent Workflow Execution Status
        </span>
        <span className="text-xs text-indigo-400 font-mono">
          LangGraph StateGraph
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {AGENT_STEPS.map((step) => {
          const Icon = step.icon;
          const isDone = isCompleted || (!isLoading && isCompleted);
          const isCurrent = isLoading && !isCompleted;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition duration-300 ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : isCurrent
                  ? 'bg-indigo-950/40 border-indigo-500/60 text-indigo-200 animate-pulse glow-primary'
                  : 'bg-gray-900/40 border-gray-800 text-gray-500'
              }`}
            >
              <div className="flex items-center space-x-2.5 mb-1.5">
                <div
                  className={`p-1.5 rounded-lg ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-indigo-500/30 text-indigo-300'
                      : 'bg-gray-800 text-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold truncate">{step.name}</span>
              </div>
              <p className="text-[11px] leading-tight text-gray-400 line-clamp-2">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
