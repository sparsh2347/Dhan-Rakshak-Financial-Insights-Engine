import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDX_z_36OHIbq6EN3xpysIs4N4Fc8dJKzU");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function askGemini(prompt: string, stockData: any) {
  const chat = model.startChat({});

  const fullPrompt = `
You are a financial assistant. Help the user understand stock performance and company fundamentals.

Here is the data for ${stockData.companyName}:

About: ${stockData.about}

- Current Price: ₹${stockData.currPrice}
- Market Cap: ₹${stockData.marketCap} Cr
- Stock PE: ${stockData.stockPE}
- Book Value: ₹${stockData.bookValue}
- Dividend Yield: ${stockData.dividendYield}%
- ROCE: ${stockData.ROCE}%
- ROE: ${stockData.ROE}%
- Face Value: ₹${stockData.faceValue}

📈 Last 5 days price:
${stockData.Price.map(([date, price]: [string, string]) => `• ${date}: ₹${price}`).join("\n")}

📊 Pros:
${stockData.pros.map((p: string) => `• ${p}`).join("\n")}

⚠️ Cons:
${stockData.cons.map((c: string) => `• ${c}`).join("\n")}

Now respond to the following user query:

"${prompt}"
  `;

  const result = await chat.sendMessage(fullPrompt);
  return result.response.text();
}
