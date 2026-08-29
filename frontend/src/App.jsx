import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QueryInput from './components/QueryInput';
import ProgressTracker from './components/ProgressTracker';
import ReportViewer from './components/ReportViewer';
import VerifiedClaimsCard from './components/VerifiedClaimsCard';
import SourcesDrawer from './components/SourcesDrawer';
import ToolCallingCard from './components/ToolCallingCard';
import MCPServerCard from './components/MCPServerCard';
import { checkBackendHealth, executeResearch } from './services/api';
import { AlertCircle, FileText, Wrench, Server } from 'lucide-react';

export default function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [researchData, setResearchData] = useState(null);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [activeTab, setActiveTab] = useState('report'); // 'report', 'tools', 'mcp'

  useEffect(() => {
    checkBackendHealth().then((health) => setSystemHealth(health));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setIsCompleted(false);
    setError(null);
    setResearchData(null);

    try {
      const result = await executeResearch(query.trim());
      setResearchData(result);
      setIsCompleted(true);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during research execution.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header systemHealth={systemHealth} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <QueryInput
          query={query}
          setQuery={setQuery}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {error && (
          <div className="p-4 rounded-lg bg-red-950/80 border border-red-800 text-red-300 flex items-center space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <ProgressTracker isLoading={isLoading} isCompleted={isCompleted} />

        {/* View Switcher Tabs */}
        <div className="flex border-b border-slate-800 space-x-2 pt-2">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'report'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Research Report & Synthesis</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'tools'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Tool Calling Trace ({researchData?.tool_calls?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('mcp')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'mcp'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>MCP Protocol Hub</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'report' && researchData && (
          <div className="space-y-6">
            <ReportViewer report={researchData.report} />
            <VerifiedClaimsCard claims={researchData.verified_claims} />
            <SourcesDrawer sources={researchData.sources} />
          </div>
        )}

        {activeTab === 'tools' && (
          <ToolCallingCard toolCalls={researchData?.tool_calls || []} />
        )}

        {activeTab === 'mcp' && (
          <MCPServerCard />
        )}
      </main>

      <footer className="border-t border-slate-900 py-4 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4">
          Multi-Agent Research System powered by LangGraph, Native LLM Tool Calling & Model Context Protocol (MCP)
        </div>
      </footer>
    </div>
  );
}





