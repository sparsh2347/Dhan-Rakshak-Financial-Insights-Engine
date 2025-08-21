# 💰 Dhan-Rakshak: Your Smart Financial Copilot

**Dhan-Rakshak** is an AI-powered financial assistant that helps users **manage money, plan taxes, track expenses, and grow wealth** — all through **natural conversations**. Built for all ages, from teens to retirees, Dhan-Rakshak transforms your financial journey with intelligence, simplicity, and security.

> 🚀 Built by Team **VisionaryOps**  
> 🧠 Powered by **Google Gemini**, Fi Money MCP Server, and other GCP services  
> 🎯 Submission for **Agentic AI Day**

---

## 🔗 Development Link

🧪 You can try the live development build here:  
👉 [https://dhanrakshak.vercel.app](https://dhanrakshak.vercel.app)

---

## 🧠 Problem We’re Solving

💸 **60% of Indians** don’t track expenses regularly  
📉 **Only 27%** have a proper financial plan  
🧾 **60% overpay taxes** due to missed deductions  
📚 **76% of youth** lack basic financial literacy  
💼 **Only 7.4%** actively invest for retirement  

🔍 **Dhan-Rakshak solves this** by offering an intelligent, conversational platform that:
- Understands user finances in context
- Automates insights from receipts, forms, and PDFs
- Gives personalized plans for savings, investing, and tax optimization

---

## 🛠️ Features

### 🧾 1. Receipt Upload and Expense Tracking
Upload receipts (images or PDFs), and Dhan-Rakshak auto-extracts expenses using **Vision API** and **Document AI** — categorizing and summarizing your cash and bank spending.

### 📈 2. Stock Insights
Ask questions like _"Should I buy HDFC shares this week?"_ — get AI-backed advice using real-time market trends and contextual reasoning from **Gemini**.

### 🧮 3. SIP Calculator
Generate personalized SIP plans with projected returns and strategy suggestions, tailored to your goals and risk appetite.

### 📑 4. Tax Optimization from Form-16
Upload your Form-16 and get tax-saving suggestions, old vs. new regime comparisons, and deductions you might be missing.

### 👶 5. Teen-Focused Flashcards (Gamified Learning)
Fun flashcards teach young users about savings, budgeting, compound interest, and credit — using simple language and analogies.

### 👴 6. Retirement Planning
Using age, income, and investment history, Dhan-Rakshak suggests long-term plans to achieve post-retirement financial freedom.

---

## 🧩 How It Works

> Dhan-Rakshak combines the best of LLMs, OCR, financial logic, and conversational design.

### 🏗️ Architecture Overview

- **Frontend**: Next.js + TailwindCSS + TSX Components  
- **LLM**: Google Gemini API (Generative + Chat)  
- **Image & Document Parsing**: Vision API + Document AI  
- **Database**: Firebase Firestore (Receipts, user data, flashcards)  
- **Authentication**: Firebase Auth  
- **Deployment**: Google Cloud Console  
- **MCP Server**: For financial context from Fi Money ecosystem  

---

## 🤖 Google Technologies Used

| Technology           | Purpose                                                                 |
|----------------------|-------------------------------------------------------------------------|
| ✅ Gemini API         | Financial Q&A, tax simulation, flashcard generation                    |
| ✅ Vision API         | OCR on receipts, parse totals and categories                           |
| ✅ Document AI        | Extract structured data from PDFs (Form 16, salary slips, etc.)        |
| ✅ Firebase Firestore | Store user-specific insights, receipts, budgets                        |
| ✅ Firebase Auth      | Secure authentication                                                  |
| ✅ Agent SDK          | Persistent context across conversations                                |
| ✅ Google Cloud       | Hosting backend services                                               |

---

## 🌍 Impact

| Metric | How Dhan-Rakshak Helps |
|--------|------------------------|
| 🧾 60% don’t track expenses | Upload receipts → Get instant breakdowns |
| 💰 27% don’t plan finances | Conversational planning + AI advice |
| 📚 76% youth lack literacy | Fun flashcards that teach critical money skills |
| 👴 7.4% save for retirement | Personalized future savings strategy |
| 🧾 60% miss tax deductions | AI + OCR-powered tax optimizer from Form 16 |

---

## ✨ What Makes Us Different

- ✅ **Conversational First**: Not a dashboard — talk to your money.
- ✅ **AI That Understands You**: Contextual answers over PDFs, receipts, and goals.
- ✅ **Teen-Friendly + Expert-Ready**: From fun flashcards to retirement projections.
- ✅ **Privacy-First Design**: Data never leaves your secured environment.
- ✅ **Unified Experience**: Investments, taxes, spending — all in one chat window.

---

## 🔭 Future Scope

- ⏱️ Real-time tracking using Fi MCP + Vertex AI  
- 📊 Interactive dashboards with Looker + BigQuery  
- 🔍 Trend analysis via BigQuery ML  
- 🧠 Personalized learning journeys via Gemini + Firestore  
- 🌐 Multilingual support via Dialogflow CX  
- 🔔 Budget nudges and alerts via Firebase Messaging  
- 🔐 Confidential AI for privacy-focused analytics  

---

## 👨‍👩‍👧‍👦 Who Is It For?

- **Teens** learning how to save and budget  
- **Working professionals** looking to optimize taxes and invest wisely  
- **Retirees** planning wealth withdrawal and medical savings  
- **Anyone** who wants a smart AI that makes finance easy  

---

## 🧪 Local Development Setup

> Quickly get Dhan-Rakshak running on your machine:

### 🔧 Prerequisites
- Node.js `>= 18`
- Firebase project with Firestore & Auth
- Google Cloud project with Gemini + Vision + Document AI APIs enabled

### 🛠️ Installation Guide

```bash
# 1. Clone the repo
git clone https://github.com/your-org/dhan-rakshak.git
cd dhan-rakshak

# 2. Install dependencies
npm install

# 3. Add environment variable for Gemini
echo "GEMINI_API_KEY=your_key_here" >> .env.local

# 4. Run the development server
npm run dev