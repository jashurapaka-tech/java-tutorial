import React, { useState, useCallback, useRef } from 'react';
import { JAVA_TOPICS, Difficulty } from '../types';
import { explainTopicStream } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TopicVisualizer } from './TopicVisualizer';
import { BookOpen, ChevronRight, Layers, Clock, Star, Zap, CheckCircle2, Circle, Award } from 'lucide-react';

export const TopicExplorer: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.BEGINNER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Cache for full content
  const [topicCache, setTopicCache] = useState<Record<string, string>>({});

  // Progress Tracking
  const [completedTopics, setCompletedTopics] = useState<string[]>(() => {
      const saved = localStorage.getItem('java_completed_topics');
      return saved ? JSON.parse(saved) : [];
  });

  const toggleComplete = (id: string) => {
      setCompletedTopics(prev => {
          const newSet = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
          localStorage.setItem('java_completed_topics', JSON.stringify(newSet));
          return newSet;
      });
  };
  
  // Abort controller ref for cancelling streams if needed (simulated by ID check)
  const currentTopicIdRef = useRef<string | null>(null);

  const loadContent = useCallback(async (tid: string, tTitle: string, diff: Difficulty) => {
    currentTopicIdRef.current = tid;
    const cacheKey = `${tid}-${diff}`;
    
    if (topicCache[cacheKey]) {
      setContent(topicCache[cacheKey]);
      setIsGenerating(false);
      return;
    }

    setContent(""); // Reset content for streaming
    setIsGenerating(true);

    try {
      let fullResponse = "";
      const stream = explainTopicStream(tTitle, diff);
      
      for await (const chunk of stream) {
        // If user switched topics, stop updating state
        if (currentTopicIdRef.current !== tid) break;
        
        fullResponse += chunk;
        setContent(prev => (prev || "") + chunk);
      }

      if (currentTopicIdRef.current === tid) {
        setTopicCache(prev => ({ ...prev, [cacheKey]: fullResponse }));
        setIsGenerating(false);
      }
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
    }
  }, [topicCache]);

  const handleTopicClick = useCallback((topicId: string, topicTitle: string) => {
    if (topicId === selectedTopic) return;
    setSelectedTopic(topicId);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    loadContent(topicId, topicTitle, difficulty);
  }, [selectedTopic, difficulty, loadContent]);

  const categories = Array.from(new Set(JAVA_TOPICS.map(t => t.category)));
  const activeTopicData = JAVA_TOPICS.find(t => t.id === selectedTopic);
  const progressPercentage = Math.round((completedTopics.length / JAVA_TOPICS.length) * 100);

  return (
    <div className="h-full flex flex-row overflow-hidden bg-java-dark">
      {/* Modern Dashboard Sidebar */}
      <div 
        className={`
          ${isSidebarOpen ? 'w-80 lg:w-96 translate-x-0' : 'w-0 -translate-x-full'} 
          flex-shrink-0 bg-java-surface border-r border-java-border flex flex-col h-full transition-all duration-300 absolute md:relative z-20 shadow-2xl md:shadow-none
        `}
      >
        <div className="p-6 border-b border-java-border flex items-center justify-between">
          <div>
              <h2 className="text-java-text font-bold flex items-center gap-2 text-lg">
                <Layers className="w-5 h-5 text-java-orange" />
                Course Map
              </h2>
              <div className="flex items-center gap-2 mt-2">
                 <div className="h-1.5 w-24 bg-java-dark rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                 </div>
                 <span className="text-xs text-java-muted font-mono">{progressPercentage}%</span>
              </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-java-muted">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 py-4 px-3 space-y-8 custom-scrollbar">
          {categories.map(cat => (
            <div key={cat}>
              <div className="flex items-center gap-2 px-3 mb-3">
                <span className="h-px w-4 bg-java-border"></span>
                <h3 className="text-xs font-bold text-java-muted uppercase tracking-widest">{cat}</h3>
                <span className="h-px flex-1 bg-java-border"></span>
              </div>
              
              <div className="space-y-1">
                {JAVA_TOPICS.filter(t => t.category === cat).map((topic, idx) => {
                  const isCompleted = completedTopics.includes(topic.id);
                  return (
                    <button
                        key={topic.id}
                        onClick={() => handleTopicClick(topic.id, topic.title)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 group relative overflow-hidden ${
                        selectedTopic === topic.id 
                            ? 'bg-java-text text-java-dark font-bold shadow-lg scale-[1.02]' 
                            : 'text-java-muted hover:bg-java-dark hover:text-java-text'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            selectedTopic === topic.id 
                                ? 'bg-java-orange text-white' 
                                : isCompleted 
                                    ? 'bg-green-900/30 border border-green-500/50 text-green-500'
                                    : 'bg-java-dark border border-java-border text-java-muted group-hover:border-java-accent'
                        }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{idx + 1}</span>}
                        </div>
                        <div className="flex-1 truncate">
                            <span className="block truncate">{topic.title}</span>
                            {selectedTopic === topic.id && <span className="text-[10px] opacity-70 font-normal">Now Reading...</span>}
                        </div>
                        {selectedTopic === topic.id && <Zap className="w-4 h-4 text-java-orange fill-current animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-java-dark overflow-y-auto relative transition-colors duration-300 scroll-smooth">
        {/* Mobile Toggle */}
        {!isSidebarOpen && (
             <button 
             onClick={() => setIsSidebarOpen(true)}
             className="absolute left-4 top-4 p-2 bg-java-surface border border-java-border rounded-lg shadow-lg z-30 text-java-muted"
           >
             <Layers className="w-5 h-5" />
           </button>
        )}

        {selectedTopic ? (
          <div className="max-w-4xl mx-auto min-h-full p-6 md:p-10 lg:p-14 flex flex-col">
            {/* Header Section */}
            <div className="mb-8 animate-fade-in">
              <TopicVisualizer category={activeTopicData?.category || 'General'} title={activeTopicData?.title || 'Java'} />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-java-border pb-6 mt-6">
                <div>
                    <h1 className="text-4xl font-bold text-java-text mb-2 tracking-tight">
                        {activeTopicData?.title}
                    </h1>
                    <p className="text-java-muted text-lg">
                        {activeTopicData?.description}
                    </p>
                </div>
                
                <div className="flex items-center gap-3 bg-java-surface p-1 rounded-lg border border-java-border self-start">
                    {Object.values(Difficulty).map((d) => (
                        <button
                            key={d}
                            onClick={() => {
                                setDifficulty(d);
                                if (activeTopicData) loadContent(activeTopicData.id, activeTopicData.title, d);
                            }}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                difficulty === d 
                                ? 'bg-java-accent text-black shadow-sm' 
                                : 'text-java-muted hover:text-java-text'
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="pb-8 flex-1">
                {!content && isGenerating && (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-java-surface rounded w-3/4"></div>
                        <div className="h-4 bg-java-surface rounded w-full"></div>
                        <div className="h-4 bg-java-surface rounded w-5/6"></div>
                        <div className="h-32 bg-java-surface rounded-xl w-full mt-8"></div>
                    </div>
                )}
                
                {content && <MarkdownRenderer content={content} />}
                
                {/* Streaming Cursor */}
                {isGenerating && (
                    <div className="inline-block w-2 h-5 bg-java-accent ml-1 animate-pulse align-middle"></div>
                )}
            </div>
            
            {/* Progress Footer */}
            {activeTopicData && (
                <div className="mt-12 pt-8 border-t border-java-border animate-fade-in">
                    <button 
                        onClick={() => activeTopicData && toggleComplete(activeTopicData.id)}
                        className={`w-full py-4 rounded-xl border flex items-center justify-center gap-3 font-bold transition-all duration-300 transform hover:scale-[1.01] ${
                            completedTopics.includes(activeTopicData.id)
                            ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                            : 'bg-java-surface border-java-border text-java-muted hover:bg-java-surface/80 hover:border-java-text/30 hover:text-java-text'
                        }`}
                    >
                        {completedTopics.includes(activeTopicData.id) ? (
                            <>
                                <CheckCircle2 className="w-6 h-6" />
                                <span>Topic Completed</span>
                            </>
                        ) : (
                            <>
                                <Circle className="w-6 h-6" />
                                <span>Mark as Complete</span>
                            </>
                        )}
                    </button>
                </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in bg-grid-pattern">
            <div className="w-24 h-24 bg-java-surface rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-java-border rotate-3 hover:rotate-0 transition-transform duration-500 group">
               <Award className="w-12 h-12 text-java-accent group-hover:text-java-orange transition-colors" />
            </div>
            <h2 className="text-3xl font-bold text-java-text mb-4">Welcome to Java Tutorial</h2>
            <p className="text-java-muted max-w-md text-lg leading-relaxed">
              Your personalized path to mastering Java.
              <br/>
              Select a topic on the left to begin your journey.
            </p>
            
            {completedTopics.length > 0 && (
                 <div className="mt-8 px-6 py-3 bg-java-surface rounded-full border border-java-border flex items-center gap-3">
                     <div className="flex gap-1">
                        {Array.from({length: Math.min(5, completedTopics.length)}).map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        ))}
                     </div>
                     <span className="text-sm font-mono text-green-400">{completedTopics.length} Topics Mastered</span>
                 </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};