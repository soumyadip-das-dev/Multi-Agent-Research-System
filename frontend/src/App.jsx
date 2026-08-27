import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QueryInput from './components/QueryInput';
import ProgressTracker from './components/ProgressTracker';
import ReportViewer from './components/ReportViewer';
import VerifiedClaimsCard from './components/VerifiedClaimsCard';
import SourcesDrawer from './components/SourcesDrawer';
import StateInspector from './components/StateInspector';
import { checkBackendHealth, executeResearch } from './services/api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [researchData, setResearchData] = useState(null);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);

  useEffect(() => {
    // Initial backend health check
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
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Header systemHealth={systemHealth} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QueryInput
          query={query}
          setQuery={setQuery}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {error && (
          <div className="p-4 mb-8 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 flex items-center space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <ProgressTracker isLoading={isLoading} isCompleted={isCompleted} />

        {researchData && (
          <>
            <ReportViewer report={researchData.report} />
            <VerifiedClaimsCard claims={researchData.verified_claims} />
            <SourcesDrawer sources={researchData.sources} />
            <StateInspector stateData={researchData} />
          </>
        )}
      </main>

      <footer className="border-t border-gray-800/80 py-6 bg-gray-900/30 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          Multi-Agent Research System • Learning & Portfolio Project • Built with FastAPI, LangGraph, Pydantic, React & Tailwind CSS
        </div>
      </footer>
    </div>
  );
}
