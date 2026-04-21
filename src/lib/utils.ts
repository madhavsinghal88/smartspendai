import { ExpenseData, WealthProjectionPoint } from './types';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateTotalExpenses = (expenses: ExpenseData): number => {
  return Object.values(expenses).reduce((acc, curr) => acc + curr, 0);
};

export const calculateWealthProjection = (
  monthlyIncome: number,
  currentMonthlySavings: number,
  optimizedMonthlySavings: number,
  years: number[] = [1, 3, 5, 10, 20],
  annualReturn: number = 0.12 // 12% annual return
): WealthProjectionPoint[] => {
  const monthlyReturn = Math.pow(1 + annualReturn, 1 / 12) - 1;

  return years.map(year => {
    const months = year * 12;
    
    // Future Value of an Ordinary Annuity: P * [((1 + r)^n - 1) / r]
    const currentWealth = currentMonthlySavings > 0 
      ? currentMonthlySavings * (Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn
      : 0;
      
    const optimizedWealth = optimizedMonthlySavings > 0
      ? optimizedMonthlySavings * (Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn
      : 0;

    return {
      year,
      current: Math.round(currentWealth),
      optimized: Math.round(optimizedWealth),
    };
  });
};

export const getEmergencyFundStatus = (currentSavings: number, monthlyExpenses: number) => {
  if (monthlyExpenses === 0) return { months: 0, color: 'bg-red-500' };
  
  const months = currentSavings / monthlyExpenses;
  let color = 'bg-red-500';
  if (months >= 6) color = 'bg-emerald-500';
  else if (months >= 3) color = 'bg-amber-500';
  
  return { months, color };
};
