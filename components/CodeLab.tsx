import React, { useState, useEffect } from 'react';
import { analyzeCode, simulateJavaOutput, visualizeCode } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Play, Terminal, Eraser, Sparkles, Book, ChevronRight, Code2, Layers, Share2, Check, Workflow } from 'lucide-react';

interface Example {
  id: string;
  title: string;
  description: string;
  code: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'hello',
    title: "Hello World",
    description: "The classic entry point.",
    code: `public class Main {
    public static void main(String[] args) {
        // Welcome to Java!
        System.out.println("Hello, Java Tutorial!");
        System.out.println("Ready to learn?");
    }
}`
  },
  {
    id: 'vars',
    title: "Variables & Types",
    description: "Storing data in variables.",
    code: `public class Main {
    public static void main(String[] args) {
        // Different data types
        String name = "Developer";
        int coffeeCups = 3;
        double rating = 4.8;
        boolean lovesJava = true;

        System.out.println("User: " + name);
        System.out.println("Coffee Level: " + coffeeCups);
        System.out.println("Java Rating: " + rating + "/5.0");
        
        if (lovesJava) {
            System.out.println("Status: Happy Coding!");
        }
    }
}`
  },
  {
    id: 'swing_simple',
    title: "Swing GUI",
    description: "Creating a simple window.",
    code: `import javax.swing.*;

public class Main {
    public static void main(String[] args) {
        // In a real environment this opens a window
        JFrame frame = new JFrame("My First App");
        frame.setSize(300, 200);
        
        JLabel label = new JLabel("Hello Swing!", SwingConstants.CENTER);
        frame.add(label);
        
        frame.setVisible(true);
        
        System.out.println("Window 'My First App' created.");
        System.out.println("Size: 300x200");
    }
}`
  },
  {
    id: 'conditionals',
    title: "Conditionals (If/Else)",
    description: "Making decisions in code.",
    code: `public class Main {
    public static void main(String[] args) {
        int score = 85;
        
        // Change the score above to see different results!
        
        System.out.println("Score: " + score);
        
        if (score >= 90) {
            System.out.println("Grade: A - Excellent!");
        } else if (score >= 80) {
            System.out.println("Grade: B - Good job.");
        } else if (score >= 70) {
            System.out.println("Grade: C - Keep trying.");
        } else {
            System.out.println("Grade: F - Study more!");
        }
    }
}`
  },
  {
    id: 'loops',
    title: "Loops (For & While)",
    description: "Repeating actions efficiently.",
    code: `public class Main {
    public static void main(String[] args) {
        // A simple countdown using a for loop
        System.out.println("--- Countdown ---");
        for (int i = 5; i > 0; i--) {
            System.out.println("T-minus " + i);
        }
        System.out.println("Liftoff! 🚀");
        
        // Iterating over an array
        System.out.println("\\n--- Squad Members ---");
        String[] squad = {"Alex", "Sam", "Jordan"};
        
        for (String member : squad) {
            System.out.println("Member: " + member);
        }
    }
}`
  },
  {
    id: 'methods',
    title: "Methods",
    description: "Reusable blocks of code.",
    code: `public class Main {
    public static void main(String[] args) {
        greet("Student");
        
        int result = add(5, 10);
        System.out.println("5 + 10 = " + result);
        
        int squared = square(6);
        System.out.println("6 squared = " + squared);
    }
    
    // A void method that prints something
    public static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }
    
    // A method that returns a value
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static int square(int n) {
        return n * n;
    }
}`
  }
];

