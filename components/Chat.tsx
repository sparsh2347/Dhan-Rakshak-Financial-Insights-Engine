"use client";
import { X, ChevronRight, CornerUpLeft } from "lucide-react";
import { useState } from "react";
import { sendToGemini } from "@/lib/sendToGemini";
import Image from "next/image";

export default function Chat({ stockData }: { stockData: any }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setPrompt("");
    setLoading(true);

    try {
      const reply = await sendToGemini(prompt, stockData);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "error", text: "Failed to get response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[790px] w-full rounded-xl bg-[#d9f3f2] shadow-lg p-4 relative flex flex-col justify-between">
      {/* Top Bar */}
      {/* <div className="flex justify-between items-center">
        <button className="bg-black text-white text-sm px-4 py-1 rounded-full">
          Expand
        </button>
        <button>
          <X className="text-black w-5 h-5" />
        </button>
      </div> */}

      {/* Logo Section */}
      <div className="flex flex-col items-center justify-center mt-20">
        {/* <Image */}
        {/*   src="./../public/logoblack.png" */}
        {/*   alt={""} */}
        {/*   height={30} */}
        {/*   width={30} */}
        {/* /> */}
        <p className="text-gray-600 text-sm mt-1">Your personal</p>
        <p className="text-gray-600 text-sm -mt-1">financial advisor</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto my-4 px-2 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`px-4 py-2 rounded-md max-w-[80%] ${
              msg.role === "user"
                ? "bg-white self-end text-black ml-auto"
                : msg.role === "assistant"
                  ? "bg-[#b7e5e2] text-black self-start mr-auto"
                  : "bg-red-200 text-black self-start mr-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="px-4 py-2 rounded-md bg-[#b7e5e2] text-black max-w-[80%] self-start mr-auto">
            Typing...
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="flex flex-col gap-4">
        {/* Input Section */}
        <div className="flex items-center gap-2">
          <CornerUpLeft className="text-[#59a2a2] w-4 h-4" />
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 h-10 rounded-md px-4 bg-white outline-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button onClick={handleSend}>
            <ChevronRight className="text-[#59a2a2] w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
