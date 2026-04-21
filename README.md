# 🧠 SmartSpend AI: Next-Gen Financial Intelligence

![Demo Mockup](https://images.unsplash.com/photo-1554224155-1696413575b8?auto=format&fit=crop&q=80&w=2000)

**SmartSpend AI** is an elite Indian financial intelligence engine that transforms your messy spending data into a clear, actionable path to wealth. Built for the next billion users, it combines the reasoning power of Gemini AI with a robust, deterministic math engine.

## 🚀 Key Features

- **🧠 Hybrid Intelligence Engine**: Uses Google Gemini 3 Flash for deep reasoning and a custom deterministic math engine for instant fallback.
- **📈 Wealth Projection**: Visualize your financial trajectory over 10 years at a 12% CAGR using real compounding formulas.
- **💸 Smart Swap Engine**: India-specific lifestyle optimization (e.g., Swiggy/Zomato to Tiffin services, Cabs to Metro).
- **🔮 Financial Time Machine**: Simulate high-impact scenarios like quitting your job, moving cities, or starting a SIP.
- **🚨 Shock Insights**: Emotionally impactful financial "wake-up calls" that show exactly how much your lifestyle is costing your future self.
- **🇮🇳 Indian Context Built-in**: Optimized for Tier-1, Tier-2, and Tier-3 city benchmarks across India.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Google Gemini API (Flash 2.5 / Flash 3)
- **Charts**: Recharts (Responsive Trajectory Graphs)
- **Animations**: Framer Motion (Glassmorphic UI)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 🏎️ Getting Started

### Prerequisites
- Node.js 18+
- A Google Gemini API Key ([Get one here](https://aistudio.google.com/))

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/madhavsinghal88/smartspendai.git
   cd smartspendai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_key_here
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🧠 The Hybrid Fallback System

One of the core innovations in SmartSpend AI is the **Deterministic AI Fallback Engine**. 
- **Tier 1 (AI Mode)**: If the Gemini API is available and fast, it provides deep behavioral insights and personalized personas.
- **Tier 2 (Logic Mode)**: If the API times out, hits a quota limit, or is offline, our custom `math-engine.ts` takes over instantly using localized heuristics and mathematical formulas. 

**This ensures the product is production-ready, reliable, and always delivers value to the user.**

## 🛡️ Security
- No login required.
- Financial data is processed safely and never stored on servers.
- API keys are handled securely via server-side environment variables.

---

Built with ❤️ for the future of Indian personal finance.
