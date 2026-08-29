import React from 'react';

export default function Header({ systemHealth }) {
  const isHealthy = systemHealth?.status === 'ok';
  const mcpToolsCount = systemHealth?.mcp_server?.tools_count || 3;

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Multi-Agent Research System
            </h1>
            <span className="bg-cyan-100 text-cyan-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              MCP & Tool Calling v2.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Web & Academic Literature Research with Model Context Protocol
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="hidden sm:inline-block bg-slate-100 px-2.5 py-1 rounded text-slate-700 font-mono text-[11px]">
            ⚡ MCP: {mcpToolsCount} Tools
          </span>
          <span className="capitalize">{systemHealth?.llm_provider || 'gemini'}</span>
          <span> · </span>
          <span className={isHealthy ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
            {isHealthy ? '● Connected' : 'Connecting...'}
          </span>
        </div>
      </div>
    </header>
  );
}




