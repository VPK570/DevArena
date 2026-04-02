<div align="center">
  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0Q7gUidvCMDS97EqRVd-yqBDjNiMCggfm05CnRPwaiu8YokLynu4kBAPWMs2Axr8dQiG8W9i2oLA_6dybSiV8uaJ1sQ1x41_dOzPvZpowG1a3ZFDzVuZDbKHS9icvvKDGnkkHQOnaxoooRkpS_nBHqJEPhfRzye9r-H0bUtIKcprDKjc1SXnFCjMRayzRx_plrn1Undo7OTYn6qMJD2A1vgzURTtmbhurJkC4jModdWXr9D-ilALYJMRy6p6l529W94Ux1c6gLWQG" alt="DevArena / Battle-Front Logo" width="150" height="150" style="border-radius: 50%; box-shadow: 0 0 20px #00F0FF;">
  
  # ⚡ DEV-ARENA // BATTLE-FRONT ⚡
  
  **A Cyberpunk-inspired, AI-driven Competitive Coding Sandbox.**
  
  <p align="center">
    <a href="#inspiration">Inspiration</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#deep-dive">Technical Deep Dive</a> •
    <a href="#local-setup">Local Setup</a>
  </p>
</div>

---

## 💡 Inspiration
We were tired of staring at the sterile, boring interfaces of traditional coding practice sites. LeetCode and HackerRank feel like taking a standardized test in a fluorescent-lit room. We wanted to build an experience that makes solitary coding challenges feel like you're jacking into the matrix. 

**DevArena (The Battle-Front)** is exactly that: a highly immersive, aesthetically rich, browser-based coding platform that doesn't just evaluate if your code compiles. It introduces a ruthless, highly intelligent AI Oracle that grades your solutions dynamically, providing neon-soaked feedback in real-time. 

It’s built for hackers, by hackers.

---

## 🏗️ Architecture & Project Structure

The project is split into two independent monolithic services to ensure complete decoupling of the Client UX and the AI Logic.

```text
📦 DevArena
 ┣ 📂 frontend        // Next.js 14+ (App Router), Tailwind CSS v4, React
 ┃ ┣ 📂 app           // Routing, Dashboard, Challenge Pages
 ┃ ┣ 📂 components    // Reusable UI (Monaco Editor, Feedback Panel, Timer)
 ┃ ┗ 📂 lib           // Secure Sandbox injection & offline challenge local-storage
 ┃
 ┗ 📂 backend         // FastAPI, Python 3.13, Uvicorn, Google GenAI SDK
   ┣ 📂 core          // Logging formatters & Configurations
   ┣ 📂 data          // Challenge schemas & grading rubrics
   ┣ 📂 models        // Pydantic request/response validation schemas
   ┣ 📂 routers       // REST API Endpoints (/evaluate, /solution, /hint)
   ┗ 📂 services      // Core Gemini Prompt Engineering layer
```

---

## 🔥 Key Features & Capabilities

### 💻 1. Secure In-Browser Execution Sandbox
Say goodbye to server-side bottlenecks for simple code preview. DevArena runs the user's volatile, untrusted JavaScript securely inside the browser using an isolated iframe.
* **Offline Preview**: Users can run code instantly with zero latency.
* **Real-Time Terminal Interception**: Standard browser behavior swallows iframe logs. We injected a custom intercept sub-routine that hijacks `console.log`, `console.warn`, and `window.onerror` directly from the `srcdoc` execution context and pipes them back to our Parent React App.
* **Visual Output & Logs**: Split-pane sandbox showing the rendered graphical output of the user's React code on the left, and a scrolling `TERMINAL_OUT` log on the right.

### 🤖 2. The AI "Oracle" (Gemini 3.1 Pro via OpenRouter)
We rejected basic string-matching unit tests. DevArena uses the latest **Gemini 3.1 Pro** model as the ultimate subjective and objective judge. 
* **Dynamic Grading**: Determines a `Score (0-100)`, a `Verdict (Pass/Partial/Fail)`, and explains *why* the code failed.
* **Line-by-Line Diagnostics**: The Oracle points out exact line numbers containing logic errors and syntax flaws, which we render natively inside the Feedback interface.
* **Solution Comparison**: After submission, users can "JACK IN" to the Oracle's optimized solution, featuring a side-by-side comparison and an architectural debrief.
* **Difficulty Scaling**: The internal python engine automatically applies weighting so that solving a "Hard" problem poorly still results in more core ELO points than solving an "Easy" problem perfectly.

### 🛡️ 3. Fault-Tolerant AI Graceful Degradation
Relying on LLMs means relying on third-party uptime and rate-limits. We built custom error safety nets.
* If a user hits a `429 ResourceExhausted` Free-Tier quota, the FastAPI server catches it, relays it to Next.js, and our UI renders a dynamic `[ORACLE_LINK_SEVERED] GEMINI_QUOTA_EXCEEDED` error directly inside the visual Terminal rather than crashing the React application.

### 🎨 4. Brutalist Cyberpunk UX/UI
We prioritized making the frontend look and feel incredible. 
* Heavy use of Tailwind CSS for glowing neon borders (`#00F0FF`), aggressive primary colors, and high-contrast brutalist UI blocks (`#0E0E11`).
* Integrated **Monaco Editor** (the engine behind VS Code) customized with a dark theme, integrated map-scrolling, and disabled generic syntax validation to fit the custom theme.
* Flow state loops: You can code, preview, submit to the Oracle, fail, click "Rematch", and try again without a single page reload or state loss.

