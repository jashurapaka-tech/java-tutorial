import React, { useState, useEffect } from 'react';
import { AppView, Theme } from './types';
import { TopicExplorer } from './components/TopicExplorer';
import { CodeLab } from './components/CodeLab';
import { QuizMode } from './components/QuizMode';
import { ChatAssistant } from './components/ChatAssistant';
import { BookOpen, Code, Brain, Coffee, Settings, X, Moon, Sun, Monitor } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LEARN);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');

  // Apply theme to body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const renderSettingsModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-java-surface border border-java-border rounded-xl w-full max-w-md p-6 shadow-2xl relative">
        <button 
          onClick={() => setIsSettingsOpen(false)}
          className="absolute top-4 right-4 text-java-muted hover:text-java-text transition"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-java-text mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Settings
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-java-muted mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
                  theme === 'dark' 
                  ? 'bg-java-accent/10 border-java-accent text-java-accent' 
                  : 'bg-java-dark border-java-border text-java-muted hover:bg-java-dark/80'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs font-medium">GitHub Dark</span>
              </button>
              
              <button 
                onClick={() => setTheme('midnight')}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
                  theme === 'midnight' 
                  ? 'bg-java-accent/10 border-java-accent text-java-accent' 
                  : 'bg-[#0f172a] border-java-border text-java-muted hover:bg-[#1e293b]'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs font-medium">Midnight</span>
              </button>

              <button 
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
                  theme === 'light' 
                  ? 'bg-java-accent/10 border-java-accent text-java-accent' 
                  : 'bg-white border-java-border text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs font-medium">Light</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-java-border">
            <p className="text-xs text-java-muted text-center">
              Java Tutorial v1.4.0 • AI Chat Enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-java-dark text-java-text font-sans overflow-hidden selection:bg-java-orange selection:text-white transition-colors duration-300">
      {/* Header */}
      <header className="h-16 border-b border-java-border bg-java-surface flex items-center justify-between px-6 shrink-0 z-30 relative shadow-md transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-java-orange to-red-600 rounded-lg flex items-center justify-center shadow-orange-500/20 shadow-lg">
             <Coffee className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-java-text tracking-tight hidden sm:block">
            Java <span className="text-java-accent">Tutorial</span>
          </h1>
        </div>

        <nav className="flex bg-java-dark/50 p-1 rounded-lg border border-java-border/50">
          <button 
            onClick={() => setCurrentView(AppView.LEARN)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
              currentView === AppView.LEARN 
              ? 'bg-java-surface text-java-text shadow ring-1 ring-java-border' 
              : 'text-java-muted hover:text-java-text hover:bg-java-surface/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Learn</span>
          </button>
          <button 
            onClick={() => setCurrentView(AppView.LAB)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
              currentView === AppView.LAB 
              ? 'bg-java-surface text-java-text shadow ring-1 ring-java-border' 
              : 'text-java-muted hover:text-java-text hover:bg-java-surface/50'
            }`}
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Playground</span>
          </button>
          <button 
            onClick={() => setCurrentView(AppView.QUIZ)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
              currentView === AppView.QUIZ 
              ? 'bg-java-surface text-java-text shadow ring-1 ring-java-border' 
              : 'text-java-muted hover:text-java-text hover:bg-java-surface/50'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Quiz</span>
          </button>
        </nav>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-java-muted hover:text-java-text hover:bg-java-dark rounded-lg transition"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative bg-java-dark transition-colors duration-300 flex">
        {currentView === AppView.LEARN && <TopicExplorer />}
        {currentView === AppView.LAB && <div className="w-full h-full"><CodeLab /></div>}
        {currentView === AppView.QUIZ && <div className="w-full h-full"><QuizMode /></div>}
      </main>

      {/* AI Chat Assistant Overlay */}
      <ChatAssistant />

      {isSettingsOpen && renderSettingsModal()}
    </div>
  );
};

export default App;