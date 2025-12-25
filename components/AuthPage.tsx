import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { GraduationCap, Mail, Lock, User as UserIcon, Loader2, AtSign, Sparkles, Eye, EyeOff, Check, Circle, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Password Requirements Logic
  const passwordRequirements = [
    { label: "8+ characters", met: formData.password.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(formData.password) },
    { label: "Lowercase", met: /[a-z]/.test(formData.password) },
    { label: "Number", met: /[0-9]/.test(formData.password) },
    { label: "Special char", met: /[!@#$%^&*_\-+=?]/.test(formData.password) },
    { label: "No spaces", met: formData.password.length > 0 && !/\s/.test(formData.password) },
  ];

  const isPasswordStrong = passwordRequirements.every(req => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const username = formData.username.trim();
    const password = formData.password.trim();

    if (!username || !password) {
       setError(`Please enter your Username and Password`);
       setIsLoading(false);
       return;
    }

    if (!isLogin) {
      // Signup Validations
      if (!formData.name.trim() || !formData.email.trim()) {
        setError("All fields are required for registration");
        setIsLoading(false);
        return;
      }

      if (!isPasswordStrong) {
        setError("Please ensure your password meets all security requirements.");
        setIsLoading(false);
        return;
      }

      if (password.toLowerCase().includes(username.toLowerCase())) {
        setError("Password should not contain your username.");
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
         setError("Please enter a valid email address");
         setIsLoading(false);
         return;
      }
    }

    // Mock Authentication Delay
    setTimeout(() => {
      onLogin({
        name: isLogin ? username : formData.name,
        email: isLogin ? `${username}@studygen.com` : formData.email,
        joinedAt: new Date().toISOString(),
        isPremium: false,
        hasPaymentMethod: false,
        planCompleted: false
      });
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16 xl:p-20 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] opacity-20"></div>
          <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px]"></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-xl">
               <GraduationCap className="w-6 h-6 text-indigo-300" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">StudyGen AI</span>
          </div>

          <div className="relative z-10 max-w-xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wide mb-6 backdrop-blur-sm">
                <Sparkles className="w-3 h-3" /> Intelligent Planning
             </div>
             <h2 className="text-5xl xl:text-6xl font-extrabold leading-tight mb-6">
               Master any topic <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">in record time.</span>
             </h2>
             <p className="text-lg text-slate-400 leading-relaxed mb-10">
               An intelligent study planner that generates structured schedules based on your syllabus or topic.
             </p>
          </div>
          <div className="relative z-10 text-sm text-slate-500">
             &copy; {new Date().getFullYear()} StudyGen AI. Crafted for learners.
          </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        <div className={`
            w-full max-w-[440px] bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] 
            border border-slate-200 dark:border-slate-800 relative z-10 transition-all duration-700 ease-out transform
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          
          <div className="px-10 pt-10 pb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isLogin ? 'Enter your credentials to log in.' : 'Join StudyGen and start your journey.'}
            </p>
          </div>

          <div className="px-10 pb-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-11 pr-3 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-all duration-200 text-sm"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <AtSign className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-11 pr-3 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-all duration-200 text-sm"
                    placeholder={isLogin ? "Enter your username" : "e.g. student123"}
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      className="block w-full pl-11 pr-3 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-all duration-200 text-sm"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="block w-full pl-11 pr-11 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-all duration-200 text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {!isLogin && formData.password.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-y-2 gap-x-4 animate-fade-in">
                    {passwordRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {req.met ? (
                          <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500 text-white animate-in zoom-in duration-300">
                             <Check className="w-2.5 h-2.5" strokeWidth={4} />
                          </div>
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-tight transition-colors duration-300 ${req.met ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Verify Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <CheckCircle2 className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="block w-full pl-11 pr-11 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-all duration-200 text-sm"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-2 rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 border border-red-100 animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (!isLogin && !isPasswordStrong)}
                className={`w-full py-4 px-4 mt-4 rounded-2xl shadow-lg text-sm font-bold text-white transition-all transform active:scale-[0.98] ${
                  isLoading || (!isLogin && !isPasswordStrong)
                    ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-500'
                    : 'bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-indigo-500/20'
                }`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isLogin ? 'Sign in' : 'Create account')}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};