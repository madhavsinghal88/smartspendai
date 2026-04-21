export type CityTier = 'Metro' | 'Tier-2' | 'Tier-3' | 'Rural';

export interface CityBenchmarks {
  rent: number;
  foodEatingOut: number;
  foodGroceries: number;
  travelCommute: number;
  travelLeisure: number;
  entertainment: number;
  utilities: number;
  miscellaneous: number;
}

export interface CityData {
  name: string;
  state: string;
  tier: CityTier;
  pinCodePrefixes: string[];
  benchmarks: CityBenchmarks;
  avgSavingsRate: number;
  avgMonthlyIncome: number;
}

export interface ExpenseData {
  rent: number;
  foodEatingOut: number;
  foodGroceries: number;
  travelCommute: number;
  travelLeisure: number;
  entertainment: number;
  emis: number;
  utilities: number;
  miscellaneous: number;
}

export interface AISmartSwap {
  current_behavior: string;
  better_alternative: string;
  monthly_savings: string;
  yearly_savings: string;
  "5yr_impact": string;
  "10yr_impact": string;
}

export interface AILeak {
  category: string;
  monthly_loss: string;
  why_problematic: string;
  fix: string;
}

export interface AIScenario {
  scenario: string;
  impact: string;
}

export interface AIAnalysisResult {
  persona: {
    label: string;
    description: string;
  };
  risk_score: {
    score: number;
    level: 'Low' | 'Medium' | 'High';
    reason: string;
  };
  savings_analysis: {
    current_rate: string;
    recommended_rate: string;
    monthly_gap: string;
    insight: string;
  };
  top_leaks: AILeak[];
  smart_swaps: AISmartSwap[];
  future_wealth: {
    current_path_5yr: string;
    optimized_path_5yr: string;
    current_path_10yr: string;
    optimized_path_10yr: string;
    insight: string;
  };
  financial_time_machine: {
    current_lifestyle: {
      status: string;
      warning: string;
      years_to_stress: string;
    };
    optimized_lifestyle: {
      status: string;
      wealth_projection: string;
      freedom_timeline: string;
    };
    scenarios: AIScenario[];
  };
  shock_insight: string;
  one_line_verdict: string;
}

export interface WealthProjectionPoint {
  year: number;
  current: number;
  optimized: number;
}

export interface UserProfile {
  city: CityData | null;
  monthlyIncome: number;
  expenses: ExpenseData;
  currentSavings: number;
  aiAnalysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
}

export const EXPENSE_CATEGORIES: { key: keyof ExpenseData; label: string; icon: string; color: string }[] = [
  { key: 'rent', label: 'Rent / Housing', icon: '🏠', color: '#8B5CF6' },
  { key: 'foodEatingOut', label: 'Food (Eating Out)', icon: '🍕', color: '#F472B6' },
  { key: 'foodGroceries', label: 'Food (Groceries)', icon: '🛒', color: '#06B6D4' },
  { key: 'travelCommute', label: 'Travel (Commute)', icon: '🚇', color: '#22C55E' },
  { key: 'travelLeisure', label: 'Travel (Leisure)', icon: '✈️', color: '#EAB308' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#F97316' },
  { key: 'emis', label: 'EMIs / Loans', icon: '🏦', color: '#EF4444' },
  { key: 'utilities', label: 'Utilities', icon: '💡', color: '#14B8A6' },
  { key: 'miscellaneous', label: 'Miscellaneous', icon: '📦', color: '#A78BFA' },
];

export const DEFAULT_EXPENSES: ExpenseData = {
  rent: 0,
  foodEatingOut: 0,
  foodGroceries: 0,
  travelCommute: 0,
  travelLeisure: 0,
  entertainment: 0,
  emis: 0,
  utilities: 0,
  miscellaneous: 0,
};
