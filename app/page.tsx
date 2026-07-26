"use client";
import { useState } from "react";

export default function Home() {
  const [script, setScript] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [style, setStyle] = useState<"ai" | "stock">("stock");
  const [status, setStatus] = useState<"idle" | "working" | "done">("idle");
  const [stepText, setStepText] = useState("");

  const steps = [
    "Transcribing audio…",
    "Matching keywords to visuals…",
    "Syncing timing…",
    "Rendering timeline…",
  ];

  function generate() {
    setStatus("working");
    let i = 0;
    setStepText(steps[0]);
    const interval = setInterval(() => {
      i++;
      if (i < steps.length) {
        setStepText(steps[i]);
      } else {
        clearInterval(interval);
        setStatus("done");
      }
    }, 900);
  }

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

        {status === "idle" && (
          <button
            disabled={!script || !fileName}
            onClick={generate}
            className="mt-8 w-full py-4 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-40"
          >
            Generate Video
          </button>
        )}

        {status === "working" && (
          <div className="mt-8 text-center">
            <div className="text-sm text-gray-500">{stepText}</div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 animate-pulse w-2/3" />
            </div>
          </div>
        )}

        {status === "done" && (
          <div className="mt-8">
            <div className="bg-gray-50 rounded-xl aspect-video flex items-center justify-center p-6">
              <svg viewBox="0 0 300 160" className="w-full">
                <path
                  d="M40 130 L40 60 M40 60 L20 80 M40 60 L60 80"
                  fill="none" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"
                  className="draw-line"
                />
                <circle
                  cx="40" cy="45" r="10" fill="none" stroke="#1a1a1a" strokeWidth="4"
                  className="draw-line"
                />
                <path
                  d="M100 120 L140 70 L170 95 L220 40"
                  fill="none" stroke="#e0483f" strokeWidth="4" strokeLinecap="round"
                  className="draw-line"
                />
                <path
                  d="M220 40 L200 40 M220 40 L220 60"
                  fill="none" stroke="#e0483f" strokeWidth="4" strokeLinecap="round"
                  className="draw-line"
                />
                <line x1="10" y1="130" x2="270" y2="130" stroke="#e4e4e4" strokeWidth="3" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Preview animation — real rendering comes in the next step
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 w-full py-4 rounded-xl border-2 border-gray-900 font-semibold"
            >
              Start New Project
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
