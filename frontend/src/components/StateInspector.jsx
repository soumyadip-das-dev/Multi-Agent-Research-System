import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function StateInspector({ stateData }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!stateData) return null;

  return (
    <div className="bg-white rounded-lg p-5 mb-6 border border-slate-200 shadow-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-sm font-semibold text-slate-900 hover:text-slate-700 transition cursor-pointer"
      >
        <span>Research State JSON Output</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {isOpen && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          <pre className="bg-slate-50 p-4 rounded text-xs font-mono text-slate-800 overflow-x-auto max-h-96 border border-slate-200">
            {JSON.stringify(stateData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
