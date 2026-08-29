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
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [researchData, setResearchData] = useState(null);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [activeTab, setActiveTab] = useState('report');

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
      setError(err.message || 'An error occurred during research execution.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <Header systemHealth={systemHealth} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <QueryInput
          query={query}
          setQuery={setQuery}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center space-x-3 text-sm">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <ProgressTracker isLoading={isLoading} isCompleted={isCompleted} />

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-6">
          <button
            onClick={() => setActiveTab('report')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'report'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Research Report
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'tools'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tool Calling Trace ({researchData?.tool_calls?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('mcp')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'mcp'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            MCP Protocol Hub
          </button>
        </div>

        {/* Tab Content */}
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

      <footer className="border-t border-slate-200 py-6 bg-white text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4">
          Multi-Agent Research System &bull; Built with FastAPI, LangGraph, Tool Calling & MCP Protocol
        </div>
      </footer>
    </div>
  );
}
