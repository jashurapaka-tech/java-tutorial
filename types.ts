export enum AppView {
  LEARN = 'LEARN',
  LAB = 'LAB',
  QUIZ = 'QUIZ'
}

export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export type Theme = 'dark' | 'light' | 'midnight';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isCode?: boolean;
}

export const JAVA_TOPICS: Topic[] = [
  // Basics
  { id: 'basics_syntax', title: 'Syntax & Variables', category: 'Basics', description: 'Data types, variables, and basic structure.' },
  { id: 'control_flow', title: 'Control Flow', category: 'Basics', description: 'If/else, loops, and switch statements.' },
  
  // OOP
  { id: 'oop_classes', title: 'Classes & Objects', category: 'OOP', description: 'Blueprints, instances, and constructors.' },
  { id: 'oop_inheritance', title: 'Inheritance', category: 'OOP', description: 'Extending classes and super keyword.' },
  { id: 'oop_polymorphism', title: 'Polymorphism', category: 'OOP', description: 'Overriding and overloading methods.' },
  { id: 'oop_encapsulation', title: 'Encapsulation', category: 'OOP', description: 'Access modifiers and data hiding.' },

  // Core
  { id: 'collections', title: 'Collections Framework', category: 'Core', description: 'Lists, Sets, Maps, and iteration.' },
  { id: 'exceptions', title: 'Exception Handling', category: 'Core', description: 'Try, catch, throw, and custom exceptions.' },
  { id: 'file_io', title: 'File I/O', category: 'Core', description: 'Reading and writing files.' },

  // GUI & Legacy (Requested)
  { id: 'awt_basics', title: 'AWT Components', category: 'GUI & Legacy', description: 'Abstract Window Toolkit basics (Buttons, Labels).' },
  { id: 'swing_basics', title: 'Swing Framework', category: 'GUI & Legacy', description: 'Modern GUI components (JFrame, JPanel).' },
  { id: 'applets', title: 'Java Applets', category: 'GUI & Legacy', description: 'Legacy browser-based Java applications.' },
  { id: 'event_handling', title: 'Event Handling', category: 'GUI & Legacy', description: 'Listeners, events, and user interaction.' },

  // Advanced
  { id: 'streams', title: 'Streams API', category: 'Advanced', description: 'Functional programming and processing data.' },
  { id: 'threads', title: 'Multithreading', category: 'Advanced', description: 'Concurrency, Runnable, and synchronization.' },
  { id: 'jdbc', title: 'JDBC Database', category: 'Advanced', description: 'Connecting Java to SQL databases.' },
];