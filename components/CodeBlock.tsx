import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = React.memo(({ code, language = 'java' }) => {
  return (
    <div className="relative rounded-lg overflow-hidden bg-java-dark border border-java-border my-4 font-mono text-sm shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-java-surface border-b border-java-border text-xs text-java-muted">
        <span className="font-semibold opacity-70">{language}</span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
        </div>
      </div>
      <div className="p-4 overflow-x-auto text-java-text">
        <pre className="whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
});