import React from 'react';
import { Bot, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header({ systemHealth }) {
  const isHealthy = systemHealth?.status === 'ok';

  return (
    <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg glow-primary">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Multi-Agent Research System
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Portfolio Demo
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              Orchestrated AI agents for web search, academic literature, and claim verification
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/60 text-xs">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-gray-300">LLM: {systemHealth?.llm_provider || 'gemini'}</span>
          </div>

          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
            isHealthy 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-400'
          }`}>
            {isHealthy ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>API Online</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Backend Connecting...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
