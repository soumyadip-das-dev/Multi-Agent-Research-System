import React from 'react';

export default function ToolCallingCard({ toolCalls = [] }) {
  if (!toolCalls || toolCalls.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-500">
        <p className="text-sm">No tool calls recorded for this session yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
        <h3 className="text-base font-bold text-slate-900">Tool Execution Audit Trace</h3>
        <span className="text-xs font-mono text-slate-500">
          {toolCalls.length} Executed Calls
        </span>
      </div>

      <div className="space-y-3">
        {toolCalls.map((call, idx) => (
          <div key={idx} className="bg-slate-50 border border-slate-200 rounded p-4 font-mono text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-white text-slate-900 font-semibold border border-slate-300 text-xs">
                  {call.tool_name}
                </span>
                <span className="text-xs text-slate-500 font-sans">by {call.agent}</span>
              </div>
              <span className="text-[11px] text-slate-500">{new Date(call.timestamp).toLocaleTimeString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="text-slate-500 font-sans text-[11px] mb-1 font-semibold uppercase">Arguments</div>
                <pre className="text-slate-800 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(call.args, null, 2)}</pre>
              </div>

              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="text-slate-500 font-sans text-[11px] mb-1 font-semibold uppercase">Result Summary</div>
                <div className="text-slate-800 line-clamp-3 overflow-y-auto">{call.result_summary}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
