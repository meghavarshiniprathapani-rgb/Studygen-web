import React, { useState } from 'react';
import { generateFinalExam } from '../services/geminiService';
import { FinalExam, QuizQuestion } from '../types';
import { CodePlayground } from './CodePlayground';
import { GraduationCap, Lock, Unlock, CheckCircle, XCircle, ArrowRight, BookCheck, Loader2, Trophy } from 'lucide-react';

interface FinalAssessmentProps {
  topic: string;
  onComplete: () => void;
}

type ExamStage = 'locked' | 'loading' | 'mcq' | 'coding' | 'completed';

export const FinalAssessment: React.FC<FinalAssessmentProps> = ({ topic, onComplete }) => {
  const [stage, setStage] = useState<ExamStage>('locked');
  const [examData, setExamData] = useState<FinalExam | null>(null);
  
  // MCQ State
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqScore, setMcqScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  // Coding State
  const [codingIndex, setCodingIndex] = useState(0);

  const handleUnlock = async () => {
    setStage('loading');
    try {
      const data = await generateFinalExam(topic);
      setExamData(data);
      setStage('mcq');
    } catch (e) {
      console.error(e);
      setStage('locked'); // Revert on error
      alert("Failed to generate exam. Please try again.");
    }
  };

  const handleMcqOptionSelect = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(idx);
  };

  const checkMcqAnswer = () => {
    if (selectedOption === null || !examData) return;
    setIsAnswerChecked(true);
    if (selectedOption === examData.mcqs[mcqIndex].correctAnswerIndex) {
      setMcqScore(prev => prev + 1);
    }
  };

  const nextMcq = () => {
    if (!examData) return;
    if (mcqIndex < examData.mcqs.length - 1) {
      setMcqIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setStage('coding');
    }
  };

  const nextCodingProblem = () => {
    if (!examData) return;
    if (codingIndex < examData.codingProblems.length - 1) {
      setCodingIndex(prev => prev + 1);
    } else {
      setStage('completed');
      onComplete(); // Trigger completion callback
    }
  };

  if (stage === 'locked') {
    return (
      <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-4 bg-gray-800 rounded-full mb-6 border border-gray-700 shadow-inner">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Final Comprehensive Exam</h2>
          <p className="text-gray-400 max-w-lg mb-8">
            Prove your mastery of {topic}. This exam includes 5 multiple choice questions and 3 comprehensive coding challenges. 
            <br/><span className="text-xs uppercase tracking-widest text-indigo-400 mt-2 block">Available after completing the full course</span>
          </p>
          
          <button 
            onClick={handleUnlock}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5"
          >
            <Unlock className="w-4 h-4" />
            I have completed the course - Unlock Exam
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'loading') {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Preparing Your Exam</h3>
        <p className="text-gray-500">Curating difficult questions and coding scenarios...</p>
      </div>
    );
  }

  if (stage === 'mcq' && examData) {
    const question = examData.mcqs[mcqIndex];
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in">
        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <BookCheck className="w-6 h-6" />
            <h2 className="font-bold text-lg">Phase 1: Knowledge Check</h2>
          </div>
          <span className="bg-indigo-500 px-3 py-1 rounded-full text-xs font-semibold">
            Question {mcqIndex + 1} of {examData.mcqs.length}
          </span>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-medium text-gray-900 mb-8">{question.question}</h3>
          
          <div className="space-y-3 mb-8">
            {question.options.map((opt, idx) => {
               let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ";
               if (isAnswerChecked) {
                 if (idx === question.correctAnswerIndex) btnClass += "border-green-500 bg-green-50 text-green-800";
                 else if (idx === selectedOption) btnClass += "border-red-500 bg-red-50 text-red-800";
                 else btnClass += "border-gray-100 text-gray-400 opacity-50";
               } else {
                 if (idx === selectedOption) btnClass += "border-indigo-500 bg-indigo-50 text-indigo-900";
                 else btnClass += "border-gray-100 hover:border-indigo-200 hover:bg-gray-50 text-gray-700";
               }

               return (
                 <button 
                  key={idx} 
                  onClick={() => handleMcqOptionSelect(idx)}
                  disabled={isAnswerChecked}
                  className={btnClass}
                 >
                   <span>{opt}</span>
                   {isAnswerChecked && idx === question.correctAnswerIndex && <CheckCircle className="w-5 h-5 text-green-600" />}
                   {isAnswerChecked && idx === selectedOption && idx !== question.correctAnswerIndex && <XCircle className="w-5 h-5 text-red-600" />}
                 </button>
               )
            })}
          </div>

          <div className="flex justify-end">
            {!isAnswerChecked ? (
               <button 
                 onClick={checkMcqAnswer}
                 disabled={selectedOption === null}
                 className={`px-6 py-2 rounded-lg font-bold text-white transition-colors ${selectedOption !== null ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}`}
               >
                 Check Answer
               </button>
            ) : (
               <div className="w-full flex items-center justify-between animate-in slide-in-from-bottom-2">
                 <p className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3 flex-1 mr-4">
                   {question.explanation}
                 </p>
                 <button 
                   onClick={nextMcq}
                   className="px-6 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                 >
                   {mcqIndex < examData.mcqs.length - 1 ? 'Next Question' : 'Start Coding Phase'} <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'coding' && examData) {
    const problem = examData.codingProblems[codingIndex];
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in">
        <div className="bg-emerald-700 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <Code2Icon />
            <h2 className="font-bold text-lg">Phase 2: Coding Assessment</h2>
          </div>
          <div className="flex gap-1">
            {examData.codingProblems.map((_, i) => (
              <div key={i} className={`h-2 w-8 rounded-full ${i === codingIndex ? 'bg-white' : 'bg-emerald-600'}`} />
            ))}
          </div>
        </div>

        <div className="p-8">
           <div className="mb-6">
             <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-2">Problem {codingIndex + 1} of {examData.codingProblems.length}</h3>
             <div className="text-gray-800 text-lg font-medium leading-relaxed p-4 bg-gray-50 rounded-lg border border-gray-100">
               {problem}
             </div>
           </div>
           
           <CodePlayground problem={problem} />
           
           <div className="mt-6 flex justify-end">
             <button 
               onClick={nextCodingProblem}
               className="px-6 py-3 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all"
             >
               {codingIndex < examData.codingProblems.length - 1 ? 'Next Problem' : 'Finish Exam'} <ArrowRight className="w-4 h-4" />
             </button>
           </div>
        </div>
      </div>
    );
  }

  if (stage === 'completed') {
     return (
       <div className="bg-white rounded-2xl p-12 shadow-2xl border border-gray-100 text-center animate-in zoom-in-95">
         <div className="inline-flex p-6 bg-yellow-100 rounded-full text-yellow-600 mb-6">
           <Trophy className="w-16 h-16" />
         </div>
         <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Course Completed!</h2>
         <p className="text-xl text-gray-600 mb-8">
           You have successfully finished the study plan and the final assessment.
         </p>
         
         <div className="flex justify-center gap-8 mb-8">
           <div className="text-center p-4 bg-gray-50 rounded-xl min-w-[150px]">
             <div className="text-3xl font-bold text-indigo-600 mb-1">{mcqScore} / {examData?.mcqs.length}</div>
             <div className="text-xs text-gray-500 uppercase tracking-wide">MCQ Score</div>
           </div>
           <div className="text-center p-4 bg-gray-50 rounded-xl min-w-[150px]">
             <div className="text-3xl font-bold text-emerald-600 mb-1">Completed</div>
             <div className="text-xs text-gray-500 uppercase tracking-wide">Coding Phase</div>
           </div>
         </div>

         <div className="flex justify-center">
           <button 
             onClick={() => window.location.reload()}
             className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
           >
             Start New Study Plan
           </button>
         </div>
       </div>
     );
  }

  return null;
};

const Code2Icon = () => (
  <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);