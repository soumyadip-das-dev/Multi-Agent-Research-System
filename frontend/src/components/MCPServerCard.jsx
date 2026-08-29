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
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Model Context Protocol (MCP) Console</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Server: <code className="font-mono text-slate-800">{mcpData.mcp_server}</code> &bull; Protocol: <code className="font-mono text-slate-800">JSON-RPC 2.0</code>
          </p>
        </div>

        <button
          onClick={loadTools}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded border border-slate-200 transition cursor-pointer"
        >
          Refresh Tools
        </button>
      </div>

      {/* Available Tools Grid */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Registered MCP Tools ({mcpData.tools.length})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mcpData.tools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => setSelectedTool(tool)}
              className={`p-3 rounded border text-left transition cursor-pointer ${
                selectedTool?.name === tool.name
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="font-mono text-sm font-bold">{tool.name}</div>
              <div className="text-xs opacity-80 mt-1 line-clamp-2">{tool.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Tool Playground */}
      {selectedTool && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="text-sm font-bold text-slate-900 font-mono">
              MCP Console: <span className="text-slate-700">{selectedTool.name}</span>
            </h4>
            <span className="text-xs text-slate-500 font-mono">POST /api/mcp/call</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-600 font-medium">Search Query</label>
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
                placeholder="Enter query..."
              />
            </div>

            {selectedTool.name !== 'run_full_research' && (
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Max Results</label>
                <input
                  type="number"
                  value={maxResults}
                  onChange={(e) => setMaxResults(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
                  min="1"
                  max="10"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleExecuteTool}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium py-2.5 rounded transition text-sm cursor-pointer"
          >
            {loading ? 'Executing MCP Tool...' : 'Execute Tool Call'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-xs font-mono">
              {error}
            </div>
          )}

          {executionResult && (
            <div className="space-y-2 mt-4">
              <div className="text-xs font-mono text-slate-700 font-semibold flex items-center justify-between">
                <span>JSON-RPC 2.0 Response Output:</span>
                <span>Status: OK</span>
              </div>
              <pre className="bg-white border border-slate-200 rounded p-4 font-mono text-xs text-slate-800 overflow-x-auto max-h-72 whitespace-pre-wrap">
                {JSON.stringify(executionResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
