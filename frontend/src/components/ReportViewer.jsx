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
      <a {...props} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-slate-900 underline hover:text-slate-600">
        {props.children}
        <ExternalLink className="w-3 h-3 inline" />
      </a>
    ),
    code: ({ node, inline, className, children, ...props }) => {
      const text = String(children).replace(/\n$/, '');
      if (text === 'HIGH' || text === 'MEDIUM' || text === 'LOW') {
        return <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-300 text-slate-800 bg-slate-100">{text}</span>;
      }
      return <code {...props} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs border border-slate-200">{children}</code>;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-xs text-slate-900">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Synthesized Research Report</h2>
          <p className="text-xs text-slate-500">Compiled from web and academic literature evidence</p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200 transition cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-slate-900" />
              <span className="text-slate-900 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Report</span>
            </>
          )}
        </button>
      </div>

      <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed space-y-4">
        <ReactMarkdown components={markdownComponents}>
          {report}
        </ReactMarkdown>
      </div>
    </div>
  );
}
