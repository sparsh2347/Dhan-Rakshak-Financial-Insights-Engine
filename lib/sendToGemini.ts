// utils/sendToGemini.ts
export async function sendToGemini(prompt: string, stockData: any) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, stockData }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gemini failed");
  return data.reply;
}
