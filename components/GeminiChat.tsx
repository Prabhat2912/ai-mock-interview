"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function GeminiChat() {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResponse(data.text || "Error generating response");
    } catch (error) {
      console.error("Error:", error);
      setResponse("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 h-full max-w-xl mx-auto">
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Enter your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {response && (
        <div className="mt-4 h-full overflow-auto p-3 bg-gray-100 border rounded">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
