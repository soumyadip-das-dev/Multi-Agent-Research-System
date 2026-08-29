import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, ExternalLink, FileText } from 'lucide-react';

export default function ReportViewer({ report }) {
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const markdownComponents = {
    a: ({ node, ...props }) => (
      <a {...props} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-blue-400 hover:underline">
        {props.children}
        <ExternalLink className="w-3 h-3 inline" />
      </a>
    ),
    code: ({ node, inline, className, children, ...props }) => {
      const text = String(children).replace(/\n$/, '');
      if (text === 'HIGH') {
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">HIGH</span>;
      }
      if (text === 'MEDIUM') {
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">MEDIUM</span>;
      }
      if (text === 'LOW') {
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800">LOW</span>;
      }
      return <code {...props} className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-200 border border-slate-800 font-mono text-xs">{children}</code>;
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 sm:p-7 mb-6 border border-slate-800 shadow-xl text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Synthesized Research Report</h2>
            <p className="text-xs text-slate-400">Multi-agent findings compiled from web & literature citations</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied Report</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Markdown</span>
            </>
          )}
        </button>
      </div>

      <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
        <ReactMarkdown components={markdownComponents}>
          {report}
        </ReactMarkdown>
      </div>
    </div>
  );
}
