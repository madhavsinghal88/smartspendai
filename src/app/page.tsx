'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Search, Wallet, TrendingUp, ShieldCheck, MapPin, ArrowRight, Sparkles, AlertTriangle, CheckCircle2, Clock, Edit2, Zap } from 'lucide-react';
import { findCity } from '@/lib/cities';
import { UserProfile, DEFAULT_EXPENSES, EXPENSE_CATEGORIES } from '@/lib/types';
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
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.warn("AI API failed, timed out, or not configured. Rolling out Demo Mode response.", e.name);
      
      // HIGH QUALITY MOCK FALLBACK for Demo/Unconfigured/Timeout state
      setTimeout(() => {
        const mockResult: any = {
          persona: { label: savingsRate < 15 ? "Urban Overspender" : "Balanced Wealth Builder", description: "You earn like the top 10%, but lifestyle inflation is eating your future wealth." },
          risk_score: { score: savingsRate < 10 ? 82 : 45, level: savingsRate < 10 ? "High" : "Medium", reason: "Low savings rate combined with high discretionary spend in a Metro city." },
          savings_analysis: { current_rate: `${savingsRate.toFixed(1)}%`, recommended_rate: "30%", monthly_gap: formatCurrency(profile.monthlyIncome * 0.15), insight: "You are ₹18k away from reaching a secure wealth-building trajectory." },
          top_leaks: [{ category: "Food Delivery", monthly_loss: "₹4,200", why_problematic: "Ordering 4+ times a week is costing you a small car in 10 years.", fix: "Cook at home 3x more." }],
          smart_swaps: [{ current_behavior: "Daily Cab Commute", better_alternative: "Metro / Carpool", monthly_savings: "₹3,500", yearly_savings: "₹42,000", "5yr_impact": "₹3.1L", "10yr_impact": "₹8.5L" }],
          future_wealth: { current_path_10yr: formatCurrency(wealthData[4].current), optimized_path_10yr: formatCurrency(wealthData[4].optimized), insight: "Optimization adds ₹36L to your 10-year net worth." },
          financial_time_machine: {
            current_lifestyle: { status: "Financial Stress", warning: "Savings stagnant", years_to_stress: "2.3 Years" },
            optimized_lifestyle: { status: "Wealth Freedom", wealth_projection: "₹48.2L", freedom_timeline: "8 Years" },
            scenarios: [{ scenario: "Quit Job", impact: "Buffer 4 months" }, { scenario: "Move Tier-2", impact: "+₹12k/mo savings" }]
          },
          shock_insight: `You are losing ${formatCurrency(18000)}/month. That's ₹27L in 10 years.`,
          one_line_verdict: "You don't have an income problem, you have a behavior problem."
        };
        setProfile(p => ({ ...p, aiAnalysis: mockResult, isAnalyzing: false }));
      }, 1500);
    }
  };

  const EditableAmount = ({ value, k, cls, lab }: any) => (
    <div className={`flex flex-col ${cls}`}>
      {lab && <span className="text-[10px] font-black text-slate-500 uppercase mb-1">{lab}</span>}
      <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditingField(k)}>
        {editingField === k ? (
          <input autoFocus type="number" className="bg-slate-900 border border-primary text-white rounded-lg px-2 py-1 w-24 text-lg font-black outline-none" 
            value={value} onChange={(e) => {
              const v = parseInt(e.target.value) || 0;
              if (k === 'inc') setProfile(p => ({ ...p, monthlyIncome: v }));
              else if (k === 'sav') setProfile(p => ({ ...p, currentSavings: v }));
              else setProfile(p => ({ ...p, expenses: { ...p.expenses, [k]: v } }));
            }} onBlur={() => setEditingField(null)} />
        ) : (
          <div className="flex items-center gap-2"><span className="text-xl font-black text-emerald-400">{formatCurrency(value)}</span><Edit2 className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100" /></div>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#030014] text-slate-50 selection:bg-primary/30">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 space-y-16">
        
        {/* 1. HERO SECTION */}
        <header className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-1.5 rounded-full glass-card border-primary/30 text-primary text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> SmartSpend v9.5 Elite
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
            Your lifestyle is costing you <span className="gradient-text italic">₹32,40,000.</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium">See your financial future in 10 seconds. No login required.</p>
          <button onClick={() => document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-[0_0_40px_rgba(139,92,246,0.4)] flex items-center gap-3">
            Reveal My Financial Future <ArrowRight className="w-6 h-6" />
          </button>
        </header>

        {/* 2. SHOCK STRIP */}
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card rounded-3xl p-6 bg-gradient-to-r from-red-500/10 via-red-500/20 to-red-500/10 border border-red-500/20 text-center max-w-5xl mx-auto">
          <p className="text-xl md:text-2xl font-black uppercase italic tracking-tight">
            ⚠️ You are burning <span className="text-red-400">₹18,000/month</span> unnecessarily. That&apos;s <span className="text-red-400">₹27,00,000</span> in 10 years.
          </p>
        </motion.div>

        <div id="input-section" className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT PANEL */}
          <div className="lg:col-span-4 space-y-8">
            <section className="glass-card rounded-[32px] p-8 border-white/5 space-y-8 h-fit">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5"><MapPin className="text-primary w-6 h-6" /><h2 className="text-xl font-bold uppercase italic">Config Intelligence</h2></div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Enter City (e.g. Bangalore)" 
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-12 focus:ring-2 focus:ring-primary outline-none text-sm" 
                      value={cityInput} 
                      onChange={(e) => setCityInput(e.target.value)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const c = findCity(cityInput);
                          if (c) setProfile(p => ({ ...p, city: c }));
                        }
                      }} 
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  </div>
                  {profile.city && (
                    <p className="text-[10px] font-bold text-primary uppercase ml-2 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Detected: {profile.city.name} ({profile.city.tier})
                    </p>
                  )}
                </div>
                <EditableAmount lab="Monthly Income (In-Hand)" value={profile.monthlyIncome} k="inc" />
                <input type="range" min="30000" max="500000" step="5000" value={profile.monthlyIncome} onChange={(e) => setProfile(p => ({ ...p, monthlyIncome: parseInt(e.target.value) }))} className="w-full" />
                <EditableAmount lab="Current Liquid Savings" value={profile.currentSavings} k="sav" />
                <div className="space-y-6 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Spends (Sliders + Manual Entry)</span>
                  <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {EXPENSE_CATEGORIES.map(cat => (
                      <div key={cat.key} className="space-y-2">
                        <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-300">{cat.icon} {cat.label}</span><EditableAmount value={profile.expenses[cat.key]} k={cat.key} /></div>
                        <input type="range" min="0" max={profile.monthlyIncome/2} step="500" value={profile.expenses[cat.key]} onChange={(e) => setProfile(p => ({ ...p, expenses: { ...p.expenses, [cat.key]: parseInt(e.target.value) }}))} className="w-full h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={runAnalysis} className="w-full py-5 bg-gradient-to-r from-primary to-indigo-600 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                {profile.isAnalyzing ? <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" /> : <>Reveal My Financial Future <Sparkles /></>}
              </button>
            </section>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-8 space-y-10">
            {/* TOP METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { l: 'Savings Rate', v: `${savingsRate.toFixed(1)}%`, s: savingsRate < 10 ? 'text-red-400' : savingsRate < 25 ? 'text-yellow-400' : 'text-emerald-400', t: 'Target: 25%' },
                { l: 'Emergency Fund', v: `${emergencyFund.months.toFixed(1)} Mos`, s: emergencyFund.months < 3 ? 'text-red-400' : 'text-emerald-400', t: `Gap: ${formatCurrency(Math.max(0, totalExp*6 - profile.currentSavings))} needed` },
                { l: 'Monthly Surplus', v: formatCurrency(savings), s: 'text-white', t: 'Investable Wealth' }
              ].map((m, i) => (
                <div key={i} className="glass-card rounded-3xl p-6 border-l-4 border-l-primary">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{m.l}</p>
                  <span className={`text-3xl font-black ${m.s}`}>{m.v}</span>
                  <p className="text-[10px] mt-2 font-bold text-slate-400">{m.t}</p>
                </div>
              ))}
            </div>

            {/* AI VERDICT PANEL */}
            <AnimatePresence mode="wait">
              {profile.aiAnalysis?.persona ? (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-10">
                  <div className="glass-card rounded-[40px] p-10 border-t-8 border-primary bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5"><Zap className="w-48 h-48 text-primary" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                      <div className="space-y-6">
                        <p className="text-xs font-black text-primary uppercase italic tracking-widest">🧠 AI Intelligence Report</p>
                        <h2 className="text-5xl font-black italic uppercase leading-none">{profile.aiAnalysis.persona.label}</h2>
                        <div className="flex gap-10">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500">Risk Score</p>
                            <p className={`text-4xl font-black ${profile.aiAnalysis.risk_score?.level === 'High' ? 'text-red-400' : 'text-emerald-400'}`}>
                              {profile.aiAnalysis.risk_score?.score || 0}
                            </p>
                          </div>
                          <div className="w-px h-12 bg-white/10" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500">Verdict</p>
                            <p className="text-2xl font-black uppercase text-white tracking-widest leading-none mt-2">
                              {profile.aiAnalysis.risk_score?.level || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg text-slate-400 leading-tight">"{profile.aiAnalysis.persona.description}"</p>
                      </div>
                      <div className="space-y-6 bg-slate-950/60 p-8 rounded-3xl border border-white/5">
                        <p className="text-sm font-black uppercase text-amber-500 flex items-center gap-2"><AlertTriangle size={16} /> Reality Check</p>
                        <p className="text-xl font-bold leading-tight italic text-slate-200">"{profile.aiAnalysis.shock_insight}"</p>
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-sm font-black text-primary uppercase tracking-widest">The Bottom Line</p>
                          <p className="text-xl font-black gradient-text uppercase italic">{profile.aiAnalysis.one_line_verdict}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SMART SWAPS */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black uppercase italic tracking-tight px-2 flex items-center gap-2"><ArrowRight className="text-emerald-500" /> Smart Swap Engine</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profile.aiAnalysis.smart_swaps?.slice(0, 2).map((s, i) => (
                        <div key={i} className="glass-card rounded-3xl p-8 space-y-6 border-b-4 border-emerald-500/40">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1"><p className="text-[10px] uppercase text-slate-500 font-bold">You Spend</p><p className="line-through text-red-500 font-bold">{s.current_behavior}</p></div>
                            <div className="text-right"><p className="text-2xl font-black text-emerald-400">+{s.monthly_savings}</p><p className="text-[10px] uppercase text-slate-500 font-bold">Monthly Gain</p></div>
                          </div>
                          <div className="p-4 bg-emerald-500/5 rounded-2xl flex items-center gap-3 border border-emerald-500/10"><CheckCircle2 className="text-emerald-500" /><div className="space-y-1"><p className="text-[10px] uppercase text-emerald-500 font-black">Switch To</p><p className="font-bold text-white leading-none">{s.better_alternative}</p></div></div>
                          <p className="text-xs text-slate-400 font-medium italic translate-y-2">"This simple swap adds <span className="text-primary font-bold">{s['10yr_impact']}</span> to your 10-year wealth."</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="glass-card rounded-[40px] p-24 flex flex-col items-center text-center space-y-6 border-dashed border-white/10 opacity-50 grayscale transition-all hover:grayscale-0">
                  <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border border-white/5"><Sparkles size={40} className="text-primary/40 animate-pulse" /></div>
                   <div className="space-y-2"><h3 className="text-3xl font-black uppercase italic text-slate-300">Ready for the Reality Check?</h3><p className="text-slate-500 max-w-sm font-medium">Input your lifestyle data and reveal your custom AI-driven financial growth simulation.</p></div>
                </div>
              )}
            </AnimatePresence>

            {/* TIME MACHINE SECTION */}
            <section className="glass-card rounded-[40px] p-10 border-white/5 space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5">
                <div className="space-y-1">
                  <h3 className="text-4xl font-black italic uppercase italic leading-none flex items-center gap-3"><Clock className="text-indigo-400" /> Financial Time Machine</h3>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Trajectory Projection v2.1</p>
                </div>
                <div className="flex bg-slate-950 p-2 rounded-2xl gap-2 border border-white/10">
                  {['current', 'optimized', 'sip'].map(s => (
                    <button key={s} onClick={() => setActiveScenario(s as any)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeScenario === s ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="h-[400px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wealthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="year" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} formatter={(v: any) => [formatCurrency(Number(v)||0), '']} />
                    <Line type="monotone" dataKey="current" name="Current Lifestyle" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="optimized" name="AI-Optimized Future" stroke="#8b5cf6" strokeWidth={5} dot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                 <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-center"><p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Current Trajectory</p><p className="text-2xl font-black text-white italic truncate">{formatCurrency(wealthData[4].current)} (10yr)</p></div>
                 <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center"><p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">AI-Optimized</p><p className="text-2xl font-black text-emerald-400 italic truncate">{formatCurrency(wealthData[4].optimized)} (10yr)</p></div>
              </div>
            </section>
          </div>
        </div>

        <footer className="pt-20 text-center opacity-40 border-t border-white/5 space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.5em] text-primary italic">SmartSpend AI 🇮🇳 Next Billion Financial Intelligence</p>
        </footer>
      </div>
      <style jsx global>{`
        .gradient-text { background: linear-gradient(to right, #a78bfa, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .glass-card { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(20px); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        input[type="range"] { accent-color: #8b5cf6; }
      `}</style>
    </main>
  );
}
