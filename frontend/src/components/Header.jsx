import React from 'react';

export default function Header({ systemHealth }) {
  const isHealthy = systemHealth?.status === 'ok';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Multi-Agent Research System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Web & Academic Literature Research Assistant
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          <span className="capitalize">{systemHealth?.llm_provider || 'gemini'}</span>
          <span> · </span>
          <span className={isHealthy ? 'text-slate-600' : 'text-amber-600'}>
            {isHealthy ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>
    </header>
  );
}



