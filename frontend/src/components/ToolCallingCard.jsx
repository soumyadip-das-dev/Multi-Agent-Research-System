import React from 'react';

export default function ToolCallingCard({ toolCalls = [] }) {
  if (!toolCalls || toolCalls.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        <p className="text-sm">No tool calls recorded for this session yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-lg font-bold text-white tracking-wide">Native Tool Calling Audit Trace</h3>
        </div>
        <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-3 py-1 rounded-full">
          {toolCalls.length} Executed Calls
        </span>
      </div>

      <div className="space-y-4">
        {toolCalls.map((call, idx) => (
          <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 font-mono text-sm hover:border-cyan-900/50 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 text-xs">
                  🔨 {call.tool_name}
                </span>
                <span className="text-xs text-slate-400">by {call.agent}</span>
              </div>
              <span className="text-[11px] text-slate-500">{new Date(call.timestamp).toLocaleTimeString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
                <div className="text-slate-400 font-sans text-[11px] mb-1 uppercase tracking-wider">Arguments</div>
                <pre className="text-cyan-200 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(call.args, null, 2)}</pre>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
                <div className="text-slate-400 font-sans text-[11px] mb-1 uppercase tracking-wider">Result Output</div>
                <div className="text-slate-300 line-clamp-3 overflow-y-auto">{call.result_summary}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
