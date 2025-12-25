import React, { useState } from 'react';
import { Play, RotateCcw, Check, XCircle, Terminal, Loader2, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { checkCode, getSolution } from '../services/geminiService';

interface CodePlaygroundProps {
  problem: string;
}

const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'C#'];

const STARTER_CODE: Record<string, string> = {
  Python: `def solve():\n    # Write your code here\n    print("Hello World")\n\nsolve()`,
  JavaScript: `function solve() {\n    // Write your code here\n    console.log("Hello World");\n}\n\nsolve();`,
  Java: `public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n        System.out.println("Hello World");\n    }\n}`,
  'C++': `#include <iostream>\n\nint main() {\n    // Write your code here\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}`,
  'C#': `using System;\n\npublic class Program {\n    public static void Main() {\n        // Write your code here\n        Console.WriteLine("Hello World");\n    }\n}`
};

export const CodePlayground: React.FC<CodePlaygroundProps> = ({ problem }) => {
  const [language, setLanguage] = useState('Python');
  const [code, setCode] = useState(STARTER_CODE['Python']);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Solution Feature State
  const [attempts, setAttempts] = useState(0);
  const [solutionCode, setSolutionCode] = useState<string | null>(null);
  const [isSolutionVisible, setIsSolutionVisible] = useState(false);
  const [isLoadingSolution, setIsLoadingSolution] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang] || '');
    // Reset solution state when language changes
    setSolutionCode(null);
    setIsSolutionVisible(false);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setFeedback(null);
    setOutput('');
    // Increment attempts when running code
    setAttempts(prev => prev + 1);
    
    try {
      const result = await checkCode(problem, code, language, input);
      setOutput(result.output);
      setFeedback({
        text: result.analysis,
        success: result.isCorrect
      });
    } catch (error) {
      setOutput('Error connecting to compiler service.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleShowSolution = async () => {
    if (isSolutionVisible) {
      setIsSolutionVisible(false);
      return;
    }

    if (!solutionCode) {
      setIsLoadingSolution(true);
      try {
        const sol = await getSolution(problem, language);
        setSolutionCode(sol);
        setIsSolutionVisible(true);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingSolution(false);
      }
    } else {
      setIsSolutionVisible(true);
    }
  };

  const isLocked = attempts < 3;

  return (
    <div className="mt-6 border border-gray-700 rounded-3xl overflow-hidden bg-[#1e1e1e] text-gray-300 shadow-2xl animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#252526] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-bold text-gray-200">AI Compiler</span>
        </div>
        <div className="flex gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-[#3c3c3c] text-white text-xs px-3 py-1.5 rounded-xl border border-gray-600 outline-none focus:border-indigo-500"
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 h-[400px]">
        {/* Editor */}
        <div className="relative border-b md:border-b-0 md:border-r border-gray-700">
          {isSolutionVisible ? (
             <div className="w-full h-full relative">
               <div className="absolute top-4 right-4 z-10 bg-emerald-900/80 text-emerald-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-xl backdrop-blur-sm border border-emerald-700/50">
                 Solution
               </div>
               <textarea
                 value={solutionCode || ''}
                 readOnly
                 className="w-full h-full bg-[#1e1e1e] text-emerald-100 p-6 font-mono text-sm outline-none resize-none leading-relaxed opacity-90"
               />
             </div>
          ) : (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-[#1e1e1e] text-gray-200 p-6 font-mono text-sm outline-none resize-none leading-relaxed"
              spellCheck={false}
              placeholder="// Write your solution here..."
            />
          )}
        </div>

        {/* IO Panel */}
        <div className="flex flex-col bg-[#1e1e1e]">
          {/* Input */}
          <div className="flex-1 p-5 border-b border-gray-700">
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-2.5 block tracking-widest">Standard Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input data..."
              className="w-full h-[calc(100%-1.8rem)] bg-[#252526] text-gray-300 p-3 rounded-xl border border-gray-700 font-mono text-xs outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Output */}
          <div className="flex-1 p-5 bg-[#1e1e1e] relative">
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-2.5 block tracking-widest">Output Log</label>
            <pre className={`w-full h-[calc(100%-1.8rem)] overflow-auto font-mono text-xs whitespace-pre-wrap p-3 rounded-xl border border-gray-700 ${feedback?.success === false ? 'text-red-400 bg-red-900/10 border-red-900/30' : 'text-green-400 bg-[#252526]'}`}>
              {isRunning ? 'Executing...' : output || 'Run code to see logs'}
            </pre>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-4 bg-[#252526] border-t border-gray-700">
        <div className="flex items-center gap-3">
          {feedback && (
             <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight px-4 py-2 rounded-full ${feedback.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
               {feedback.success ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
               {feedback.text}
             </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
           {/* Solution Button */}
           <button
             onClick={handleShowSolution}
             disabled={isLocked && !isSolutionVisible} 
             className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-bold uppercase tracking-tight transition-all ${
               isLocked && !isSolutionVisible
                 ? 'text-gray-500 bg-gray-800 cursor-not-allowed border border-gray-700' 
                 : isSolutionVisible
                   ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50 hover:bg-emerald-900/70'
                   : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
             }`}
           >
             {isLoadingSolution ? (
               <Loader2 className="w-3.5 h-3.5 animate-spin" />
             ) : isSolutionVisible ? (
               <EyeOff className="w-3.5 h-3.5" />
             ) : isLocked ? (
               <Lock className="w-3.5 h-3.5" />
             ) : (
               <Eye className="w-3.5 h-3.5" />
             )}
             
             {isSolutionVisible 
               ? 'Hide' 
               : isLocked 
                 ? `Unlock (${3 - attempts})` 
                 : 'Solution'
             }
           </button>

           <div className="w-px h-6 bg-gray-700 mx-2"></div>

           <button 
            onClick={() => { setCode(STARTER_CODE[language]); setOutput(''); setFeedback(null); }}
            className="p-2.5 text-gray-400 hover:text-white transition-colors"
            title="Reset"
           >
             <RotateCcw className="w-5 h-5" />
           </button>
           <button
             onClick={handleRun}
             disabled={isRunning}
             className={`flex items-center gap-2 px-6 py-2 rounded-2xl text-sm font-extrabold transition-all ${
               isRunning 
                 ? 'bg-indigo-900/50 text-indigo-400 cursor-wait' 
                 : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
             }`}
           >
             {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
             Run
           </button>
        </div>
      </div>
    </div>
  );
};