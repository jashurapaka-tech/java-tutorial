import React, { useMemo } from 'react';
import { CodeBlock } from './CodeBlock';
import { Lightbulb, AlertTriangle, Info, CheckCircle2, Rocket, BookOpen, Zap } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({ content }) => {
  const parsedContent = useMemo(() => {
    // Split by code blocks to handle them separately
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      // Handle Code Blocks
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
        const code = match ? match[2] : part.replace(/```/g, '');
        const lang = match ? match[1] : 'java';

        if (lang === 'diagram') {
            return (
                <div key={index} className="my-8 p-6 bg-java-surface/50 border border-java-border rounded-xl overflow-x-auto shadow-inner flex flex-col items-center">
                    <pre className="font-mono text-xs md:text-sm text-java-accent leading-relaxed whitespace-pre select-none opacity-90">
                        {code}
                    </pre>
                    <div className="flex items-center gap-2 mt-3 opacity-60">
                        <div className="h-px w-8 bg-java-border"></div>
                        <span className="text-[10px] text-java-muted uppercase tracking-widest">Structure Blueprint</span>
                        <div className="h-px w-8 bg-java-border"></div>
                    </div>
                </div>
            );
        }

        return <CodeBlock key={index} code={code} language={lang} />;
      }

      // Handle Regular Text & Special Boxes (Blockquotes)
      return (
        <div key={index} className="prose prose-invert max-w-none text-java-text leading-relaxed">
           {part.split('\n').map((line, i) => {
             const trimmed = line.trim();
             if (!trimmed) return <div key={i} className="h-3"></div>;

             // 1. Handle Blockquotes (The Colored Boxes)
             if (trimmed.startsWith('> ')) {
                 const content = trimmed.replace(/^>\s*/, '');
                 
                 // Blue Box - Core Concept
                 if (content.includes('**Core Concept**')) {
                     return (
                         <div key={i} className="my-6 p-5 rounded-xl border-l-4 border-blue-500 bg-blue-500/10 shadow-sm flex gap-4 items-start">
                             <BookOpen className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                             <div>{parseBold(content.replace('**Core Concept**:', '').replace('**Core Concept**', ''))}</div>
                         </div>
                     );
                 }

                 // Orange Box - Analogy
                 if (content.includes('**Real World Analogy**')) {
                    return (
                        <div key={i} className="my-6 p-5 rounded-xl border-l-4 border-java-orange bg-java-orange/10 shadow-sm flex gap-4 items-start">
                            <Lightbulb className="w-6 h-6 text-java-orange shrink-0 mt-0.5" />
                            <div className="italic text-java-text/90">{parseBold(content.replace('**Real World Analogy**:', '').replace('**Real World Analogy**', ''))}</div>
                        </div>
                    );
                 }

                 // Purple Box - Why it Matters
                 if (content.includes('**Why it Matters**')) {
                    return (
                        <div key={i} className="my-6 p-5 rounded-xl border-l-4 border-purple-500 bg-purple-500/10 shadow-sm flex gap-4 items-start">
                            <Zap className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                            <div>{parseBold(content.replace('**Why it Matters**:', '').replace('**Why it Matters**', ''))}</div>
                        </div>
                    );
                 }

                 // Red Box - Warning
                 if (content.includes('**Warning**')) {
                    return (
                        <div key={i} className="my-6 p-5 rounded-xl border-l-4 border-red-500 bg-red-500/10 shadow-sm flex gap-4 items-start">
                            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                            <div>{parseBold(content.replace('**Warning**:', '').replace('**Warning**', ''))}</div>
                        </div>
                    );
                 }

                 // Green Box - Pro Tip
                 if (content.includes('**Pro Tip**')) {
                    return (
                        <div key={i} className="my-6 p-5 rounded-xl border-l-4 border-green-500 bg-green-500/10 shadow-sm flex gap-4 items-start">
                            <Rocket className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
                            <div>{parseBold(content.replace('**Pro Tip**:', '').replace('**Pro Tip**', ''))}</div>
                        </div>
                    );
                 }
                 
                 // Default Blockquote
                 return (
                     <div key={i} className="my-4 pl-4 border-l-2 border-java-border text-java-muted italic">
                         {parseBold(content)}
                     </div>
                 );
             }

             // 2. Headers
             if (trimmed.startsWith('### ')) {
                 return (
                    <div key={i} className="mt-8 mb-4 flex items-center gap-3">
                        <span className="h-6 w-1 bg-java-accent rounded-full"></span>
                        <h3 className="text-xl font-bold text-java-text">{trimmed.replace('### ', '')}</h3>
                    </div>
                 );
             }
             if (trimmed.startsWith('## ')) {
                 return <h2 key={i} className="text-2xl font-bold text-java-text mt-10 mb-6 pb-2 border-b border-java-border/50">{trimmed.replace('## ', '')}</h2>;
             }

             // 3. Lists (Points Wise)
             if (trimmed.startsWith('- ')) {
                 return (
                    <div key={i} className="flex items-start gap-3 mb-3 ml-2 group">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-java-border group-hover:bg-java-accent transition-colors"></div>
                        <span className="text-java-text/90 leading-relaxed">{parseBold(trimmed.replace('- ', ''))}</span>
                    </div>
                 );
             }
             if (trimmed.match(/^\d+\. /)) {
                 return (
                    <div key={i} className="flex items-start gap-3 mb-3 ml-2">
                        <span className="font-mono text-java-accent font-bold min-w-[1.5rem]">{trimmed.split('.')[0]}.</span>
                        <span className="text-java-text/90 leading-relaxed">{parseBold(trimmed.replace(/^\d+\. /, ''))}</span>
                    </div>
                 );
             }

             // 4. Regular Paragraphs
             return <p key={i} className="mb-4 text-java-text/80 leading-7 text-lg">{parseBold(line)}</p>;
           })}
        </div>
      );
    });
  }, [content]);

  return (
    <div className="space-y-2 animate-fade-in pb-10">
      {parsedContent}
    </div>
  );
});

// Helper to parse bold text within lines
const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <span key={i} className="font-bold text-java-text">{part.slice(2, -2)}</span>;
        }
        return part;
    });
};