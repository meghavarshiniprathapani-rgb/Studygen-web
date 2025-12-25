import React, { useState, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { PlanDisplay } from './components/PlanDisplay';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { StudyPlan, Duration, Intensity, User } from './types';
import { generateStudyPlan } from './services/geminiService';
import { BackgroundPaths } from './components/ui/background-paths';
import { GraduationCap, Sparkles, LogOut, User as UserIcon, LayoutDashboard, PlusCircle, ArrowLeft, Lock, ChevronRight, AlertCircle, Moon, Sun } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    // Initial restoration from localStorage
    const savedUser = localStorage.getItem('studygen_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'planner' | 'dashboard'>('planner');
  const [dashboardTab, setDashboardTab] = useState<'profile' | 'billing' | 'security'>('profile');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('studygen_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('studygen_user');
    }
  }, [user]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleGenerate = async (topic: string, duration: Duration, intensity: Intensity) => {
    if (!user) return;

    const TRIAL_DAYS = 3;
    const joinedDate = new Date(user.joinedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinedDate.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const isTrialActive = diffDays <= TRIAL_DAYS;

    const needsPayment = (!isTrialActive && !user.isPremium) || (user.planCompleted && !user.isPremium);

    if (needsPayment) {
        setDashboardTab('billing');
        setCurrentView('dashboard');
        setError(`Your ${TRIAL_DAYS}-day free trial has expired. Please upgrade to Pro to continue.`);
        return;
    }

    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const generatedPlan = await generateStudyPlan(topic, duration, intensity);
      setPlan(generatedPlan);
    } catch (err: any) {
      const message = err.message || "Failed to generate study plan. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanCompletion = () => {
      if (user) {
          setUser({ ...user, planCompleted: true, isPremium: false });
      }
  };

  const handleLogout = () => {
    // Clear Google Identity Services session if possible
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    setPlan(null);
    setError(null);
    setCurrentView('planner');
  };

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 relative overflow-x-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle Grid - only visible in dark mode via class */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100 dark-grid-bg' : 'opacity-0'}`}></div>
        
        {/* Animated Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[100px] animate-blob transition-colors duration-1000"></div>
          <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000 transition-colors duration-1000"></div>
          <div className="absolute bottom-[-10%] left-[10%] w-[550px] h-[550px] bg-emerald-500/10 dark:bg-emerald-600/5 rounded-full blur-[100px] animate-blob animation-delay-4000 transition-colors duration-1000"></div>
        </div>
        
        {/* Spotlight Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.08),transparent_70%)] transition-colors duration-1000"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 glass-panel rounded-2xl px-6 py-3 flex justify-between items-center shadow-sm/50 transition-all duration-300">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentView('planner')}
          title="Back to Planner"
        >
           <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2 rounded-xl group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
             <GraduationCap className="w-5 h-5 text-white" />
           </div>
           <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">StudyGen</span>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

          <button 
            onClick={() => { setCurrentView('dashboard'); setDashboardTab('profile'); }}
            className={`flex items-center gap-2.5 text-sm font-medium transition-all px-4 py-2 rounded-xl border ${
                currentView === 'dashboard' 
                ? 'bg-indigo-50/80 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400' 
                : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border overflow-hidden ${currentView === 'dashboard' ? 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-800' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
               {user.avatar ? (
                 <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
               ) : (
                 <UserIcon className="w-4 h-4 text-slate-400" />
               )}
            </div>
            <span className="hidden md:block">{user.name}</span>
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

          <button 
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-20 pb-20">
        
        {currentView === 'dashboard' ? (
            <div className="animate-fade-in pt-12">
                <button 
                  onClick={() => setCurrentView('planner')}
                  className="mb-8 group flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 group-hover:border-indigo-200 transition-colors shadow-sm">
                     <ArrowLeft className="w-4 h-4" /> 
                  </div>
                  Back to Planner
                </button>
                <Dashboard user={user} onUpdate={setUser} initialTab={dashboardTab} />
            </div>
        ) : (
            <>
                {/* Landing / Header */}
                {!plan && !loading && !error && (
                  <BackgroundPaths title="Master any topic" isDarkMode={isDarkMode}>
                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
                      Enter your syllabus or topic below, and our AI will engineer the perfect study schedule tailored to your pace.
                    </p>
                    <div className="max-w-2xl mx-auto relative z-20">
                       <InputSection onGenerate={handleGenerate} isLoading={loading} />
                    </div>
                  </BackgroundPaths>
                )}

                {/* Main Planner Content */}
                <main className="animate-fade-in space-y-8 mt-12">
                  {(plan || loading || error) && (
                    <>
                       {loading && (
                         <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="relative mb-6">
                              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                              <GraduationCap className="w-16 h-16 text-indigo-600 relative animate-bounce" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Architecting your journey...</h2>
                            <p className="text-slate-500 dark:text-slate-400">Curating the best resources for your topic.</p>
                         </div>
                       )}

                       {!loading && error && (
                         <div className="p-5 rounded-2xl bg-red-50/80 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 flex items-start gap-4 animate-in slide-in-from-top-4 shadow-sm">
                            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                               <p className="font-bold text-sm uppercase tracking-wider">Plan Generation Halted</p>
                               <p className="text-sm leading-relaxed">{error}</p>
                            </div>
                         </div>
                       )}

                       {plan && !loading && (
                          <PlanDisplay plan={plan} onPlanComplete={handlePlanCompletion} />
                       )}

                       {(error || plan) && !loading && (
                          <div className="flex justify-center mt-8">
                            <button 
                              onClick={() => { setPlan(null); setError(null); }}
                              className="px-6 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-2 shadow-sm transition-all active:scale-95"
                            >
                              <PlusCircle className="w-4 h-4" /> Start another plan
                            </button>
                          </div>
                       )}
                    </>
                  )}
                </main>
            </>
        )}
        
        <footer className="mt-24 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} StudyGen AI. Crafted for learners.</p>
        </footer>
      </div>
    </div>
  );
}