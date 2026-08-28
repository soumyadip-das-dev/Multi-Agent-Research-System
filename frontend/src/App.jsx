import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QueryInput from './components/QueryInput';
import ProgressTracker from './components/ProgressTracker';
import ReportViewer from './components/ReportViewer';
import VerifiedClaimsCard from './components/VerifiedClaimsCard';
import SourcesDrawer from './components/SourcesDrawer';
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header systemHealth={systemHealth} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <QueryInput
          query={query}
          setQuery={setQuery}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <ProgressTracker isLoading={isLoading} isCompleted={isCompleted} />

        {researchData && (
          <>
            <ReportViewer report={researchData.report} />
            <VerifiedClaimsCard claims={researchData.verified_claims} />
            <SourcesDrawer sources={researchData.sources} />
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 py-4 bg-white text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4">
          Multi Agent Research assistant
        </div>
      </footer>
    </div>
  );
}




