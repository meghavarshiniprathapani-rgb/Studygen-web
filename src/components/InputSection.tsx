import React, { useState, useRef } from 'react';
import { Duration, Intensity } from '../types';
import { BookOpen, Clock, Zap, Sparkles, ChevronDown, Mic, Loader2 } from 'lucide-react';

interface InputSectionProps {
  onGenerate: (topic: string, duration: Duration, intensity: Intensity) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState<Duration>(Duration.ONE_WEEK);
  const [intensity, setIntensity] = useState<Intensity>(Intensity.MEDIUM);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic, duration, intensity);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTopic(prev => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${transcript}` : transcript;
      });
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="relative group">
      {/* Glow Effect behind card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 dark:opacity-10"></div>
      
      <div className="relative bg-white dark:bg-slate-900 rounded-[2.2rem] shadow-xl shadow-slate-200/50 dark:shadow-none p-6 md:p-10 border border-white dark:border-slate-800 transition-colors">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Main Topic Input */}
          <div>
            <label htmlFor="topic" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-4 h-4" />
              </div>
              What do you want to learn?
            </label>
            <div className="relative">
              <textarea
                id="topic"
                rows={3}
                className={`w-full px-6 py-5 pr-14 rounded-2xl border transition-all resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-lg font-medium shadow-inner outline-none bg-slate-50 dark:bg-slate-950 ${isListening ? 'border-indigo-500 ring-4 ring-indigo-500/10 dark:ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20'}`}
                placeholder={isListening ? "Listening..." : "e.g. 'Advanced React patterns' or paste your syllabus..."}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-4 bottom-4 p-2.5 rounded-xl transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                }`}
                title={isListening ? "Stop recording" : "Use voice input"}
                disabled={isLoading}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration Select */}
            <div>
              <label htmlFor="duration" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Clock className="w-4 h-4" />
                </div>
                Timeframe
              </label>
              <div className="relative group/select">
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as Duration)}
                  disabled={isLoading}
                  className="w-full pl-6 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none appearance-none text-slate-700 dark:text-slate-200 font-medium cursor-pointer transition-all bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20"
                >
                  {Object.values(Duration).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 group-hover/select:text-indigo-600 transition-colors">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Intensity Select */}
            <div>
              <label htmlFor="intensity" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                   <Zap className="w-4 h-4" />
                </div>
                Intensity
              </label>
               <div className="relative group/select">
                <select
                  id="intensity"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value as Intensity)}
                  disabled={isLoading}
                  className="w-full pl-6 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none appearance-none text-slate-700 dark:text-slate-200 font-medium cursor-pointer transition-all bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20"
                >
                  {Object.values(Intensity).map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 group-hover/select:text-indigo-600 transition-colors">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className={`w-full py-5 rounded-2xl text-white font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all duration-300 transform active:scale-[0.99] flex items-center justify-center gap-2 ${
              isLoading || !topic.trim()
                ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed shadow-none text-slate-500'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 dark:shadow-indigo-900/40'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Designing Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate Study Plan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};