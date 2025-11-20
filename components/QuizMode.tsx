import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { Difficulty, QuizQuestion, JAVA_TOPICS } from '../types';
import { Brain, CheckCircle, XCircle, Loader2, RefreshCcw } from 'lucide-react';

export const QuizMode: React.FC = () => {
  const [topicId, setTopicId] = useState<string>(JAVA_TOPICS[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.BEGINNER);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // questionId -> selectedIndex
  const [showResults, setShowResults] = useState(false);

  const handleStartQuiz = async () => {
    setLoading(true);
    setShowResults(false);
    setAnswers({});
    
    const selectedTopic = JAVA_TOPICS.find(t => t.id === topicId)?.title || "General Java";
    const generatedQuestions = await generateQuiz(selectedTopic, difficulty);
    
    setQuestions(generatedQuestions);
    setLoading(false);
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswerIndex) correct++;
    });
    return correct;
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-6 bg-java-dark transition-colors duration-300">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-java-text flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-java-orange" />
          <span>Knowledge Check</span>
        </h2>
        <p className="text-java-muted mt-2">Test your mastery of Java concepts.</p>
      </div>

      {/* Controls */}
      <div className="bg-java-surface/50 border border-java-border backdrop-blur p-6 rounded-xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <select 
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="bg-java-surface border border-java-border text-java-text rounded-lg px-4 py-2 focus:outline-none focus:border-java-accent shadow-sm"
          >
            {JAVA_TOPICS.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="bg-java-surface border border-java-border text-java-text rounded-lg px-4 py-2 focus:outline-none focus:border-java-accent shadow-sm"
          >
            {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        
        <button 
          onClick={handleStartQuiz}
          disabled={loading}
          className="w-full md:w-auto px-6 py-2 bg-java-accent hover:bg-blue-400 text-black font-semibold rounded-lg transition flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          {questions.length > 0 ? "New Quiz" : "Start Quiz"}
        </button>
      </div>

      {/* Questions Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-20">
        {questions.length > 0 ? (
          <>
            {questions.map((q, index) => (
              <div key={q.id} className="bg-java-surface/30 border border-java-border p-6 rounded-xl animate-fade-in shadow-sm">
                <h3 className="text-lg font-medium text-java-text mb-4">
                  <span className="text-java-accent mr-2">Q{index + 1}.</span>
                  {q.question}
                </h3>
                
                <div className="space-y-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    const isCorrect = q.correctAnswerIndex === optIdx;
                    const isWrong = isSelected && !isCorrect;
                    
                    let containerClass = "p-4 rounded-lg border cursor-pointer transition flex justify-between items-center ";
                    
                    if (showResults) {
                      if (isCorrect) containerClass += "bg-green-900/20 border-green-500/50 text-green-200";
                      else if (isWrong) containerClass += "bg-red-900/20 border-red-500/50 text-red-200";
                      else containerClass += "bg-java-surface border-java-border text-java-muted opacity-50";
                    } else {
                      if (isSelected) containerClass += "bg-java-accent/20 border-java-accent text-java-text font-medium";
                      else containerClass += "bg-java-surface border-java-border text-java-text hover:bg-java-dark";
                    }

                    return (
                      <div 
                        key={optIdx} 
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={containerClass}
                      >
                        <span>{opt}</span>
                        {showResults && isCorrect && <CheckCircle className="w-5 h-5 text-green-400" />}
                        {showResults && isWrong && <XCircle className="w-5 h-5 text-red-400" />}
                      </div>
                    );
                  })}
                </div>

                {showResults && (
                  <div className="mt-4 p-3 bg-java-dark rounded text-sm text-java-muted border-l-2 border-java-border">
                    <span className="font-bold text-java-text">Explanation:</span> {q.explanation}
                  </div>
                )}
              </div>
            ))}

            {!showResults && Object.keys(answers).length === questions.length && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setShowResults(true)}
                  className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full shadow-lg transform transition hover:scale-105"
                >
                  Submit Answers
                </button>
              </div>
            )}

            {showResults && (
              <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-java-surface border border-java-border p-4 rounded-full shadow-2xl flex items-center gap-4 z-50">
                <div className="text-java-text font-bold">
                  Score: <span className="text-java-accent text-xl">{calculateScore()} / {questions.length}</span>
                </div>
                <button onClick={handleStartQuiz} className="p-2 bg-java-border rounded-full hover:bg-gray-600 transition">
                  <RefreshCcw className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-20 text-java-muted">
              Select a topic and difficulty to generate a quiz.
            </div>
          )
        )}
      </div>
    </div>
  );
};