import { NextResponse } from 'next/server';
import { AIAnalysisResult, ExpenseData } from '@/lib/types';
import { generateDeterministicAnalysis } from '@/lib/math-engine';

export async function POST(req: Request) {
  let requestData;
  try {
    requestData = await req.json();
    const { city, income, expenses } = requestData;

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY missing - falling back to math engine.");
      return NextResponse.json(generateDeterministicAnalysis(city, income, expenses));
    }

    const totalExpenses = Object.values(expenses as ExpenseData).reduce((a, b) => a + b, 0);
    const savings = income - totalExpenses;
    const savingsRate = (savings / income) * 100;

    // keeping the prompt light so it actually loads lol
    const prompt = `Analyze Indian financial data:
City: ${city.name} (${city.tier})
Income: ₹${income}
Expenses: ${JSON.stringify(expenses)}
Savings: ₹${savings} (${savingsRate.toFixed(1)}%)

Return JSON:
{
  "persona": { "label": "Short", "description": "Short" },
  "risk_score": { "score": 0, "level": "Low/Med/High", "reason": "Short" },
  "savings_analysis": { "current_rate": "", "recommended_rate": "30%", "monthly_gap": "", "insight": "" },
  "top_leaks": [ { "category": "", "monthly_loss": "", "why_problematic": "", "fix": "" } ],
  "smart_swaps": [ { "current_behavior": "", "better_alternative": "", "monthly_savings": "", "yearly_savings": "", "5yr_impact": "", "10yr_impact": "" } ],
  "future_wealth": { "current_path_5yr": "", "optimized_path_5yr": "", "current_path_10yr": "", "optimized_path_10yr": "", "insight": "" },
  "financial_time_machine": {
    "current_lifestyle": { "status": "", "warning": "", "years_to_stress": "" },
    "optimized_lifestyle": { "status": "", "wealth_projection": "", "freedom_timeline": "" },
    "scenarios": [ { "scenario": "Quit Job", "impact": "" } ]
  },
  "shock_insight": "",
  "one_line_verdict": ""
}
Keep all text VERY short. 1 leak, 1 swap only. Return ONLY JSON.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    
    const data = await res.json();
    if (!res.ok) {
      console.error("Gemini API Error - falling back:", data);
      return NextResponse.json(generateDeterministicAnalysis(city, income, expenses));
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : rawText;

    const result = JSON.parse(jsonStr) as AIAnalysisResult;
    result.isFallback = false;
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Analysis Error - falling back:', error);
    if (requestData?.city && requestData?.income && requestData?.expenses) {
      return NextResponse.json(generateDeterministicAnalysis(requestData.city, requestData.income, requestData.expenses));
    }
    return NextResponse.json({ error: 'Failed to analyze spending.' }, { status: 500 });
  }
}
