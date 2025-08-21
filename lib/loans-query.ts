import { GoogleGenerativeAI } from '@google/generative-ai';

export async function answerQueryOnLoans(loansData: any, userQuery: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const combinedJson = JSON.stringify(loansData, null, 2);

  const genAI = new GoogleGenerativeAI("AIzaSyCBKJ0VTidMCAkznzZ7UM25lM5fABbNlK4");
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `
You are a smart financial assistant. A user has shared their loan portfolio data with you. You can answer queries about:
- outstanding loan amounts
- EMI schedules and totals
- interest rates and repayment strategies
- loan types (e.g., home, personal, education) and their implications
- time-based forecasts and financial planning
- comparisons between loans or interest types (fixed vs floating)

You should provide thoughtful, personalized financial insights using the user's loan data. If helpful, calculate total liabilities, interest paid over time, and suggest optimizations.

You may also ask follow-up questions if the user query is vague or if you spot an opportunity to improve their financial health.

Loan Data:
${combinedJson}

Now answer the user's question: "${userQuery}"
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (!text) {
    throw new Error('AI did not return a valid response.');
  }

  return text.trim();
}
