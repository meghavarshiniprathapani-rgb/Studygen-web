import React, { useState, useMemo } from 'react';
import { StudyPlan, DayDetails, DayPlan } from '../types';
import { getDayDetails } from '../services/geminiService';
import { DayDetailsModal } from './DayDetailsModal';
import { Calendar, ArrowRight, Sparkles, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { FinalAssessment } from './FinalAssessment';

interface PlanDisplayProps {
  plan: StudyPlan;
  onPlanComplete: () => void;
}

type TimelineItem = 
  | { type: 'header'; period: string; focus: string }
  | { type: 'day'; day: DayPlan; period: string; globalIndex: number };

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onPlanComplete }) => {
  const [selectedDay, setSelectedDay] = useState<{title: string, details: DayDetails | null} | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];
    let dayCount = 0;
    
    plan.schedule.forEach((period) => {
      items.push({ 
        type: 'header', 
        period: period.period, 
        focus: period.focus 
      });
      
      period.days.forEach((day) => {
        items.push({ 
          type: 'day', 
          day: day, 
          period: period.period,
          globalIndex: dayCount 
        });
        dayCount++;
      });
    });
    
    return items;
  }, [plan]);

  const handleDayClick = async (focus: string, dayLabel: string, topics: string[]) => {
    setModalOpen(true);
    setSelectedDay({ title: `${dayLabel}: ${focus}`, details: null });
    setIsLoadingDetails(true);

    try {
      const details = await getDayDetails(focus, dayLabel, topics);
      setSelectedDay({ title: `${dayLabel}: ${focus}`, details });
    } catch (error) {
      console.error("Failed to fetch day details", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <>
      <div className="space-y-12 animate-fade-in pb-20 mt-12">
        {/* Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-12 border border-white dark:border-slate-800 relative overflow-hidden transition-colors">
          <div className="absolute inset-0 opacity-10 dark:opacity-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-purple-100 dark:via-purple-900 to-transparent"></div>
          
          <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100 dark:border-indigo-800">
                      <Sparkles className="w-3 h-3" /> Personalized Roadmap
                   </div>
                   <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">{plan.title}</h2>
                   <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl text-lg">{plan.overview}</p>
                </div>
              </div>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 md:left-1/2 top-4 bottom-0 w-px bg-slate-200 dark:bg-slate-800 md:-translate-x-1/2"></div>

            <div className="space-y-12">
              {timelineItems.map((item, index) => {
                if (item.type === 'header') {
                  return (
                    <div key={`header-${index}`} className="relative flex justify-center z-10 pt-4">
                       <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-8 py-3 rounded-full font-bold shadow-md shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 text-sm uppercase tracking-wider flex items-center gap-3">
                         <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                         {item.period} 
                         <span className="text-slate-300 dark:text-slate-700">|</span> 
                         <span className="text-indigo-600 dark:text-indigo-400">{item.focus}</span>
                       </div>
                    </div>
                  );
                }

                const isLeft = item.globalIndex % 2 === 0;
                const dayLabel = `Day ${item.globalIndex + 1}`;
                
                return (
                  <div 
                    key={`day-${item.globalIndex}`} 
                    className={`relative flex items-stretch md:items-center w-full ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                     {/* Timeline Node */}
                     <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-white dark:bg-slate-950 border-[3px] border-indigo-500 rounded-full -translate-x-[7px] z-20 shadow-sm"></div>

                     {/* Content Card */}
                     <div className="w-full md:w-[45%] pl-16 md:pl-0">
                        <div 
                            className={`
                              group bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 
                              transition-all duration-300 cursor-pointer relative overflow-hidden
                              ${isLeft ? 'md:mr-8 md:text-right' : 'md:ml-8 md:text-left'} 
                              hover:-translate-y-1
                            `}
                            onClick={() => handleDayClick(item.period, dayLabel, item.day.topics)}
                        >
                            <div className={`absolute top-0 w-1.5 h-full bg-indigo-500 transition-opacity opacity-0 group-hover:opacity-100 ${isLeft ? 'right-0' : 'left-0'}`}></div>
                            
                            <div className={`flex flex-col gap-2 mb-4 ${isLeft ? 'md:items-end' : 'md:items-start'}`}>
                                <h4 className="font-bold text-slate-900 dark:text-white text-2xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{dayLabel}</h4>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                   {item.day.topics.length} Key Concepts
                                </span>
                            </div>
                            
                            <div className={`space-y-4 ${isLeft ? 'md:flex md:flex-col md:items-end' : ''}`}>
                                {item.day.topics.length > 0 && (
                                    <div className={`flex flex-wrap gap-2 ${isLeft ? 'md:justify-end' : ''}`}>
                                        {item.day.topics.slice(0, 3).map((t, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className={`pt-4 border-t border-slate-50 dark:border-slate-800 w-full ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                                   <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors justify-start md:justify-[inherit]">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      {item.day.activities[0]}
                                   </p>
                                </div>
                            </div>
                        </div>
                     </div>
                     <div className="hidden md:block w-[45%]" />
                  </div>
                );
              })}
            </div>
        </div>
        
        <div className="mt-24">
          <FinalAssessment topic={plan.title} onComplete={onPlanComplete} />
        </div>
      </div>

      <DayDetailsModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        loading={isLoadingDetails}
        details={selectedDay?.details || null}
        title={selectedDay?.title || ''}
      />
    </>
  );
};