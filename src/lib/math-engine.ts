import { AIAnalysisResult, ExpenseData, CityData } from './types';

export function calculateFutureValue(monthlyInvestment: number, years: number) {
  const r = 0.12 / 12; // 12% annual interest
  const n = years * 12;
  const fv = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r);
  return Math.round(fv);
}

export function calculateRisk({
  savingsRate,
  emiRatio,
  emergencyMonths
}: {
  savingsRate: number;
  emiRatio: number;
  emergencyMonths: number;
}) {
  let score = 100;

  // Savings penalty
  if (savingsRate < 10) score -= 30;
  else if (savingsRate < 25) score -= 15;

  // EMI penalty
  if (emiRatio > 40) score -= 25;
  else if (emiRatio > 25) score -= 10;

  // Emergency fund penalty
  if (emergencyMonths < 3) score -= 30;
  else if (emergencyMonths < 6) score -= 15;

  return Math.max(score, 0);
}

export function getRiskLevel(score: number) {
  if (score > 70) return "Low";
  if (score > 40) return "Medium";
  return "High";
}

export function getPersona(savingsRate: number, totalExpenses: number, income: number) {
  if (savingsRate < 15) return { label: "Urban Overspender", description: "Your lifestyle matches your income, but not your financial future. You're potentially living paycheck to paycheck." };
  if (savingsRate > 30) return { label: "Wealth Builder", description: "You have strong financial discipline. You are prioritizing long-term freedom over short-term gratification." };
  return { label: "Balanced Survivor", description: "You are doing okay, but there is significant room to optimize and accelerate your wealth journey." };
}

export function generateDeterministicAnalysis(city: CityData, income: number, expenses: ExpenseData): AIAnalysisResult {
  const totalExp = Object.values(expenses).reduce((a, b) => a + b, 0);
  const savings = income - totalExp;
  const savingsRate = (savings / income) * 100;
  const emiRatio = (expenses.emis / income) * 100;
  const emergencyMonths = savings > 0 ? (income * 0.5) / totalExp : 0; // Simplified
  
  const score = calculateRisk({ savingsRate, emiRatio, emergencyMonths: 3 }); // Hardcoded 3 for simple fallback
  const persona = getPersona(savingsRate, totalExp, income);
  
  const waste = (expenses.foodEatingOut || 0) + (expenses.entertainment || 0) + (expenses.miscellaneous || 0) * 0.5;
  const tenYearLoss = calculateFutureValue(waste, 10);
  
  const swaps = [];
  if (expenses.foodEatingOut > 3000) {
    const s = expenses.foodEatingOut * 0.5;
    swaps.push({
      current_behavior: `Spending ₹${expenses.foodEatingOut} on eating out`,
      better_alternative: "Home cooking / Tiffin service",
      monthly_savings: `₹${Math.round(s)}`,
      yearly_savings: `₹${Math.round(s * 12)}`,
      "5yr_impact": `₹${(calculateFutureValue(s, 5) / 100000).toFixed(1)}L`,
      "10yr_impact": `₹${(calculateFutureValue(s, 10) / 100000).toFixed(1)}L`
    });
  }

  return {
    persona,
    risk_score: {
      score,
      level: getRiskLevel(score),
      reason: savingsRate < 15 ? "Low savings rate paired with metro-city overheads." : "Stable profile with room for systematic investment."
    },
    savings_analysis: {
      current_rate: `${savingsRate.toFixed(1)}%`,
      recommended_rate: "30%",
      monthly_gap: savingsRate < 30 ? `₹${Math.round(income * 0.3 - savings)}` : "₹0",
      insight: savingsRate < 20 ? "You are below the benchmark for urban wealth creation." : "Good start, now focus on asset allocation."
    },
    top_leaks: [
      {
        category: "Discretionary Spend",
        monthly_loss: `₹${Math.round(waste)}`,
        why_problematic: "These small leaks bleed your 10-year wealth projection significantly.",
        fix: "Set a hard limit on UPI-based small transactions."
      }
    ],
    smart_swaps: swaps.length > 0 ? swaps : [{
      current_behavior: "Generic inflation",
      better_alternative: "Index Fund SIP",
      monthly_savings: "₹5,000",
      yearly_savings: "60,000",
      "5yr_impact": "3.8L",
      "10yr_impact": "10.4L"
    }],
    future_wealth: {
      current_path_5yr: `₹${(calculateFutureValue(savings, 5) / 100000).toFixed(1)}L`,
      optimized_path_5yr: `₹${(calculateFutureValue(savings + 5000, 5) / 100000).toFixed(1)}L`,
      current_path_10yr: `₹${(calculateFutureValue(savings, 10) / 100000).toFixed(1)}L`,
      optimized_path_10yr: `₹${(calculateFutureValue(savings + 5000, 10) / 100000).toFixed(1)}L`,
      insight: `Optimization adds ₹${((calculateFutureValue(5000, 10)) / 100000).toFixed(1)}L to your net worth.`
    },
    financial_time_machine: {
      current_lifestyle: { status: savingsRate < 10 ? "Stress Mode" : "Average", warning: "Savings are stagnant", years_to_stress: savingsRate < 5 ? "1.2 Years" : "Stable" },
      optimized_lifestyle: { status: "Wealth Freedom", wealth_projection: `₹${(calculateFutureValue(savings + 5000, 10) / 100000).toFixed(1)}L`, freedom_timeline: "12 Years" },
      scenarios: [
        { scenario: "Quit Job", impact: `Buffer of ${Math.round(savings > 0 ? (income * 3) / totalExp : 0)} months` },
        { scenario: "Start ₹5k SIP", impact: `Adds ₹10.4L in 10 years` }
      ]
    },
    shock_insight: `You are wasting ₹${Math.round(waste)}/month. That's ₹${(tenYearLoss / 100000).toFixed(1)}L in 10 years.`,
    one_line_verdict: savingsRate < 15 ? "You don't have an income problem, you have a behavior problem." : "You're on the right track; keep compounding.",
    isFallback: true
  };
}
