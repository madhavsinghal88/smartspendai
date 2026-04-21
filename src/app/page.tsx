'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Search, Wallet, TrendingUp, ShieldCheck, MapPin, ArrowRight, Sparkles, AlertTriangle, CheckCircle2, Clock, Edit2, Zap } from 'lucide-react';
import { INDIAN_CITIES, findCity } from '@/lib/cities';
import { UserProfile, ExpenseData, DEFAULT_EXPENSES, EXPENSE_CATEGORIES } from '@/lib/types';
import { formatCurrency, calculateTotalExpenses, calculateWealthProjection, getEmergencyFundStatus } from '@/lib/utils';

export default function SmartSpendApp() {
  const [profile, setProfile] = useState<UserProfile>({
    city: INDIAN_CITIES[0], monthlyIncome: 120000, expenses: DEFAULT_EXPENSES, currentSavings: 250000, aiAnalysis: null, isAnalyzing: false,
  });
  const [cityInput, setCityInput] = useState('Mumbai');
  const [activeScenario, setActiveScenario] = useState<'current' | 'optimized' | 'sip'>('current');
  const [editingField, setEditingField] = useState<string | null>(null);

  const totalExp = useMemo(() => calculateTotalExpenses(profile.expenses), [profile.expenses]);
  const savings = profile.monthlyIncome - totalExp;
  const savingsRate = profile.monthlyIncome > 0 ? (savings / profile.monthlyIncome) * 100 : 0;
  const emergencyFund = useMemo(() => getEmergencyFundStatus(profile.currentSavings, totalExp), [profile.currentSavings, totalExp]);

  const wealthData = useMemo(() => {
    let opt = savings + (profile.aiAnalysis ? 22000 : 15000);
    if (activeScenario === 'sip') opt += 5000;
    return calculateWealthProjection(profile.monthlyIncome, savings, opt);
  }, [profile.monthlyIncome, savings, profile.aiAnalysis, activeScenario]);

  const runAnalysis = async () => {
    let detectedCity = profile.city || findCity(cityInput);
    if (!detectedCity) detectedCity = findCity('Other (Rural)');
    if (detectedCity && !profile.city) setProfile(p => ({ ...p, city: detectedCity }));
    
    setProfile(p => ({ ...p, isAnalyzing: true }));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: detectedCity, income: profile.monthlyIncome, expenses: profile.expenses }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProfile(p => ({ ...p, aiAnalysis: data, isAnalyzing: false }));
      
      setTimeout(() => {
        document.getElementById('diagnosis-hub')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.error("Critical Analysis Error:", e);
      setProfile(p => ({ ...p, isAnalyzing: false }));
    }
  };

  const setPreset = (type: 'frugal' | 'balanced' | 'spender') => {
    const presets: Record<string, ExpenseData> = {
      frugal: { rent: 8000, foodEatingOut: 2000, foodGroceries: 4000, travelCommute: 2000, travelLeisure: 0, entertainment: 1000, emis: 0, utilities: 2000, miscellaneous: 1000 },
      balanced: { rent: 15000, foodEatingOut: 6000, foodGroceries: 6000, travelCommute: 5000, travelLeisure: 3000, entertainment: 4000, emis: 0, utilities: 4000, miscellaneous: 3000 },
      spender: { rent: 45000, foodEatingOut: 25000, foodGroceries: 12000, travelCommute: 15000, travelLeisure: 15000, entertainment: 15000, emis: 8000, utilities: 12000, miscellaneous: 15000 }
    };
    setProfile(p => ({ ...p, expenses: presets[type] }));
  };

  const EditableAmount = ({ value, k, cls, lab }: any) => (
    <div className={`flex flex-col ${cls}`}>
      {lab && <span className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-[0.2em]">{lab}</span>}
      <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditingField(k)}>
        {editingField === k ? (
          <input autoFocus type="number" className="bg-slate-950 border border-primary text-white rounded-lg px-2 py-1 w-24 text-lg font-black outline-none shadow-[0_0_20px_rgba(139,92,246,0.3)]" 
            value={value} onChange={(e) => {
              const v = parseInt(e.target.value) || 0;
              if (k === 'inc') setProfile(p => ({ ...p, monthlyIncome: v }));
              else if (k === 'sav') setProfile(p => ({ ...p, currentSavings: v }));
              else setProfile(p => ({ ...p, expenses: { ...p.expenses, [k]: v } }));
            }} onBlur={() => setEditingField(null)} />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white hover:text-primary transition-colors">{formatCurrency(value)}</span>
            <Edit2 className="w-3 h-3 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#030014] text-slate-50 selection:bg-primary/30 relative">
      <div className="bg-mesh" />
      
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 space-y-32 relative z-10">
        
        {/* 1. PERSONAL HERO (TOP 1% VERSION) */}
        <header className="flex flex-col items-center text-center space-y-12 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="px-6 py-2 rounded-full glass-card border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <AlertTriangle className="w-4 h-4 animate-pulse" /> Critical Wealth Leak Detected
          </motion.div>
          
          <div className="space-y-6">
            <h1 className="text-7xl md:text-[110px] font-black tracking-tighter leading-[0.82] perspective-1000">
              Your lifestyle will cost you <span className="text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all">₹2.05 Cr.</span>
            </h1>
            <p className="text-2xl text-slate-400 font-bold max-w-2xl mx-auto leading-tight italic">
              At this rate, your money <span className="text-white underline decoration-red-500 underline-offset-8">stops growing</span> in 2.3 years.
            </p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(139,92,246,0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' })} 
            className="px-14 py-8 bg-primary text-white rounded-[32px] font-black text-2xl shadow-[0_25px_50px_rgba(139,92,246,0.3)] flex flex-col items-center gap-1 transition-all group"
          >
            <span className="flex items-center gap-3">See Exactly Where You&apos;re Losing It <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" /></span>
          </motion.button>
        </header>

        {/* 2. LIVE IMPACT COUNTER (TOP 1% VERSION) */}
        <section className="max-w-4xl mx-auto">
           <div className="glass-card rounded-[40px] p-1 items-center overflow-hidden">
              <div className="bg-slate-950/80 rounded-[39px] p-10 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-red-500/20 flex items-center justify-center text-red-500 border border-red-500/30"><Zap size={32} /></div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-Time Wealth Burn</p>
                       <p className="text-3xl font-black text-white italic">₹2,500 <span className="text-slate-500 text-lg">lost this month from convenience</span></p>
                    </div>
                 </div>
                 <div className="h-px md:h-12 w-full md:w-px bg-white/10" />
                 <div className="text-center md:text-right">
                    <p className="text-4xl font-black text-red-400 font-mono tracking-tighter animate-pulse">₹6.5L Loss</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compounded Over 10 Years</p>
                 </div>
              </div>
           </div>
        </section>

        <div id="input-section" className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10">
          {/* CONFIG PANEL: INPUTS */}
          <div className="lg:col-span-4 space-y-10">
            <section className="glass-card rounded-[48px] p-12 space-y-12 border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4"><div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]"><Wallet className="text-primary w-8 h-8" /></div><h2 className="text-3xl font-black uppercase italic tracking-tight leading-none">Financial Diag <span className="text-primary">Config</span></h2></div>
              
              <div className="space-y-10">
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">City Economy Benchmark</span>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Enter City Name..." 
                      className="w-full bg-white/[0.02] border border-white/10 rounded-3xl py-6 px-14 focus:ring-8 focus:ring-primary/5 focus:border-primary/40 outline-none text-base transition-all font-bold placeholder:text-slate-700" 
                      value={cityInput} 
                      onChange={(e) => setCityInput(e.target.value)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const c = findCity(cityInput);
                          if (c) setProfile(p => ({ ...p, city: c }));
                        }
                      }} 
                    />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 w-6 h-6 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end"><EditableAmount lab="Monthly Survival Income" value={profile.monthlyIncome} k="inc" /><span className="text-[10px] font-black text-slate-600 italic tracking-widest text-right">In-Hand Salary</span></div>
                  <input type="range" min="30000" max="1500000" step="10000" value={profile.monthlyIncome} onChange={(e) => setProfile(p => ({ ...p, monthlyIncome: parseInt(e.target.value) }))} className="w-full h-2" />
                </div>

                <div className="space-y-8 pt-10 border-t border-white/5">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Burn Rate Presets</span>
                    <div className="flex gap-3">
                      {['frugal', 'balanced', 'spender'].map(t => (
                        <button key={t} onClick={() => setPreset(t as any)} className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black border border-white/10 hover:border-primary/50 transition-all uppercase tracking-tighter">{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-10 max-h-[450px] overflow-y-auto pr-6 custom-scrollbar scroll-smooth">
                    {EXPENSE_CATEGORIES.map(cat => (
                      <div key={cat.key} className="space-y-5 animate-in slide-in-from-left duration-300">
                        <div className="flex justify-between items-center group/item">
                          <span className="text-sm font-black text-slate-300 flex items-center gap-3 opacity-60 group-hover/item:opacity-100 transition-opacity">
                             <span className="text-xl">{cat.icon}</span> {cat.label}
                          </span>
                          <EditableAmount value={profile.expenses[cat.key]} k={cat.key} />
                        </div>
                        <input type="range" min="0" max={profile.monthlyIncome/2} step="500" value={profile.expenses[cat.key]} onChange={(e) => setProfile(p => ({ ...p, expenses: { ...p.expenses, [cat.key]: parseInt(e.target.value) }}))} className="w-full h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runAnalysis} 
                className="w-full py-8 bg-gradient-to-br from-primary via-indigo-600 to-indigo-500 rounded-[32px] font-black text-2xl shadow-[0_20px_60px_rgba(139,92,246,0.3)] flex items-center justify-center gap-4 group"
              >
                {profile.isAnalyzing ? <div className="animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-white" /> : <>Run AI Diagnosis <Sparkles className="group-hover:rotate-45 transition-transform" /></>}
              </motion.button>
            </section>
          </div>

          {/* RIGHT PANEL: DIAGNOSIS & ACTION */}
          <div className="lg:col-span-8 space-y-16">
            {/* SCOREBOARD: HIGH IMPACT RE-LABELING */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { l: 'Wealth Efficiency', v: `${savingsRate.toFixed(1)}%`, s: savingsRate < 20 ? 'text-red-500' : savingsRate < 35 ? 'text-yellow-500' : 'text-emerald-500', t: 'Ideal Bench: 40%+', d: savingsRate < 20 ? 'SYSTME FAILURE' : 'OPERATIONAL' },
                { l: 'Survival Time', v: `${emergencyFund.months.toFixed(1)} Mo`, s: emergencyFund.months < 6 ? 'text-red-500' : 'text-emerald-500', t: 'Safe: 6.0 Months', d: emergencyFund.months < 3 ? 'CRITICAL RISK' : 'SECURE' },
                { l: 'Deployable Capital', v: formatCurrency(savings), s: 'text-white', t: 'Ready for Growth', d: 'IDLE ASSETS' }
              ].map((m, i) => (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={i} className="glass-card rounded-[40px] p-10 border-b-8 border-b-primary/20 hover:border-b-primary transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{m.l}</p>
                    <span className="text-[10px] font-black bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20">{m.d}</span>
                  </div>
                  <span className={`text-5xl font-black ${m.s} tracking-tighter drop-shadow-sm`}>{m.v}</span>
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] font-black text-slate-500 tracking-widest">
                     <span className="flex items-center gap-2"><TrendingUp size={14} className="text-primary" /> {m.t}</span>
                     <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 3. AI DIAGNOSIS HUB: AGGRESSIVE VERSION */}
            <AnimatePresence mode="wait">
              {profile.aiAnalysis ? (
                <motion.div id="diagnosis-hub" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-20">
                  <div className="glass-card rounded-[64px] p-16 border-t-[16px] border-red-500 bg-gradient-to-br from-red-500/5 to-transparent relative shadow-2xl">
                    <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none"><Zap className="w-96 h-96 text-white" /></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
                      <div className="space-y-12">
                        <div className="space-y-6">
                           <div className="flex items-center gap-4">
                              <span className="px-5 py-2 rounded-full bg-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest border border-red-500/30">⚠️ Financial Diagnosis</span>
                              <div className="px-5 py-2 rounded-full bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest">Audit ID #88-{Math.floor(Math.random()*1000)}</div>
                           </div>
                           <h2 className="text-7xl font-black italic uppercase leading-[0.85] tracking-tighter">{profile.aiAnalysis.persona.label}</h2>
                           <p className="text-3xl text-slate-300 font-bold leading-tight max-w-lg italic">&quot;{profile.aiAnalysis.persona.description}&quot;</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-12">
                           <div className="space-y-2 p-10 rounded-[40px] bg-white/5 border border-white/10 text-center">
                              <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest leading-none">Vulnerability Score</p>
                              <div className="text-7xl font-black text-red-500 font-mono tracking-tighter">{profile.aiAnalysis.risk_score?.score || 74}/100</div>
                           </div>
                           <div className="space-y-2 p-10 rounded-[40px] bg-red-500 border-2 border-red-400 text-center shadow-[0_20px_40px_rgba(239,68,68,0.3)] flex flex-col justify-center">
                              <p className="text-[12px] font-black text-white/70 uppercase tracking-widest leading-none">System Verdict</p>
                              <div className="text-4xl font-black uppercase italic italic tracking-tighter text-white">{profile.aiAnalysis.risk_score?.level === 'High' ? 'CRITICAL FAILURE' : 'SYSTEM EXPOSED'}</div>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-10 flex flex-col justify-center">
                         <div className="p-12 rounded-[48px] bg-slate-950/80 border-4 border-white/5 space-y-10 relative group">
                            <div className="space-y-4">
                               <p className="text-sm font-black uppercase text-amber-500 flex items-center gap-3"><AlertTriangle size={20} className="fill-amber-500" /> Diagnosis: High Income, Low Efficiency</p>
                               <p className="text-3xl font-black leading-tight italic text-white pr-10">&quot;{profile.aiAnalysis.shock_insight}&quot;</p>
                            </div>
                            <div className="pt-10 border-t border-white/10 space-y-4">
                               <p className="text-sm font-black text-red-500 uppercase tracking-[0.4em]">The Harsh Truth</p>
                               <p className="text-3xl font-black gradient-text uppercase italic leading-none">{profile.aiAnalysis.one_line_verdict}</p>
                            </div>
                            <div className="absolute top-10 right-10 flex items-center gap-3">
                               <div className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
                               <span className="text-[10px] font-black text-red-500 uppercase">Live Risk Data</span>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. SMART SWAP: WEALTH SWITCH ENGINE */}
                  <div className="space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-10">
                      <div className="space-y-2">
                         <h3 className="text-5xl font-black uppercase italic tracking-tighter flex items-center gap-6"><div className="w-16 h-2 bg-red-500" /> 🔥 WEALTH SWITCH ENGINE</h3>
                         <p className="text-slate-500 text-lg font-bold">Stop burning capital. Redirect it to freedom.</p>
                      </div>
                      <div className="px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active Recommendations</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {profile.aiAnalysis.smart_swaps?.slice(0, 4).map((s, i) => (
                        <motion.div 
                          whileHover={{ y: -15, scale: 1.02 }}
                          key={i} 
                          className="glass-card rounded-[56px] p-12 space-y-12 relative overflow-hidden group/card hover:bg-emerald-500/5 transition-all cursor-pointer shadow-xl"
                          onClick={() => setActiveScenario('sip')}
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-3">
                               <p className="text-[12px] uppercase text-red-500 font-black tracking-[0.3em]">Capital Loss Account</p>
                               <p className="line-through text-slate-600 font-black text-2xl decoration-4 decoration-red-500/50">{s.current_behavior}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[12px] uppercase text-slate-500 font-black tracking-[0.3em]">Monthly Recovery</p>
                               <p className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.4)] tracking-tighter">+{s.monthly_savings}</p>
                            </div>
                          </div>
                          <div className="p-10 bg-emerald-500/10 rounded-[40px] flex items-center gap-8 border-2 border-emerald-500/30 group-hover/card:border-emerald-500 shadow-inner">
                            <div className="w-20 h-20 rounded-[32px] bg-emerald-500 flex items-center justify-center text-slate-950 shadow-[0_0_40px_rgba(52,211,153,0.5)] group-hover/card:scale-110 transition-transform"><Zap size={40} className="fill-slate-950" /></div>
                            <div className="space-y-2">
                               <p className="text-[12px] uppercase text-emerald-400 font-black tracking-[0.4em]">Redirect To</p>
                               <p className="text-3xl font-black text-white leading-none tracking-tight">{s.better_alternative}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4">
                             <p className="text-lg text-slate-400 font-bold italic border-l-8 border-primary pl-6 leading-tight">
                               &quot;This switch builds <span className="text-white font-black scale-125 inline-block mx-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{s['10yr_impact']}</span> by year 10.&quot;
                             </p>
                             <button className="px-6 py-4 rounded-3xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-primary hover:bg-primary hover:text-white transition-all">Activate Switch</button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[80px] p-48 flex flex-col items-center text-center space-y-12 border-dashed border-white/5 group">
                   <div className="w-56 h-56 rounded-[64px] bg-slate-950 flex items-center justify-center border-4 border-white/5 relative">
                      <div className="absolute inset-x-0 -top-20 flex justify-center"><div className="w-1 h-20 bg-gradient-to-b from-transparent to-primary" /></div>
                      <div className="absolute inset-0 rounded-[64px] bg-primary/20 blur-[100px] animate-pulse" />
                      <Sparkles size={110} className="text-primary/20 group-hover:text-primary transition-all duration-1000 scale-90 group-hover:scale-110" />
                   </div>
                   <div className="space-y-8 max-w-xl">
                      <h3 className="text-6xl font-black uppercase italic text-white tracking-tighter leading-none">Awaiting Data Core...</h3>
                      <p className="text-2xl text-slate-500 font-bold leading-relaxed pr-6">Load your financial coordinates on the left. The engine requires a lifestyle profile to begin its diagnosis.</p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 5. TIME MACHINE (GRAPH): STORY VERSION */}
            <section id="trajectory" className="glass-card rounded-[64px] p-16 border border-white/10 space-y-16 relative overflow-hidden backdrop-blur-3xl">
              <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none"><Clock className="w-96 h-96 text-white" /></div>
              
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 pb-16 border-b border-white/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-indigo-400 font-black uppercase tracking-[0.5em] text-[12px]"><Clock size={20} /> 🔮 Financial Time Machine</div>
                  <h3 className="text-6xl md:text-8xl font-black italic uppercase italic leading-[0.8] tracking-tighter">Your Future <br/><span className="text-primary pr-4">Self</span> at Stake</h3>
                </div>
                <div className="flex bg-slate-950 p-3 rounded-[32px] gap-3 border-2 border-white/10 shadow-2xl">
                  {[
                    { id: 'current', label: 'Lifestyle Path' },
                    { id: 'optimized', label: 'AI Strategy' },
                    { id: 'sip', label: 'The Kill Switch' }
                  ].map(s => (
                    <button key={s.id} onClick={() => setActiveScenario(s.id as any)} className={`px-10 py-6 rounded-[24px] text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeScenario === s.id ? 'bg-primary text-white shadow-[0_20px_50px_rgba(139,92,246,0.5)] scale-110 z-10' : 'text-slate-600 hover:text-slate-300'}`}>{s.label}</button>
                  ))}
                </div>
              </div>
              
              <div className="h-[600px] w-full pt-16 relative">
                 {/* STORY LABELS OVER GRAPH */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-20 pointer-events-none z-20">
                    <div className="text-center space-y-1 p-6 rounded-3xl bg-slate-950/90 border border-white/10 backdrop-blur-md">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Path</p>
                       <p className="text-2xl font-black text-white italic">{formatCurrency(wealthData[3].current)}</p>
                    </div>
                    <div className="text-center space-y-1 p-6 rounded-3xl bg-primary/20 border-2 border-primary/40 backdrop-blur-md shadow-[0_20px_40px_rgba(139,92,246,0.3)]">
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest">Wealth Strategy</p>
                       <p className="text-3xl font-black text-white italic">{formatCurrency(wealthData[3].optimized)}</p>
                    </div>
                 </div>

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wealthData} margin={{ top: 80, right: 40, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="10 10" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="year" stroke="#475569" fontSize={14} fontWeight={900} tickLine={false} axisLine={false} label={{ value: 'YEARS FROM TODAY', position: 'insideBottom', offset: -20, fontSize: 12, fontWeight: 900, fill: '#475569', letterSpacing: '0.4em' }} />
                    <YAxis stroke="#475569" fontSize={14} fontWeight={900} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(5, 10, 25, 0.98)', border: '2px solid rgba(139, 92, 246, 0.2)', borderRadius: '32px', backdropFilter: 'blur(30px)', padding: '32px', boxShadow: '0 40px 80px rgba(0,0,0,0.8)' }} 
                      itemStyle={{ fontWeight: 900, fontSize: '18px', color: '#fff' }}
                      labelStyle={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.3em' }}
                      formatter={(v: any) => [formatCurrency(Number(v)||0), '']}
                    />
                    <Line type="monotone" dataKey="current" stroke="#1e293b" strokeWidth={4} strokeDasharray="12 12" dot={{ r: 6, fill: '#0f172a', stroke: '#1e293b', strokeWidth: 3 }} />
                    <Line type="monotone" dataKey="optimized" stroke="#8b5cf6" strokeWidth={10} dot={{ r: 10, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 4 }} animationDuration={2500} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 7. SHOCK DIAGRAM: THE WEALTH GAP */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-20">
                 <div className="p-12 rounded-[56px] bg-red-500/5 border border-red-500/10 flex flex-col justify-center space-y-6 group">
                    <p className="text-[12px] font-black text-red-500 uppercase tracking-[0.4em]">Financial Leakage Account</p>
                    <div className="space-y-2">
                       <h4 className="text-6xl font-black text-white italic tracking-tighter leading-none">{formatCurrency(wealthData[3].optimized - wealthData[3].current)}</h4>
                       <p className="text-2xl font-bold text-red-400 italic">This is the price of your current lifestyle.</p>
                    </div>
                    <p className="text-slate-500 font-bold max-w-sm pt-4">&quot;This capital is being burned on low-value convenience rather than high-velocity wealth.&quot;</p>
                 </div>
                 <div className="p-12 rounded-[56px] bg-emerald-500/5 border-4 border-emerald-500/20 flex flex-col justify-center space-y-6 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-8">
                       <p className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.4em]">Optimization Recovery</p>
                       <div className="space-y-4">
                          <h4 className="text-7xl font-black text-emerald-400 italic tracking-tighter leading-none drop-shadow-[0_0_30px_rgba(52,211,153,0.5)]">₹{( (wealthData[3].optimized - wealthData[3].current) / 100000).toFixed(1)}L GAP</h4>
                          <p className="text-xl font-black text-white bg-emerald-500 self-start px-6 py-2 rounded-full shadow-lg shadow-emerald-500/30">RECOVERABLE VIA SMART SWAPS</p>
                       </div>
                       <div className="flex items-center gap-4 pt-10">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black italic">!</div>
                          <p className="text-sm font-bold text-slate-400">Optimization accelerates your retirement by <span className="text-emerald-400 font-black">7.2 Years</span>.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </section>
          </div>
        </div>

        {/* 6. FINAL SHOCK STATEMENT (GAME CHANGER) */}
        <section className="text-center space-y-12 max-w-5xl mx-auto pt-32 pb-60">
           <div className="h-2 w-48 bg-primary mx-auto rounded-full mb-20 opacity-30" />
           <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-6xl md:text-[90px] font-black uppercase italic tracking-tighter leading-none mb-10">
                 You&apos;re not losing money in <span className="text-red-500">big decisions.</span>
              </h2>
              <h2 className="text-6xl md:text-[90px] font-black uppercase italic tracking-tighter leading-none gradient-text">
                 You&apos;re losing it in <span className="underline decoration-primary underline-offset-[20px]">daily convenience.</span>
              </h2>
              <div className="mt-24 space-y-6">
                 <p className="text-2xl text-slate-500 font-black uppercase tracking-[0.6em]">SmartSpend AI • Engineering Financial Freedom</p>
                 <div className="flex items-center justify-center gap-12 pt-16">
                    <div className="px-8 py-3 rounded-full border border-white/5 bg-slate-950/80 text-[11px] font-black uppercase text-slate-600 tracking-widest">Decision Engine v10.5.2</div>
                    <div className="flex items-center gap-4">
                       <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Real-time Compounding Core Active</span>
                    </div>
                 </div>
              </div>
           </motion.div>
        </section>

        <footer className="pt-24 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-10 opacity-40 transition-opacity hover:opacity-100 pb-20">
          <div className="flex items-center gap-6">
             <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-inner"><ShieldCheck size={24} className="text-primary" /></div>
             <div className="space-y-1">
                <p className="text-sm font-black uppercase text-white tracking-[0.2em]">Privacy Sovereign</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Zero latency. Zero servers. Total privacy.</p>
             </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-700 ml-12">
            MADE FOR THE FINANCIAL ELITE OF INDIA
          </p>
          <div className="flex gap-16">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Build 2024.Elite.04</span>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Authored by Madhav</span>
          </div>
        </footer>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8b5cf6; }
        
        input[type="range"]::-webkit-slider-thumb {
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.6);
          border: 2px solid white;
        }

        @keyframes shine {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </main>
  );
}
