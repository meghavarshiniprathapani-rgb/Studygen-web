import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';
import { BrainCircuit, CheckCircle, XCircle, Timer, Trophy, Loader2, ArrowRight, Lock, BookOpenCheck } from 'lucide-react';

interface QuizComponentProps {
  topics: string[];
  dayId: string; 
  isLocked?: boolean;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ topics, dayId, isLocked = false }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'completed' | 'cooldown'>('idle');
  const [cooldownTime, setCooldownTime] = useState(0);

  const COOLDOWN_DURATION = 10 * 60 * 1000; 

  useEffect(() => {
    const storedCooldown = localStorage.getItem(`quiz_cooldown_${dayId}`);
    if (storedCooldown) {
      const remaining = parseInt(storedCooldown) - Date.now();
      if (remaining > 0) {
        setCooldownTime(remaining);
        setStatus('cooldown');
      } else {
        localStorage.removeItem(`quiz_cooldown_${dayId}`);
      }
    }
  }, [dayId]);

  useEffect(() => {
    let interval: number;
    if (status === 'cooldown' && cooldownTime > 0) {
      interval = window.setInterval(() => {
        setCooldownTime((prev) => {
          const next = prev - 1000;
          if (next <= 0) {
            setStatus('idle');
            localStorage.removeItem(`quiz_cooldown_${dayId}`);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, cooldownTime, dayId]);

  const startQuiz = async () => {
    if (isLocked) return;
    setStatus('loading');
    setScore(0);
    setCurrentQIndex(0);
    setQuestions([]);
    
    try {
      const qs = await generateQuiz(topics);
      if (qs && qs.length > 0) {
        setQuestions(qs);
        setStatus('active');
      } else {
        setStatus('idle');
      }
    } catch (e) {
      setStatus('idle');
    }
  };

  const handleOptionClick = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(index);
  };

  const checkAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerChecked(true);
    if (selectedOption === questions[currentQIndex].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setStatus('completed');
    const cooldownEnd = Date.now() + COOLDOWN_DURATION;
    localStorage.setItem(`quiz_cooldown_${dayId}`, cooldownEnd.toString());
    setCooldownTime(COOLDOWN_DURATION);
  };

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLocked) {
    return (
      <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 text-center shadow-inner flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-4">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-slate-500 font-bold mb-1">Knowledge Check Locked</h3>
        <p className="text-slate-400 text-xs max-w-xs mx-auto">
          You must mark the study materials as completed before you can take the quiz.
        </p>
      </div>
    );
  }

  if (status === 'idle') {
    return (
      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 text-center animate-fade-in shadow-sm">
        <div className="inline-flex p-3 bg-amber-100 rounded-full text-amber-600 mb-4">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Ready to test yourself?</h3>
        <p className="text-gray-600 mb-6 text-sm">You've finished the materials. Now let's see how much you remembered!</p>
        <button 
          onClick={startQuiz}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <PlayIcon /> Start Daily Quiz
        </button>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="bg-white rounded-xl p-12 border border-gray-200 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Generating questions...</p>
      </div>
    );
  }

  if (status === 'cooldown') {
    return (
      <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 text-center">
        <div className="inline-flex p-3 bg-gray-200 rounded-full text-gray-500 mb-4">
          <Timer className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Quiz Cooldown</h3>
        <p className="text-gray-600 mb-4 text-sm">You've just completed a quiz. Take a breather and review your notes!</p>
        <div className="text-3xl font-mono font-bold text-amber-600 mb-2">
          {formatTime(cooldownTime)}
        </div>
        <p className="text-xs text-gray-400">Next attempt available in 10 minutes</p>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200 text-center animate-fade-in">
        <div className="inline-flex p-3 bg-yellow-100 rounded-full text-yellow-600 mb-4">
          <Trophy className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h3>
        <p className="text-gray-600 mb-6">You scored</p>
        
        <div className="text-5xl font-bold text-indigo-600 mb-6">
          {score} <span className="text-2xl text-gray-400">/ {questions.length}</span>
        </div>

        <button 
           disabled={true} 
           className="bg-gray-200 text-gray-500 cursor-not-allowed font-semibold py-2 px-6 rounded-lg flex items-center gap-2 mx-auto"
        >
          <Timer className="w-4 h-4" /> Next quiz in 10m
        </button>
      </div>
    );
  }

  const q = questions[currentQIndex];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
      <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
        <span className="font-bold text-amber-800 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5" /> Quick Quiz
        </span>
        <span className="text-sm font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
          Question {currentQIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">
          {q.question}
        </h4>

        <div className="space-y-3 mb-6">
          {q.options.map((option, idx) => {
            let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ";
            
            if (isAnswerChecked) {
              if (idx === q.correctAnswerIndex) {
                btnClass += "border-green-500 bg-green-50 text-green-800";
              } else if (idx === selectedOption) {
                btnClass += "border-red-500 bg-red-50 text-red-800";
              } else {
                btnClass += "border-gray-100 text-gray-400 opacity-60";
              }
            } else {
              if (idx === selectedOption) {
                btnClass += "border-amber-500 bg-amber-50 text-amber-900";
              } else {
                btnClass += "border-gray-100 hover:border-amber-200 hover:bg-gray-50 text-gray-700";
              }
            }

            return (
              <button 
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isAnswerChecked}
                className={btnClass}
              >
                <span>{option}</span>
                {isAnswerChecked && idx === q.correctAnswerIndex && <CheckCircle className="w-5 h-5 text-green-600" />}
                {isAnswerChecked && idx === selectedOption && idx !== q.correctAnswerIndex && <XCircle className="w-5 h-5 text-red-600" />}
              </button>
            );
          })}
        </div>

        <div className="h-16 flex items-center justify-end">
            {!isAnswerChecked ? (
               <button
                 onClick={checkAnswer}
                 disabled={selectedOption === null}
                 className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    selectedOption !== null 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                 }`}
               >
                 Check Answer
               </button>
            ) : (
                <div className="flex items-center justify-between w-full animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <p className="text-sm text-gray-600 italic flex-1 mr-4 border-l-2 border-gray-300 pl-3">
                        {q.explanation}
                    </p>
                    <button
                        onClick={nextQuestion}
                        className="px-6 py-2 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-lg"
                    >
                        {currentQIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const PlayIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
);