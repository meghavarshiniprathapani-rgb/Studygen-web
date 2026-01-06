import React, { useState, useEffect } from 'react';
import { DayDetails } from '../types';
import { X, Youtube, BookOpen, HelpCircle, Loader2, Code2, ChevronDown, ChevronUp, Lock, CheckCircle } from 'lucide-react';
import { CodePlayground } from './CodePlayground';
import { QuizComponent } from './QuizComponent';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  details: DayDetails | null;
  title: string;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ isOpen, onClose, loading, details, title }) => {
  const [activeProblemIndex, setActiveProblemIndex] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Reset completion state when opening a new day
  useEffect(() => {
    if (isOpen) {
      setIsCompleted(false);
      setActiveProblemIndex(null);
    }
  }, [isOpen, title]);

  if (!isOpen) return null;

  const quizContext = [title]; 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>

        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 pr-8">{title}</h2>
          <div className="h-1.5 w-24 bg-indigo-500 rounded-full mb-8"></div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
              <Loader2 className="w-14 h-14 animate-spin mb-6" />
              <p className="font-bold text-xl">Curating resources...</p>
              <p className="text-sm text-indigo-400 mt-2">Powered by Gemini AI</p>
            </div>
          ) : details ? (
            <div className="space-y-12">
              {/* Description */}
              <section className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-5 text-indigo-700 font-bold text-xl">
                  <div className="p-2.5 bg-indigo-100 rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3>Concept Overview</h3>
                </div>
                <p className="text-gray-700 leading-relaxed bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 text-justify text-lg">
                  {details.description}
                </p>
              </section>

              {/* YouTube Links */}
              <section className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
                <div className="flex items-center gap-3 mb-5 text-red-600 font-bold text-xl">
                  <div className="p-2.5 bg-red-100 rounded-xl">
                     <Youtube className="w-6 h-6" />
                  </div>
                  <h3>Tutorials</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.youtubeQueries.map((query, idx) => (
                    <a
                      key={idx}
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 hover:border-red-300 hover:bg-red-50 hover:shadow-md transition-all group bg-white"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <span className="text-gray-700 group-hover:text-red-700 font-bold truncate">{query}</span>
                      </div>
                      <Youtube className="w-6 h-6 text-gray-300 group-hover:text-red-600 transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </section>

              {/* Completion Action */}
              {!isCompleted && (
                <div className="py-10 border-y border-slate-100 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-full mb-1">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <div>
                        <h4 className="font-extrabold text-2xl text-slate-900">Materials Review</h4>
                        <p className="text-lg text-slate-500 max-w-md mx-auto">Finished your review? Unlock your practice problems and quiz now.</p>
                    </div>
                    <button 
                        onClick={() => setIsCompleted(true)}
                        className="px-10 py-4 bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center gap-2 text-lg"
                    >
                        Mark Session Completed
                    </button>
                </div>
              )}

              {/* Practice Problems & Quiz (Gated) */}
              <div className={`space-y-12 transition-all duration-700 ${isCompleted ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none select-none grayscale-[0.5]'}`}>
                
                {/* Practice Problems */}
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3 text-emerald-700 font-bold text-xl">
                      <div className="p-2.5 bg-emerald-100 rounded-xl">
                         <HelpCircle className="w-6 h-6" />
                      </div>
                      <h3>Practice Problems</h3>
                    </div>
                    {!isCompleted && (
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
                            <Lock className="w-3 h-3" /> Locked
                        </span>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {details.practiceProblems.map((prob, idx) => {
                      const isActive = activeProblemIndex === idx;
                      return (
                        <div key={idx} className={`rounded-3xl border transition-all duration-300 ${isActive ? 'bg-white border-indigo-500 shadow-xl ring-2 ring-indigo-500/10' : 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200'}`}>
                          <div className="p-6 md:p-8">
                             <div className="flex items-start gap-5">
                               <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 text-sm font-bold shrink-0 mt-0.5">
                                 {idx + 1}
                               </span>
                               <div className="flex-1">
                                 <span className="text-gray-900 font-bold block mb-4 text-lg">{prob}</span>
                                 <button 
                                  onClick={() => setActiveProblemIndex(isActive ? null : idx)}
                                  className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                 >
                                   <Code2 className="w-4 h-4" />
                                   {isActive ? 'Hide Compiler' : 'Open AI Compiler'}
                                   {isActive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                 </button>
                               </div>
                             </div>

                             {/* Compiler Area */}
                             {isActive && (
                               <div className="mt-6">
                                 <CodePlayground problem={prob} />
                               </div>
                             )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Quick Quiz Section */}
                <section>
                   <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3 text-amber-700 font-bold text-xl">
                            <div className="p-2.5 bg-amber-100 rounded-xl">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <h3>Knowledge Check</h3>
                        </div>
                   </div>
                   <QuizComponent 
                    topics={quizContext} 
                    dayId={title.replace(/[^a-zA-Z0-9]/g, '')} 
                    isLocked={!isCompleted}
                   />
                </section>
              </div>

            </div>
          ) : (
             <div className="text-center text-gray-400 py-10">
               No details available.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};