export const CodeLab: React.FC = () => {
  const [code, setCode] = useState<string>(EXAMPLES[0].code);
  const [output, setOutput] = useState<string | null>(null);
  const [mode, setMode] = useState<'console' | 'analysis' | 'visualize'>('console');
  const [isRunning, setIsRunning] = useState(false);
  const [activeExampleId, setActiveExampleId] = useState<string>(EXAMPLES[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Load code from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get('code');
    if (sharedCode) {
      try {
        const decoded = decodeURIComponent(escape(atob(sharedCode)));
        setCode(decoded);
        setActiveExampleId(''); // Custom code
        // Remove param from URL without refresh to clean up
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) {
        console.error("Failed to decode shared code", e);
      }
    }
    
    // Auto-close sidebar on mobile
    if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
    }
  }, []);

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setMode('console');
    
    // Artificial delay for "compiling" feel
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const result = await simulateJavaOutput(code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setMode('analysis');
    const result = await analyzeCode(code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleVisualize = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setMode('visualize');
    const result = await visualizeCode(code);
    setOutput(result);
    setIsRunning(false);
  };

  const loadExample = (example: Example) => {
    setActiveExampleId(example.id);
    setCode(example.code);
    setOutput(null);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleShare = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(code)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-java-dark transition-colors duration-300">
      {/* Examples Sidebar */}
      <div className={`${isSidebarOpen ? 'w-full md:w-64' : 'w-0'} bg-java-surface border-r border-java-border flex flex-col transition-all duration-300 overflow-hidden md:relative absolute z-20 h-full`}>
        <div className="p-4 border-b border-java-border flex items-center justify-between text-java-text font-bold">
          <div className="flex items-center gap-2">
            <Book className="w-4 h-4 text-java-orange" />
            <span>Examples</span>
          </div>
           {/* Close button only on mobile */}
           <button 
             onClick={() => setIsSidebarOpen(false)} 
             className="md:hidden p-1 text-java-muted"
           >
             <ChevronRight className="w-5 h-5 rotate-180" />
           </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => loadExample(ex)}
              className={`w-full text-left px-4 py-3 border-l-2 transition-colors hover:bg-java-dark/50 flex flex-col gap-1 ${
                activeExampleId === ex.id 
                ? 'bg-java-dark/50 border-java-accent' 
                : 'border-transparent text-java-muted'
              }`}
            >
              <span className={`text-sm font-medium ${activeExampleId === ex.id ? 'text-java-text' : ''}`}>{ex.title}</span>
              <span className="text-xs text-java-muted truncate">{ex.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Toggle Sidebar Button (Mobile/Desktop) */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 transform -translate-x-1/2 w-6 h-12 bg-java-surface border border-java-border rounded-r-lg flex items-center justify-center text-java-muted hover:text-java-text z-10 shadow-md ${isSidebarOpen ? 'hidden' : 'flex'}`}
        >
          <Layers className="w-3 h-3" />
        </button>

        {/* Editor Toolbar */}
        <div className="h-12 bg-java-surface border-b border-java-border flex items-center justify-between px-4 shrink-0 transition-colors duration-300 overflow-x-auto">
          <div className="flex items-center gap-3">
             {/* Mobile menu trigger if sidebar closed */}
             {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-java-muted"><Layers className="w-4 h-4"/></button>}
             <Code2 className="w-5 h-5 text-java-blue" />
             <span className="text-sm font-mono text-java-text whitespace-nowrap">Main.java</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="p-2 hover:bg-java-dark rounded-md text-java-muted transition flex items-center gap-2"
              title="Share Code"
            >
              {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              <span className="text-xs hidden sm:inline">{isCopied ? 'Copied!' : 'Share'}</span>
            </button>
            
            <div className="h-4 w-px bg-java-border mx-1"></div>
            
            <button 
              onClick={() => setCode('')}
              className="p-2 hover:bg-java-dark rounded-md text-java-muted transition"
              title="Clear Code"
            >
              <Eraser className="w-4 h-4" />
            </button>
            
            <button 
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-bold uppercase tracking-wide rounded transition disabled:opacity-50 shadow-sm ml-2"
            >
              {isRunning && mode === 'console' ? <Terminal className="w-3 h-3 animate-pulse" /> : <Play className="w-3 h-3 fill-current" />}
              Run
            </button>
            
            <button 
              onClick={handleAnalyze}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1.5 bg-java-accent hover:bg-blue-400 text-black text-xs font-bold uppercase tracking-wide rounded transition disabled:opacity-50 shadow-sm"
            >
              {isRunning && mode === 'analysis' ? <Sparkles className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Analyze
            </button>

            <button 
              onClick={handleVisualize}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1.5 bg-java-orange hover:bg-orange-400 text-white text-xs font-bold uppercase tracking-wide rounded transition disabled:opacity-50 shadow-sm"
            >
              {isRunning && mode === 'visualize' ? <Workflow className="w-3 h-3 animate-spin" /> : <Workflow className="w-3 h-3" />}
              Visualize
            </button>
          </div>
        </div>

        {/* Split View: Editor & Output */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 relative bg-java-dark group transition-colors duration-300">
            {/* Line Numbers Decoration (Visual Only) */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-java-dark border-r border-java-border pt-4 flex flex-col items-center text-java-muted font-mono text-xs select-none opacity-50">
              {Array.from({ length: 20 }).map((_, i) => <div key={i} className="leading-6">{i + 1}</div>)}
            </div>
            
            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                // If user modifies preset code, deselect the example ID visually
                if (EXAMPLES.find(ex => ex.code === e.target.value)?.id !== activeExampleId) {
                    setActiveExampleId('');
                }
              }}
              className="w-full h-full bg-transparent text-java-text font-mono text-sm p-4 pl-12 leading-6 resize-none focus:outline-none focus:ring-0"
              spellCheck={false}
              placeholder="// Write your Java code here..."
            />
          </div>

          {/* Output Panel */}
          <div className="h-1/3 md:h-auto md:w-2/5 bg-java-dark border-t md:border-t-0 md:border-l border-java-border flex flex-col transition-colors duration-300">
            <div className="px-4 py-2 bg-java-surface border-b border-java-border flex justify-between items-center">
              <span className="text-xs font-bold text-java-muted uppercase tracking-wider flex items-center gap-2">
                {mode === 'console' && <><Terminal className="w-3 h-3" /> Terminal Output</>}
                {mode === 'analysis' && <><Sparkles className="w-3 h-3" /> AI Analysis</>}
                {mode === 'visualize' && <><Workflow className="w-3 h-3" /> Logic Flowchart</>}
              </span>
              {isRunning && <span className="flex h-2 w-2 bg-java-accent rounded-full animate-ping"></span>}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-java-dark">
              {isRunning ? (
                <div className="flex flex-col gap-2 opacity-50 animate-pulse">
                  <div className="h-2 bg-java-border rounded w-3/4"></div>
                  <div className="h-2 bg-java-border rounded w-1/2"></div>
                  <div className="h-2 bg-java-border rounded w-full"></div>
                </div>
              ) : output ? (
                mode === 'console' ? (
                  <div className="text-java-text whitespace-pre-wrap">
                    <span className="text-green-500 mr-2">$ java Main</span>
                    <br />
                    {output}
                  </div>
                ) : mode === 'visualize' ? (
                  <div className="h-full flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 rounded-lg border border-java-border/30 p-2 overflow-auto">
                     <div 
                        className="w-full h-full flex justify-center items-start min-h-[200px]"
                        dangerouslySetInnerHTML={{ __html: output }} 
                     />
                  </div>
                ) : (
                  <MarkdownRenderer content={output} />
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-java-muted gap-2 opacity-50">
                  <Workflow className="w-8 h-8" />
                  <p className="text-xs">Ready to execute</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};