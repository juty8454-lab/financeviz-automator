"use client";
import { useState } from "react";

export default function Home() {
  const [script, setScript] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [style, setStyle] = useState<"ai" | "stock">("stock");

  return (
    <main className="min-h-screen bg-white text-gray-900 flex justify-center">
      <div className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold">
          Finance<span className="text-red-500">Viz</span> Automator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Script + voiceover → whiteboard-style finance video.
        </p>

        <div className="mt-6">
          <label className="text-xs font-semibold uppercase text-gray-500">Script</label>
          <textarea
            className="w-full mt-2 border-2 border-gray-200 rounded-xl p-3 min-h-[120px]"
            placeholder="Paste your script here..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
          />
        </div>

        <div className="mt-6">
          <label className="text-xs font-semibold uppercase text-gray-500">Voiceover</label>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            id="audio-upload"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          <label
            htmlFor="audio-upload"
            className="mt-2 block border-2 border-dashed border-gray-200 rounded-xl p-5 text-center text-sm text-gray-500 cursor-pointer"
          >
            {fileName ? `🎙️ ${fileName}` : "📎 Tap to upload audio (max 10 min)"}
          </label>
        </div>

        <div className="mt-6">
          <label className="text-xs font-semibold uppercase text-gray-500">Visual style</label>
          <div className="mt-2 flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setStyle("ai")}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold ${style === "ai" ? "bg-gray-900 text-white" : "text-gray-500"}`}
            >
              AI-Generated
            </button>
            <button
              onClick={() => setStyle("stock")}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold ${style === "stock" ? "bg-gray-900 text-white" : "text-gray-500"}`}
            >
              Stock Whiteboard
            </button>
          </div>
        </div>

        <button
          disabled={!script || !fileName}
          className="mt-8 w-full py-4 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-40"
        >
          Generate Video
        </button>
      </div>
    </main>
  );
            }
