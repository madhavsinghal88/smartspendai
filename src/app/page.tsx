'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Search, Wallet, TrendingUp, ShieldCheck, MapPin, ArrowRight, Sparkles, AlertTriangle, CheckCircle2, Clock, Edit2, Zap } from 'lucide-react';
import { findCity } from '@/lib/cities';
import { UserProfile, ExpenseData, DEFAULT_EXPENSES, EXPENSE_CATEGORIES } from '@/lib/types';
import { formatCurrency, calculateTotalExpenses, calculateWealthProjection, getEmergencyFundStatus } from '@/lib/utils';

export default function SmartSpendApp() {
  const [profile, setProfile] = useState<UserProfile>({
    city: null, monthlyIncome: 80000, expenses: DEFAULT_EXPENSES, currentSavings: 150000, aiAnalysis: null, isAnalyzing: false,
  });
  const [cityInput, setCityInput] = useState('');
  const [activeScenario, setActiveScenario] = useState<'current' | 'optimized' | 'sip'>('current');
  const [editingField, setEditingField] = useState<string | null>(null);

  const totalExp = useMemo(() => calculateTotalExpenses(profile.expenses), [profile.expenses]);
  const savings = profile.monthlyIncome - totalExp;
  const savingsRate = profile.monthlyIncome > 0 ? (savings / profile.monthlyIncome) * 100 : 0;
  const emergencyFund = useMemo(() => getEmergencyFundStatus(profile.currentSavings, totalExp), [profile.currentSavings, totalExp]);

  const wealthData = useMemo(() => {
    let opt = savings + (profile.aiAnalysis ? 18000 : 10000);
    if (activeScenario === 'sip') opt += 5000;
    return calculateWealthProjection(profile.monthlyIncome, savings, opt);
  }, [profile.monthlyIncome, savings, profile.aiAnalysis, activeScenario]);

  const runAnalysis = async () => {
    const detectedCity = profile.city || findCity(cityInput);
    if (!detectedCity) {
      alert("⚠️ City not detected. Please enter a valid Indian city (e.g., Mumbai, Bangalore) and click 'Detect' or press Enter first.");
      return;
    }
    if (!profile.city) setProfile(p => ({ ...p, city: detectedCity }));
    
    setProfile(p => ({ ...p, isAnalyzing: true }));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

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
      
      // Auto-scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.error("Critical Analysis Error:", e);
      alert("❌ Critical Error: Could not connect to the analysis engine. Please check your internet connection.");
      setProfile(p => ({ ...p, isAnalyzing: false }));
    }
  };

  const setPreset = (type: 'frugal' | 'balanced' | 'spender') => {
    const presets: Record<string, ExpenseData> = {
      frugal: { rent: 8000, foodEatingOut: 2000, foodGroceries: 4000, travelCommute: 2000, travelLeisure: 0, entertainment: 1000, emis: 0, utilities: 2000, miscellaneous: 1000 },
      balanced: { rent: 15000, foodEatingOut: 6000, foodGroceries: 6000, travelCommute: 5000, travelLeisure: 3000, entertainment: 4000, emis: 0, utilities: 4000, miscellaneous: 3000 },
      spender: { rent: 30000, foodEatingOut: 15000, foodGroceries: 10000, travelCommute: 10000, travelLeisure: 10000, entertainment: 12000, emis: 5000, utilities: 7000, miscellaneous: 10000 }
    };
    setProfile(p => ({ ...p, expenses: presets[type] }));
  };

  const EditableAmount = ({ value, k, cls, lab }: any) => (
    <div className={`flex flex-col ${cls}`}>
      {lab && <span className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-wider">{lab}</span>}
      <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditingField(k)}>
        {editingField === k ? (
          <input autoFocus type="number" className="bg-slate-900 border border-primary text-white rounded-lg px-2 py-1 w-24 text-lg font-black outline-none shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
            value={value} onChange={(e) => {
              const v = parseInt(e.target.value) || 0;
              if (k === 'inc') setProfile(p => ({ ...p, monthlyIncome: v }));
              else if (k === 'sav') setProfile(p => ({ ...p, currentSavings: v }));
              else setProfile(p => ({ ...p, expenses: { ...p.expenses, [k]: v } }));
            }} onBlur={() => setEditingField(null)} />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-emerald-400 drop-shadow-sm">{formatCurrency(value)}</span>
            <Edit2 className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#030014] text-slate-50 selection:bg-primary/30 relative">
      <div className="bg-mesh" />
      
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 space-y-20 relative z-10">
        
        {/* 1. HERO SECTION */}
        <header className="flex flex-col items-center text-center space-y-10 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="px-5 py-2 rounded-full glass-card border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <Sparkles className="w-4 h-4 animate-pulse" /> SmartSpend v10.0 Pro Max
          </motion.div>
          <h1 className="text-7xl md:text-[110px] font-black tracking-tighter leading-[0.82] perspective-1000">
            Stop losing <span className="gradient-text italic">Wealth</span> to <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">Convenience.</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl">
            The elite financial engine that translates your lifestyle into real-world wealth. 
            <span className="text-white"> Built for India&apos;s next decade.</span>
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' })} 
            className="px-12 py-6 bg-primary text-white rounded-3xl font-black text-2xl shadow-[0_20px_40px_rgba(139,92,246,0.3)] flex items-center gap-4 transition-all hover:shadow-primary/50"
          >
            Start Your Transformation <ArrowRight className="w-8 h-8" />
          </motion.button>
        </header>

        <div id="input-section" className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT PANEL: CONFIG */}
          <div className="lg:col-span-4 space-y-8">
            <section className="glass-card rounded-[40px] p-10 space-y-10 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <div className="flex items-center gap-4"><div className="p-3 rounded-2xl bg-primary/10 border border-primary/20"><Wallet className="text-primary w-6 h-6" /></div><h2 className="text-2xl font-bold uppercase italic tracking-tight">Intelligence Config</h2></div>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Location Benchmark</span>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Enter City (e.g. Mumbai)" 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-12 focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none text-sm transition-all" 
                      value={cityInput} 
                      onChange={(e) => setCityInput(e.target.value)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const c = findCity(cityInput);
                          if (c) setProfile(p => ({ ...p, city: c }));
                        }
                      }} 
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  </div>
                  {profile.city && (
                    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-bold text-primary uppercase ml-2 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-primary animate-ping" /> {profile.city.name} Market Detected ({profile.city.tier})
                    </motion.p>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end"><EditableAmount lab="Monthly Cash In-Hand" value={profile.monthlyIncome} k="inc" /><span className="text-[10px] font-black text-slate-500 italic">Net Income</span></div>
                  <input type="range" min="30000" max="1000000" step="10000" value={profile.monthlyIncome} onChange={(e) => setProfile(p => ({ ...p, monthlyIncome: parseInt(e.target.value) }))} className="w-full h-1.5" />
                </div>

                <div className="space-y-6 pt-8 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Spending Profile</span>
                    <div className="flex gap-2">
                      {['frugal', 'balanced', 'spender'].map(t => (
                        <button key={t} onClick={() => setPreset(t as any)} className="px-3 py-1 rounded-full bg-white/5 text-[8px] font-black border border-white/10 hover:border-primary transition-colors uppercase">{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {EXPENSE_CATEGORIES.map(cat => (
                      <div key={cat.key} className="space-y-4 group/item">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-300 flex items-center gap-2 opacity-70 group-hover/item:opacity-100 transition-opacity">{cat.icon} {cat.label}</span>
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
                className="w-full py-6 bg-gradient-to-r from-primary via-indigo-600 to-primary bg-[length:200%_auto] hover:bg-right transition-all duration-500 rounded-3xl font-black text-xl shadow-[0_20px_40px_rgba(139,92,246,0.3)] flex items-center justify-center gap-4 group"
              >
                {profile.isAnalyzing ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/20 border-t-white" />
                    <span>Crunching Assets...</span>
                  </div>
                ) : (
                  <>Reveal Future Wealth <Sparkles className="group-hover:rotate-12 transition-transform" /></>
                )}
              </motion.button>
            </section>
          </div>

          {/* RIGHT PANEL: DASHBOARD */}
          <div className="lg:col-span-8 space-y-12">
            {/* SCOREBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { l: 'Profitability Rate', v: `${savingsRate.toFixed(1)}%`, s: savingsRate < 15 ? 'text-red-400' : savingsRate < 35 ? 'text-yellow-400' : 'text-emerald-400', t: 'Ideal: 40%+', d: savingsRate < 15 ? 'High Leakage' : 'Efficient' },
                { l: 'Runway Health', v: `${emergencyFund.months.toFixed(1)} Mo`, s: emergencyFund.months < 6 ? 'text-amber-400' : 'text-emerald-400', t: 'Safe: 6.0 Months', d: emergencyFund.months < 3 ? 'Critical' : 'Stable' },
                { l: 'Monthly Overflow', v: formatCurrency(savings), s: 'text-white', t: 'Net Investable', d: 'Ready to Deploy' }
              ].map((m, i) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="glass-card rounded-[32px] p-8 border-l-8 border-l-primary/30 hover:border-l-primary transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{m.l}</p>
                    <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded-full border border-white/5 uppercase">{m.d}</span>
                  </div>
                  <span className={`text-4xl font-black ${m.s} drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]`}>{m.v}</span>
                  <p className="text-[10px] mt-4 font-bold text-slate-500 flex items-center gap-2"><TrendingUp size={10} className="text-primary" /> {m.t}</p>
                </motion.div>
              ))}
            </div>

            {/* AI ANALYSIS HUB */}
            <AnimatePresence mode="wait">
              {profile.aiAnalysis ? (
                <motion.div id="results-section" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-12">
                  <div className="glass-card rounded-[48px] p-12 border-t-[12px] border-primary relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                      <div className="space-y-10">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="px-4 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30">AI Final Verdict</div>
                            {profile.aiAnalysis.isFallback && <div className="px-4 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Deterministic Engine</div>}
                          </div>
                          <h2 className="text-6xl font-black italic uppercase leading-[0.85] tracking-tight">{profile.aiAnalysis.persona.label}</h2>
                          <p className="text-2xl text-slate-300 font-medium leading-tight">"{profile.aiAnalysis.persona.description}"</p>
                        </div>
                        
                        <div className="flex items-center gap-12">
                          <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 text-center flex-1">
                             <p className="text-[10px] uppercase font-black text-slate-500 mb-2">Financial Risk</p>
                             <div className="text-5xl font-black gradient-text">{profile.aiAnalysis.risk_score?.score || 85}</div>
                          </div>
                          <div className="p-8 rounded-[32px] border-2 border-primary/30 text-center flex-1">
                             <p className="text-[10px] uppercase font-black text-slate-500 mb-2">Verdict</p>
                             <div className="text-3xl font-black uppercase italic tracking-tighter text-white">{profile.aiAnalysis.risk_score?.level || 'EXPOSED'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8 flex flex-col justify-center">
                        <div className="p-10 rounded-[40px] bg-red-500/5 border border-red-500/10 space-y-6 relative group overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><AlertTriangle size={80} /></div>
                          <p className="text-xs font-black uppercase text-red-400 flex items-center gap-2"><Zap size={14} className="fill-red-400" /> Massive Wealth Leak Detected</p>
                          <p className="text-2xl font-bold leading-none italic text-slate-100">&quot;{profile.aiAnalysis.shock_insight}&quot;</p>
                          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <p className="text-xs font-black text-primary uppercase tracking-widest">Executive Summary</p>
                            <p className="text-xl font-black text-white italic tracking-tighter">{profile.aiAnalysis.one_line_verdict}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SMART SWAPS: INTERACTIVE ENGINE */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                      <h3 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-4"><div className="w-10 h-1 bg-primary" /> The Smart Swap Engine</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Click to Simulate Instant Wealth Swap</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {profile.aiAnalysis.smart_swaps?.slice(0, 4).map((s, i) => (
                        <motion.div 
                          whileHover={{ y: -10 }}
                          key={i} 
                          className="glass-card rounded-[40px] p-10 space-y-8 relative overflow-hidden group/card hover:bg-emerald-500/5 transition-all cursor-pointer"
                          onClick={() => {
                            setActiveScenario('sip');
                            document.getElementById('trajectory')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                               <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Inefficient Habit</p>
                               <p className="line-through text-red-500/60 font-black text-lg decoration-2">{s.current_behavior}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Monthly Yield</p>
                               <p className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">+{s.monthly_savings}</p>
                            </div>
                          </div>
                          <div className="p-6 bg-emerald-500/10 rounded-3xl flex items-center gap-6 border border-emerald-500/20 group-hover/card:border-emerald-500/40 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-500/40 animate-pulse"><Sparkles size={24} /></div>
                            <div className="space-y-1">
                               <p className="text-[10px] uppercase text-emerald-500 font-black tracking-[0.2em]">Deploy To</p>
                               <p className="text-xl font-black text-white leading-tight">{s.better_alternative}</p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 font-medium italic border-l-4 border-primary pl-4">
                            &quot;Applying this swap adds <span className="text-primary font-black scale-110 inline-block mx-1 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">{s['10yr_impact']}</span> to your net worth.&quot;
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[60px] p-40 flex flex-col items-center text-center space-y-10 border-dashed border-white/10 group">
                   <div className="w-40 h-40 rounded-full bg-slate-950 flex items-center justify-center border-2 border-white/5 relative">
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse" />
                      <Sparkles size={80} className="text-primary/40 group-hover:text-primary/80 transition-colors duration-500" />
                   </div>
                   <div className="space-y-6 max-w-lg">
                      <h3 className="text-5xl font-black uppercase italic text-slate-100 tracking-tighter">Enter the Engine Room</h3>
                      <p className="text-xl text-slate-500 font-medium leading-relaxed">Provide your financial coordinates on the left to activate the AI Intelligence Hub and visualize your 10-year trajectory.</p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TRAJECTORY TIME MACHINE */}
            <section id="trajectory" className="glass-card rounded-[48px] p-12 border border-white/5 space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-white/5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-indigo-400"><Clock size={20} /><span className="text-[10px] font-black uppercase tracking-[0.3em]">Temporal Assets Simulation</span></div>
                  <h3 className="text-5xl md:text-6xl font-black italic uppercase leading-none tracking-tight">Projected Wealth</h3>
                </div>
                <div className="flex bg-slate-950/80 p-2 rounded-[32px] gap-2 border border-white/10 shadow-inner">
                  {[
                    { id: 'current', label: 'Lifestyle' },
                    { id: 'optimized', label: 'AI Strategy' },
                    { id: 'sip', label: 'Max Yield' }
                  ].map(s => (
                    <button key={s.id} onClick={() => setActiveScenario(s.id as any)} className={`px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeScenario === s.id ? 'bg-primary text-white shadow-[0_10px_30px_rgba(139,92,246,0.4)] scale-105' : 'text-slate-500 hover:text-slate-300'}`}>{s.label}</button>
                  ))}
                </div>
              </div>
              
              <div className="h-[500px] w-full pt-10 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wealthData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="optGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="5 5" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="year" stroke="#475569" fontSize={12} fontWeight={900} tickLine={false} axisLine={false} label={{ value: 'YEARS FROM TODAY', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 900, fill: '#475569' }} />
                    <YAxis stroke="#475569" fontSize={12} fontWeight={900} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', backdropFilter: 'blur(10px)', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
                      itemStyle={{ fontWeight: 900, fontSize: '14px' }}
                      labelStyle={{ fontSize: '10px', color: '#64748b', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase' }}
                      formatter={(v: any) => [formatCurrency(Number(v)||0), '']}
                    />
                    <Line type="monotone" dataKey="current" name="Lifestyle Trajectory" stroke="#475569" strokeWidth={3} strokeDasharray="8 8" dot={{ r: 4, fill: '#475569' }} />
                    <Line type="monotone" dataKey="optimized" name="Optimal Delta" stroke="#8b5cf6" strokeWidth={8} dot={{ r: 8, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} animationDuration={2000} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
                 <div className="p-10 rounded-[40px] bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-2">Unoptimized Net Worth</p>
                       <p className="text-4xl font-black text-white italic tracking-tighter">{formatCurrency(wealthData[3].current)}</p>
                    </div>
                    <div className="text-right space-y-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In 10 Years</p>
                       <p className="text-xs font-bold text-slate-400">Current Habits</p>
                    </div>
                 </div>
                 <div className="p-10 rounded-[40px] bg-emerald-500/5 border-2 border-emerald-500/20 flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="space-y-1 relative z-10">
                       <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">AI-Optimized Net Worth</p>
                       <p className="text-5xl font-black text-emerald-400 italic tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{formatCurrency(wealthData[3].optimized)}</p>
                    </div>
                    <div className="text-right space-y-1 relative z-10">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In 10 Years</p>
                       <p className="text-xs font-bold text-white bg-emerald-500 px-3 py-1 rounded-full">+₹{( (wealthData[3].optimized - wealthData[3].current) / 100000).toFixed(1)}L Delta</p>
                    </div>
                 </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="pt-24 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-10 opacity-60 transition-opacity hover:opacity-100 pb-20">
          <div className="flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-white/5 border border-white/10"><ShieldCheck size={20} className="text-primary" /></div>
             <div className="space-y-0.5">
                <p className="text-xs font-black uppercase text-white tracking-widest">Privacy Absolute</p>
                <p className="text-[10px] font-medium text-slate-500">Zero data leaves your browser. Local processing only.</p>
             </div>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-500">
            SmartSpend • Engineering Financial Freedom
          </p>
          <div className="flex gap-10">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">v10.0.0 Stable</span>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Build 2024.04</span>
          </div>
        </footer>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8b5cf6; }
        
        @keyframes shine {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </main>
  );
}
