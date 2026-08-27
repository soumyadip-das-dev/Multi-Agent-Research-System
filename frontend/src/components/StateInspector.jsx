import React, { useState } from 'react';
import { Code, ChevronDown, ChevronUp } from 'lucide-react';

export default function StateInspector({ stateData }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!stateData) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 mb-8 border border-gray-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-sm font-semibold text-gray-300 hover:text-white transition"
      >
        <span className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-purple-400" />
          <span>Agent State Inspector (`ResearchState` JSON)</span>
          <span className="text-xs text-gray-500 font-normal">
            (Technical Interview Demo View)
          </span>
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <pre className="bg-gray-950 p-4 rounded-xl text-xs font-mono text-purple-300 overflow-x-auto max-h-96 border border-gray-800/80">
            {JSON.stringify(stateData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
