import React from 'react';

export default function Header({ systemHealth }) {
  const isHealthy = systemHealth?.status === 'ok';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Multi-Agent Research System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated Literature & Web Intelligence
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-500">
          <span className="font-mono text-slate-600">MCP Protocol v2.0</span>
          <span>&bull;</span>
          <span className={isHealthy ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
            {isHealthy ? 'System Active' : 'Connecting'}
          </span>
        </div>
      </div>
    </header>
  );
}
