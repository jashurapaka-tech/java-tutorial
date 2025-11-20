import React, { useState, useRef, useEffect } from 'react';
import { createChatSession } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MessageCircle, X, Send, Minimize2, Maximize2, Bot, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import { GenerateContentResponse, Chat } from "@google/genai";

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: "Hi! I'm **JavaBot**. \n\nI can help you with:\n- Deep dives into Java internals (Stack vs Heap)\n- Debugging your code\n- Explaining complex topics\n\nWhat's on your mind?" 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on mount
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !chatSessionRef.current || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const botMsgId = (Date.now() + 1).toString();
      // Add placeholder bot message
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', isStreaming: true }]);

      const result = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      let fullText = '';
      for await (const chunk of result) {
        const content = chunk as GenerateContentResponse;
        if (content.text) {
          fullText += content.text;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMsgId ? { ...msg, text: fullText } : msg
            )
          );
        }
      }
      
      // Finish streaming
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMsgId ? { ...msg, isStreaming: false } : msg
        )
      );

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "> **Error**: I couldn't connect to the server. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    chatSessionRef.current = createChatSession(); // Reset session context
    setMessages([
      { 
        id: 'welcome-reset', 
        role: 'model', 
        text: "Chat cleared! Ready for a fresh start. What would you like to learn?" 
      }
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-java-blue to-java-accent rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 z-50 group"
        title="Ask JavaBot"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <div 
        className={`fixed bottom-6 right-6 bg-java-surface border border-java-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 ${
          isMinimized ? 'w-72 h-16' : 'w-[90vw] md:w-[450px] h-[600px] max-h-[80vh]'
        }`}
    >
      {/* Header */}
      <div className="h-14 bg-java-surface border-b border-java-border flex items-center justify-between px-4 shrink-0 cursor-pointer" onClick={() => !isMinimized && setIsMinimized(true)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-java-accent to-purple-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-java-text">JavaBot</h3>
            {!isMinimized && <span className="text-[10px] text-green-400 flex items-center gap-1">● Online</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
           {!isMinimized && (
             <button 
               onClick={(e) => { e.stopPropagation(); clearChat(); }}
               className="p-2 text-java-muted hover:text-red-400 rounded-full hover:bg-java-dark transition"
               title="Clear Chat"
             >
               <Trash2 className="w-4 h-4" />
             </button>
           )}
           <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-2 text-java-muted hover:text-java-text rounded-full hover:bg-java-dark transition"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-2 text-java-muted hover:text-java-text rounded-full hover:bg-java-dark transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 bg-java-dark/50 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-java-accent text-black rounded-tr-none font-medium' 
                      : 'bg-java-surface border border-java-border text-java-text rounded-tl-none'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.text
                  ) : (
                    <MarkdownRenderer content={msg.text} />
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                    <div className="bg-java-surface border border-java-border rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                         <Loader2 className="w-4 h-4 text-java-accent animate-spin" />
                         <span className="text-xs text-java-muted">JavaBot is thinking...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-java-surface border-t border-java-border">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Java..."
                className="w-full bg-java-dark border border-java-border rounded-xl pl-4 pr-12 py-3 text-sm text-java-text focus:outline-none focus:border-java-accent resize-none custom-scrollbar shadow-inner"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-java-accent hover:bg-blue-400 text-black rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-[10px] text-center mt-2 text-java-muted opacity-60">
              AI can make mistakes. Verify critical code.
            </div>
          </div>
        </>
      )}
    </div>
  );
};