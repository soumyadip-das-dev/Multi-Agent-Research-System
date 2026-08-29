import React, { useState, useEffect } from 'react';
import { fetchMCPTools, callMCPTool } from '../services/api';

export default function MCPServerCard() {
  const [mcpData, setMcpData] = useState({ mcp_server: 'Loading...', tools: [] });
  const [selectedTool, setSelectedTool] = useState(null);
  const [queryInput, setQueryInput] = useState('Generative AI software engineering impact');
  const [maxResults, setMaxResults] = useState(3);
  const [executionResult, setExecutionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const data = await fetchMCPTools();
      setMcpData(data);
      if (data.tools && data.tools.length > 0) {
        setSelectedTool(data.tools[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteTool = async () => {
    if (!selectedTool) return;
    setLoading(true);
    setError(null);
    setExecutionResult(null);

    try {
      const args = selectedTool.name === 'run_full_research' 
        ? { query: queryInput }
        : { query: queryInput, max_results: parseInt(maxResults) || 3 };

      const res = await callMCPTool(selectedTool.name, args);
      setExecutionResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
              MCP Server Online
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">Model Context Protocol (MCP) Hub</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Server: <code className="text-cyan-400">{mcpData.mcp_server}</code> | Protocol: <code className="text-cyan-400">2024-11-05 JSON-RPC 2.0</code>
          </p>
        </div>

        <button
          onClick={loadTools}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded transition-colors"
        >
          🔄 Refresh Tools
        </button>
      </div>

      {/* Available Tools Grid */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Registered MCP Tools ({mcpData.tools.length})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mcpData.tools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => setSelectedTool(tool)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedTool?.name === tool.name
                  ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-mono text-sm font-bold text-cyan-300">⚡ {tool.name}</div>
              <div className="text-xs text-slate-400 mt-1 line-clamp-2">{tool.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Tool Playground */}
      {selectedTool && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              🧪 MCP Interactive Console: <span className="text-cyan-400">{selectedTool.name}</span>
            </h4>
            <span className="text-xs text-slate-500 font-mono">POST /api/mcp/call</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-400 font-mono">Search Query / Prompt</label>
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                placeholder="Enter query..."
              />
            </div>

            {selectedTool.name !== 'run_full_research' && (
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Max Results</label>
                <input
                  type="number"
                  value={maxResults}
                  onChange={(e) => setMaxResults(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  min="1"
                  max="10"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleExecuteTool}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 text-sm"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                Executing MCP Tool over JSON-RPC...
              </>
            ) : (
              <>🚀 Trigger MCP Tool Execution</>
            )}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs font-mono">
              ❌ {error}
            </div>
          )}

          {executionResult && (
            <div className="space-y-2 mt-4">
              <div className="text-xs font-mono text-emerald-400 font-semibold flex items-center justify-between">
                <span>✅ JSON-RPC 2.0 Response Output:</span>
                <span className="text-slate-500">Status: OK</span>
              </div>
              <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-72 whitespace-pre-wrap">
                {JSON.stringify(executionResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
