// lib/receipt-query.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function answerQueryOnReceipts(receipts: string, userQuery: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

//   const receipts = await realtimeDB.getAllUserExpenses(userId);
  const combinedJson = JSON.stringify(receipts, null, 2);
  
  const genAI = new GoogleGenerativeAI("AIzaSyCBKJ0VTidMCAkznzZ7UM25lM5fABbNlK4");
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `
You are a smart financial assistant. A user has shared parsed receipt data with you. You can answer queries about:
- their past expenses
- category breakdowns
- vendor-specific totals
- time-based trends (weekly/monthly)
- financial planning advice

You can also ask counter-questions if something looks interesting.

You need to respond based on the data you've been given but not just based on the given item categories — analyze the statement and receipts text as a whole. 
If the user asks for external options or information, feel free to enrich your response with public financial data.

Receipt Data:
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
