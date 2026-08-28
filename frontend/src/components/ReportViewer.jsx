import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, ExternalLink } from 'lucide-react';

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
      <a {...props} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline">
        {props.children}
        <ExternalLink className="w-3 h-3 inline" />
      </a>
    ),
    code: ({ node, inline, className, children, ...props }) => {
      const text = String(children).replace(/\n$/, '');
      if (text === 'HIGH') {
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">HIGH</span>;
      }
      if (text === 'MEDIUM') {
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">MEDIUM</span>;
      }
      if (text === 'LOW') {
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-800 border border-red-200">LOW</span>;
      }
      return <code {...props} className={className}>{children}</code>;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 sm:p-7 mb-6 border border-slate-200 shadow-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Synthesized Research Report</h2>
          <p className="text-xs text-slate-500">Generated from web and academic literature evidence</p>
        </div>

        <div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Markdown Body */}
      <div className="markdown-report">
        <ReactMarkdown components={markdownComponents}>
          {report}
        </ReactMarkdown>
      </div>
    </div>
  );
}




