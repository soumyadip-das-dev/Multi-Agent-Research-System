import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Copy, Check } from 'lucide-react';

export default function ReportViewer({ report }) {
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-8 border border-gray-800 shadow-xl">
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Synthesized Research Report</h2>
            <p className="text-xs text-gray-400">Structured synthesis by Synthesizer Agent</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-400" />
              <span>Copy Report</span>
            </>
          )}
        </button>
      </div>

      <div className="prose prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h1:text-indigo-300 prose-h2:text-lg prose-h2:text-purple-300 prose-h2:mt-6 prose-h2:mb-3 prose-p:text-gray-300 prose-p:leading-relaxed prose-li:text-gray-300 prose-a:text-indigo-400 prose-a:underline hover:prose-a:text-indigo-300 prose-strong:text-white">
        <ReactMarkdown>{report}</ReactMarkdown>
      </div>
    </div>
  );
}
