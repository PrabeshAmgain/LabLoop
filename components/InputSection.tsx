import React, { useState } from 'react';
import { Sparkles, Play } from 'lucide-react';

interface InputSectionProps {
  onGenerate: (goal: string) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onGenerate(goal);
    }
  };

  const suggestions = [
    "Classify plant diseases from leaf images on a mobile device",
    "Predict house prices with maximum accuracy",
    "Detect sentiment in tweets with low latency",
    "Transcribe audio for a customer support bot"
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-12 animate-fade-in-up">
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="text-blue-400" />
          Define Your Goal
        </h2>
        <p className="text-slate-400 mb-6">Describe your machine learning objective, and LabLoop will design and simulate the experiments using Gemini 3.</p>
        
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., 'Detect credit card fraud with high precision...'"
            className="w-full bg-slate-900/80 text-white border-2 border-slate-700 rounded-xl px-6 py-4 pr-36 focus:outline-none focus:border-blue-500 transition-all text-lg placeholder-slate-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!goal.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-6 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Thinking
              </span>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                Run
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="text-sm text-slate-500 py-1">Try:</span>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setGoal(s)}
              className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full transition-colors border border-slate-600"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};