---

## 🧬 Technical Deep Dive

### 1. The `postMessage` Sandbox Protocol
Browsers aggressively block execution context within strings passed to React state to prevent XSS. We engineered a `sandbox.js` library that generates pure HTML strings embedding the user's code *alongside* our message passing script.
```javascript
// Inside the Iframe Sandbox:
window.onerror = function(msg, url, line, col, error) {
  window.parent.postMessage({
    source: 'battle-front-sandbox',
    type: 'error',
    payload: `${msg} at line ${line}:${col}`
  }, '*');
  return true; 
};
```
The Next.js client listens for `battle-front-sandbox` events and dynamically appends them to the `<Terminal />` UI state, achieving a true terminal feel without websockets.

### 2. Strict JSON Generation Prompting
LLMs notoriously hallucinate markdown (like `` ```json ``) when asked for JSON. We wrote highly optimized system prompts and a robust `parse_json_response` Regex cleaner on the backend to ensure FastAPI never throws internal 500 serialization errors when converting Gemini's text into our Pydantic `EvaluateResponse` class.

### 3. Asynchronous Non-Blocking Backend
By utilizing FastAPI layered on Uvicorn, our backend server never hangs waiting for Google's API to respond. Using `logger.exception()` and custom HTTP Exceptions, the backend handles concurrent payload validations efficiently.

---

## 🏆 What We Learned
- **Cross-Window Communication:** Gained deep knowledge of frontend sandboxing security (`sandbox="allow-scripts"`) and overcoming React's strict synthetic event handling.
- **FastAPI Mastery:** Learned how to wire up REST endpoints lightning-fast using Pydantic Models for strict request validation.
- **Prompt Engineering as Code:** Treating LLM prompts not as text, but as a core logic mechanism that requires extensive testing, formatting definitions, and error handling for unpredictable edge-case outputs.

---

## 🚀 What's Next for DevArena
Our V1 is a solitary proving ground. **V2 is multiplayer.** 
1. **PostgreSQL Database Integration:** We want to permanently store user ELO ratings, authentication credentials, and solve histories.
2. **WebSockets for Matchmaking:** Enabling 1v1 "Battle-Fronts" where two users are fed exactly the same algorithm challenge and compete to solve it with the least Big O complexity in real-time.
3. **The "Market" System:** A fully functional ecosystem where Operators can spend credits earned from challenges on UI cosmetics, custom Monaco themes, and new avatar profiles.

---

## 🛠️ THE_DEPLOYMENT_PROTOCOL (Setup Guide)

To synchronize with the DevArena network locally, follow these precise sequences.

### 📜 1. DATABASE_INITIALIZATION (Supabase)
DevArena relies on Supabase for Auth, RLS, and persistent storage.

1.  **Create a New Project** on [Supabase Dashboard](https://supabase.com).
2.  **Schema Execution**: Open the **SQL Editor** in Supabase and execute the entire contents of [`supabase_schema.sql`](./supabase_schema.sql). This will:
    *   Initialize the `users`, `challenges`, `submissions`, and `drafts` tables.
    *   Set up Row Level Security (RLS) policies.
    *   Seed the initial "Easy", "Medium", and "Hard" challenges.
    *   Create triggers for auto-profiling new users on sign-up.

### 🛡️ 2. BACKEND_SYNC (FastAPI + Oracle V2.0)
The backend manages code evaluation via Gemini and enforces secure data access.

1.  **Navigate to Backend**:
    ```bash
    cd backend
    ```
2.  **Environment Setup**:
    *   Create a virtual environment: `python3 -m venv venv`
    *   Activate it: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows)
    *   Install Dependencies: `pip install -r requirements.txt`
3.  **Environment Variables**:
    *   Copy `.env.example` to `.env`: `cp .env.example .env`
    *   Populate `GEMINI_API_KEY` ([Get one here](https://aistudio.google.com)).
    *   Populate `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (from Project Settings -> API).
4.  **Launch Routine**:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    *Note: The system is optimized to connect via `127.0.0.1:8000` to ensure stable IPv4 routing on Windows.*

### 🖥️ 3. FRONTEND_SYNC (Next.js 15+ App Router)
The frontend is built with high-fidelity components and aggressive styling.

1.  **Navigate to Frontend**:
    ```bash
    cd frontend
    ```
2.  **Environment Setup**:
    *   Install Node Packages: `npm install`
3.  **Environment Variables**:
    *   Copy `.env.example` to `.env.local`: `cp .env.example .env.local`
    *   Populate `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4.  **Launch Routine**:
    ```bash
    npm run dev
    ```

---

## 🦾 IMPLEMENTATION_ADVISORY (For Contribs)

If you are extending the DevArena, keep these design laws in mind:

1.  **Aesthetics Over Default**: Never use standard browser buttons. Use the predefined "brutalist" styles in `globals.css`. If it doesn't glow, it's not ready.
2.  **The Oracle is Sovereign**: All grading must go through the `/evaluate` endpoint. Do not perform subjective logic on the frontend.
3.  **Sandboxing is Mandatory**: User-submitted code *must* be executed in the `Iframe` sandbox to prevent XSS and DOM pollution. Use the `postMessage` protocol defined in the components to bridge communication.
4.  **Supabase Auth**: Ensure all protected routes check for the user's session via the `AuthContext`.

---
<p align="center">
  <i>"JACKING IN... ACCESS GRANTED."</i>
</p>

