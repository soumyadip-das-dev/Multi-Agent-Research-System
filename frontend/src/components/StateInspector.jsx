import React, { useState } from 'react';
import { Code, ChevronDown, ChevronUp } from 'lucide-react';

export default function StateInspector({ stateData }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!stateData) return null;

  return (
    <div className="bg-slate-900 rounded-xl p-5 mb-6 border border-slate-800 shadow-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-sm font-semibold text-slate-200 hover:text-blue-400 transition cursor-pointer"
      >
        <span className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-blue-400" />
          <span>Research State Output (JSON)</span>
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto max-h-96 border border-slate-800">
            {JSON.stringify(stateData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
