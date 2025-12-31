import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { User as UserIcon, Mail, Save, LayoutDashboard, Settings, CreditCard, Shield, Check, AlertCircle, Key, Smartphone, Camera, Upload, Clock, Wifi, Lock, ArrowLeft, Eye, EyeOff, Circle } from 'lucide-react';

interface DashboardProps {
  user: User;
  onUpdate: (user: User) => void;
  initialTab?: 'profile' | 'billing' | 'security';
}

type Tab = 'profile' | 'billing' | 'security';

export const Dashboard: React.FC<DashboardProps> = ({ user, onUpdate, initialTab = 'profile' }) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [formData, setFormData] = useState<User>(user);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security Tab States
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Billing States
  const [showCardForm, setShowCardForm] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'input' | 'otp'>('input');
  const [cardError, setCardError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [paymentData, setPaymentData] = useState({ number: '', expiry: '', cvv: '' });

  // Calculate Trial Status
  const TRIAL_DAYS = 3;
  const joinedDate = new Date(user.joinedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joinedDate.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const isTrialActive = diffDays <= TRIAL_DAYS;
  const remainingDays = Math.max(0, Math.ceil(TRIAL_DAYS - diffDays));

  // Password Validation Logic
  const passwordRequirements = [
    { label: "8+ characters", met: passwordData.new.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(passwordData.new) },
    { label: "Lowercase", met: /[a-z]/.test(passwordData.new) },
    { label: "Number", met: /[0-9]/.test(passwordData.new) },
    { label: "Special char", met: /[!@#$%^&*_\-+=?]/.test(passwordData.new) },
    { label: "No spaces", met: passwordData.new.length > 0 && !/\s/.test(passwordData.new) },
  ];

  const isNewPasswordStrong = passwordRequirements.every(req => req.met);
  const passwordsMatch = passwordData.new === passwordData.confirm && passwordData.new !== '';

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(formData); 
      setIsSaving(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 800);
  };

  const handleSecurityUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (passwordData.new || passwordData.confirm) {
        if (!isNewPasswordStrong) {
            setErrorMessage("New password does not meet security requirements.");
            return;
        }
        if (passwordData.new !== passwordData.confirm) {
            setErrorMessage("New passwords do not match.");
            return;
        }
    }

    setIsSaving(true);
    setTimeout(() => {
        setIsSaving(false);
        setSuccessMessage("Security settings updated successfully!");
        setPasswordData({ current: '', new: '', confirm: '' });
        setTimeout(() => setSuccessMessage(null), 3000);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentInput = (field: string, value: string) => {
      let formatted = value;
      if (field === 'number') {
          formatted = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
      } else if (field === 'expiry') {
          formatted = value.replace(/\D/g, '').slice(0, 4);
          if (formatted.length >= 2) {
              formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
          }
      } else if (field === 'cvv') {
          formatted = value.replace(/\D/g, '').slice(0, 3);
      }
      setPaymentData(prev => ({ ...prev, [field]: formatted }));
      setCardError(null);
  };

  const initiatePayment = (e: React.FormEvent) => {
      e.preventDefault();
      const rawNum = paymentData.number.replace(/\s/g, '');
      if (rawNum.length !== 16) {
          setCardError("Card number must be 16 digits.");
          return;
      }
      const [mm, yy] = paymentData.expiry.split('/').map(Number);
      if (!mm || !yy || mm < 1 || mm > 12) {
           setCardError("Invalid date format. Use MM/YY.");
           return;
      }
      const now = new Date();
      const currentYear = parseInt(now.getFullYear().toString().slice(-2));
      const currentMonth = now.getMonth() + 1;
      const fullYear = yy < 50 ? 2000 + yy : 1900 + yy;
      const today = new Date();
      const expiryDate = new Date(fullYear, mm - 1, 1);
      
      if (expiryDate < new Date(today.getFullYear(), today.getMonth(), 1)) {
          setCardError("Card has expired. Please check the date.");
          return;
      }
      
      if (paymentData.cvv.length < 3) {
          setCardError("Invalid CVV code. Must be 3 digits.");
          return;
      }
      setCardError(null);
      setPaymentStep('otp');
      setSuccessMessage("Verification code sent to your mobile: 4826");
      setTimeout(() => setSuccessMessage(null), 5000);
  };

  const confirmPayment = (e: React.FormEvent) => {
      e.preventDefault();
      if (otp.length < 4) {
          setCardError("Please enter a valid OTP.");
          return;
      }
      setIsSaving(true);
      setCardError(null);
      setTimeout(() => {
          setIsSaving(false);
          const updatedUser = { 
              ...user, 
              hasPaymentMethod: true, 
              isPremium: true,
              planCompleted: false
          };
          onUpdate(updatedUser);
          setFormData(updatedUser);
          setShowCardForm(false);
          setPaymentStep('input');
          setPaymentData({ number: '', expiry: '', cvv: '' });
          setOtp('');
          setSuccessMessage("Premium plan activated successfully!");
          setTimeout(() => setSuccessMessage(null), 3000);
      }, 2000);
  };

  const cancelPayment = () => {
      setShowCardForm(false); 
      setPaymentStep('input');
      setPaymentData({ number: '', expiry: '', cvv: '' });
      setOtp('');
      setCardError(null);
  };

  const inputClasses = "w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400/50";

  const renderContent = () => {
      switch(activeTab) {
          case 'profile':
              return (
                <form onSubmit={handleProfileUpdate} className="space-y-8 animate-fade-in max-w-xl">
                    <div className="flex items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-24 h-24 rounded-[2rem] ring-4 ring-slate-50 dark:ring-slate-900 shadow-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform group-hover:scale-105">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Photo</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">This will be displayed on your profile.</p>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                                Change photo
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className={inputClasses}
                                placeholder="Full Name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className={inputClasses}
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isSaving || !formData.name.trim()}
                            className="bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
              );
          case 'billing':
              return (
                  <div className="space-y-8 animate-fade-in max-w-xl">
                      <div className={`
                          relative rounded-3xl p-8 text-white shadow-2xl overflow-hidden min-h-[240px] flex flex-col justify-between
                          ${user.isPremium ? 'bg-slate-900 dark:bg-indigo-950/40' : 'bg-gradient-to-br from-indigo-600 to-violet-700'}
                      `}>
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                          <div className="relative z-10 flex justify-between items-start">
                              <div>
                                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Current Plan</p>
                                  <h3 className="text-2xl font-bold tracking-tight">{user.isPremium ? 'Pro Membership' : 'Free Trial'}</h3>
                              </div>
                              <Wifi className="w-6 h-6 text-white/50 rotate-90" />
                          </div>

                          <div className="relative z-10">
                              <div className="flex items-center gap-4 mb-6">
                                  <div className="w-12 h-8 bg-yellow-500/20 rounded-lg border border-yellow-500/40"></div>
                                  <div className="font-mono text-xl tracking-widest text-white/90">
                                    {user.hasPaymentMethod ? '•••• •••• •••• 4242' : '•••• •••• •••• ••••'}
                                  </div>
                              </div>
                              
                              <div className="flex justify-between items-end">
                                  <div>
                                      <p className="text-[10px] uppercase text-white/50 font-bold mb-0.5">Card Holder</p>
                                      <p className="font-medium tracking-wide">{user.name.toUpperCase()}</p>
                                  </div>
                                  <div className="text-right">
                                       <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${user.isPremium ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : isTrialActive ? 'bg-white/20 border-white/30' : 'bg-red-500/20 border-red-500/30 text-red-100'}`}>
                                           {user.isPremium ? 'ACTIVE' : isTrialActive ? `${remainingDays} DAYS LEFT` : 'EXPIRED'}
                                       </span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {!user.isPremium && (
                         <div className={`p-5 rounded-3xl flex gap-4 text-sm border ${isTrialActive ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-400' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-900 dark:text-red-400'}`}>
                             <Clock className={`w-6 h-6 shrink-0 ${isTrialActive ? 'text-amber-600' : 'text-red-600'}`} />
                             <div>
                                 <p className="font-bold">Plan Status</p>
                                 <p className={`opacity-80 ${!isTrialActive ? 'font-medium leading-relaxed' : ''}`}>
                                   {isTrialActive 
                                     ? `You have ${remainingDays} days remaining in your 3-day free trial.` 
                                     : "Your 3-day free trial has ended. Upgrade to Pro to unlock unlimited access."}
                                 </p>
                             </div>
                         </div>
                      )}

                      {!showCardForm && !user.isPremium ? (
                          <button 
                             onClick={() => setShowCardForm(true)}
                             className={`w-full py-5 border-2 border-dashed rounded-3xl font-bold transition-all flex items-center justify-center gap-2 ${
                                 !isTrialActive 
                                 ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm' 
                                 : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                             }`}
                          >
                              <CreditCard className="w-5 h-5" /> {isTrialActive ? 'Add Payment Method' : 'Upgrade to Pro Now'}
                          </button>
                      ) : (showCardForm || !user.hasPaymentMethod) && (
                           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none space-y-5 animate-in slide-in-from-top-2">
                               <div className="flex items-center justify-between mb-2">
                                   <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                      <Lock className="w-5 h-5 text-emerald-500" />
                                      {paymentStep === 'input' ? 'Secure Payment' : 'Verify Identity'}
                                   </h4>
                                   {paymentStep === 'otp' && (
                                       <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl font-bold">Step 2 of 2</span>
                                   )}
                               </div>

                               {cardError && (
                                   <div className="p-4 bg-red-950/20 dark:bg-red-950/40 border border-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-2xl flex items-center gap-3 animate-in shake duration-300">
                                       <AlertCircle className="w-5 h-5 shrink-0" />
                                       {cardError}
                                   </div>
                               )}

                               {paymentStep === 'input' ? (
                                   <form onSubmit={initiatePayment} className="space-y-5">
                                       <div>
                                           <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Card Number</label>
                                           <div className="relative">
                                               <input 
                                                  type="text" 
                                                  placeholder="0000 0000 0000 0000" 
                                                  className={`${inputClasses} pl-12 font-mono tracking-wider`}
                                                  value={paymentData.number}
                                                  onChange={(e) => handlePaymentInput('number', e.target.value)}
                                                  maxLength={19}
                                                  required 
                                               />
                                               <CreditCard className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-[1.1rem]" />
                                           </div>
                                       </div>
                                       <div className="grid grid-cols-2 gap-5">
                                           <div>
                                               <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Expiry Date</label>
                                               <input 
                                                  type="text" 
                                                  placeholder="MM/YY" 
                                                  className={`${inputClasses} font-mono tracking-wider`}
                                                  value={paymentData.expiry}
                                                  onChange={(e) => handlePaymentInput('expiry', e.target.value)}
                                                  maxLength={5}
                                                  required 
                                               />
                                           </div>
                                           <div>
                                               <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">CVV</label>
                                               <input 
                                                  type="text" 
                                                  placeholder="123" 
                                                  className={`${inputClasses} font-mono tracking-wider`}
                                                  value={paymentData.cvv}
                                                  onChange={(e) => handlePaymentInput('cvv', e.target.value)}
                                                  maxLength={3}
                                                  required 
                                               />
                                           </div>
                                       </div>
                                       <div className="flex gap-4 pt-4">
                                           <button type="button" onClick={cancelPayment} className="flex-1 py-4 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">Cancel</button>
                                           <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-500/25 transition-all active:scale-[0.98]">
                                               Proceed
                                           </button>
                                       </div>
                                   </form>
                               ) : (
                                   <form onSubmit={confirmPayment} className="space-y-5">
                                       <div className="text-center py-2">
                                           <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">Please enter the One-Time Password (OTP) sent to your mobile ending in ****88</p>
                                           <div className="flex justify-center gap-3">
                                               <input 
                                                  type="text" 
                                                  className="w-36 text-center text-2xl tracking-widest font-bold py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all text-slate-900 dark:text-white"
                                                  placeholder="0000"
                                                  maxLength={6}
                                                  value={otp}
                                                  onChange={(e) => {
                                                      const val = e.target.value.replace(/\D/g, '');
                                                      setOtp(val);
                                                      setCardError(null);
                                                  }}
                                                  autoFocus
                                               />
                                           </div>
                                       </div>
                                       
                                       <div className="flex gap-4 pt-4">
                                           <button 
                                              type="button" 
                                              onClick={() => setPaymentStep('input')} 
                                              className="px-6 py-4 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors flex items-center gap-2"
                                           >
                                              <ArrowLeft className="w-5 h-5" /> Back
                                           </button>
                                           <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                               {isSaving ? 'Verifying...' : 'Verify & Pay $9.99'}
                                           </button>
                                       </div>
                                   </form>
                               )}
                           </div>
                      )}
                  </div>
              );
          case 'security':
              return (
                  <form onSubmit={handleSecurityUpdate} className="space-y-8 animate-fade-in max-w-xl">
                      {/* Password Section */}
                      <div className="space-y-8">
                          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="font-bold text-slate-900 dark:text-white">Password Settings</h4>
                          </div>
                          
                          <div className="space-y-6">
                              <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 ml-1 tracking-wider">Current Password</label>
                                <div className="relative">
                                    <input 
                                      type={showCurrent ? "text" : "password"}
                                      placeholder="••••••••••••" 
                                      className={inputClasses}
                                      value={passwordData.current}
                                      onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                    >
                                        {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 ml-1 tracking-wider">New Password</label>
                                  <div className="relative">
                                      <input 
                                          type={showNew ? "text" : "password"}
                                          placeholder="New Password" 
                                          className={inputClasses}
                                          value={passwordData.new}
                                          onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                                      />
                                      <button 
                                            type="button" 
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                        >
                                            {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 ml-1 tracking-wider">Confirm New</label>
                                  <div className="relative">
                                      <input 
                                          type={showConfirm ? "text" : "password"}
                                          placeholder="Confirm New" 
                                          className={`${inputClasses} ${passwordData.confirm !== '' && !passwordsMatch ? 'border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/20' : ''}`}
                                          value={passwordData.confirm}
                                          onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                                      />
                                      <button 
                                            type="button" 
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                        >
                                            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                  </div>
                                </div>
                              </div>

                              {/* Integrated Validation Feedback */}
                              {passwordData.new.length > 0 && (
                                <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-y-3 gap-x-6 animate-in slide-in-from-top-1">
                                    {passwordRequirements.map((req, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5">
                                        {req.met ? (
                                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white animate-in zoom-in duration-300">
                                            <Check className="w-2.5 h-2.5" strokeWidth={4} />
                                        </div>
                                        ) : (
                                        <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                                        )}
                                        <span className={`text-[11px] font-bold uppercase tracking-tight transition-colors duration-300 ${req.met ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`}>
                                        {req.label}
                                        </span>
                                    </div>
                                    ))}
                                    <div className="flex items-center gap-2.5 col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        {passwordsMatch ? (
                                            <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
                                        ) : (
                                            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                                        )}
                                        <span className={`text-[11px] font-bold uppercase tracking-tight ${passwordsMatch ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            Passwords Match
                                        </span>
                                    </div>
                                </div>
                              )}
                          </div>
                      </div>

                      {/* Authentication Section */}
                      <div className="space-y-6 pt-4">
                          <h4 className="font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">Authentication</h4>
                          <div className="flex items-center justify-between p-6 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
                               <div className="flex items-center gap-5">
                                   <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                                       <Smartphone className="w-7 h-7" />
                                   </div>
                                   <div>
                                       <p className="font-bold text-slate-900 dark:text-white">Two-Factor Auth</p>
                                       <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security.</p>
                                   </div>
                               </div>
                               <button 
                                 type="button"
                                 onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                 className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-500 ${twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                               >
                                   <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-500 shadow-md ${twoFactorEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                               </button>
                          </div>
                      </div>

                      {errorMessage && (
                        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-900/30 flex items-center gap-3 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-5 h-5" /> {errorMessage}
                        </div>
                      )}

                      <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isSaving || (passwordData.new !== '' && (!isNewPasswordStrong || !passwordsMatch))} 
                            className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98] ${
                                isSaving || (passwordData.new !== '' && (!isNewPasswordStrong || !passwordsMatch))
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                                : 'bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white'
                            }`}
                        >
                            {isSaving ? 'Updating...' : 'Update Security'}
                        </button>
                    </div>
                  </form>
              );
          default:
              return null;
      }
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 min-h-[600px] flex flex-col md:flex-row overflow-hidden animate-fade-in transition-colors duration-300">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50/50 dark:bg-slate-900/20 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col gap-3">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-4">Account</h2>
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                <Settings className="w-5 h-5" /> Profile
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${activeTab === 'billing' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                <CreditCard className="w-5 h-5" /> Billing
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${activeTab === 'security' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                <Shield className="w-5 h-5" /> Security
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 md:p-14 overflow-y-auto">
            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white capitalize mb-2 tracking-tight">
                    {activeTab === 'billing' ? 'Subscription' : activeTab === 'security' ? 'Security' : activeTab + ' Settings'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">Manage your account preferences and settings.</p>
            </div>
            
            {successMessage && (
                <div className="mb-10 p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center gap-4 animate-fade-in">
                    <Check className="w-6 h-6 shrink-0" />
                    <span className="font-semibold">{successMessage}</span>
                </div>
            )}
            
            {renderContent()}
        </div>
    </div>
  );
};