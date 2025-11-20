import React from 'react';
import { Box, Repeat, FileCode, Layers, Database, Cpu, MousePointer, Shield, GitBranch, Terminal, Layout } from 'lucide-react';

interface TopicVisualizerProps {
  category: string;
  title: string;
}

export const TopicVisualizer: React.FC<TopicVisualizerProps> = ({ category, title }) => {
  
  const getVisuals = () => {
    switch (category) {
      case 'Basics': return { icon: <Box className="w-12 h-12 text-white" />, color: 'from-orange-400 to-red-500', accent: 'bg-orange-500' };
      case 'Control Flow': return { icon: <GitBranch className="w-12 h-12 text-white" />, color: 'from-emerald-400 to-cyan-500', accent: 'bg-emerald-500' };
      case 'OOP': return { icon: <Layers className="w-12 h-12 text-white" />, color: 'from-blue-400 to-indigo-500', accent: 'bg-blue-500' };
      case 'Core': return { icon: <FileCode className="w-12 h-12 text-white" />, color: 'from-violet-400 to-fuchsia-500', accent: 'bg-violet-500' };
      case 'GUI & Legacy': return { icon: <Layout className="w-12 h-12 text-white" />, color: 'from-pink-400 to-rose-500', accent: 'bg-pink-500' };
      case 'Advanced': return { icon: <Cpu className="w-12 h-12 text-white" />, color: 'from-red-400 to-orange-500', accent: 'bg-red-500' };
      default: return { icon: <Terminal className="w-12 h-12 text-white" />, color: 'from-gray-600 to-gray-800', accent: 'bg-gray-500' };
    }
  };

  const { icon, color, accent } = getVisuals();

  return (
    <div className={`w-full h-40 md:h-48 mb-8 relative overflow-hidden rounded-2xl shadow-2xl flex items-center px-8 md:px-12 group bg-gradient-to-r ${color}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
         <svg width="100%" height="100%">
           <defs>
             <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
               <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1"/>
             </pattern>
           </defs>
           <rect width="100%" height="100%" fill="url(#grid)" />
         </svg>
      </div>
      
      {/* Floating shapes */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute top-10 right-20 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>

      {/* Content */}
      <div className="relative z-10 flex items-center gap-6 animate-fade-in">
        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg transform group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/80 bg-black/20 px-3 py-1 rounded-full mb-2 inline-block">
                {category}
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-md">{title}</h3>
        </div>
      </div>
    </div>
  );
};