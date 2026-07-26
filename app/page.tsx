"use client";
import { useRef, useState } from "react";

type Scene = { type: string; start: number; end: number };

function buildScenes(script: string, duration: number): Scene[] {
  const raw = script
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 6);

  const sentences = raw.length > 0 ? raw : [script || "your finances"];

  const types = sentences.map((s) => {
    const t = s.toLowerCase();
    if (t.includes("federal reserve") || t.includes(" fed ") || t.startsWith("fed"))
      return "fed";
    if (t.includes("inflation")) return "inflationUp";
    if (t.includes("debt")) return "debtDown";
    if (t.includes("stock") || t.includes("market")) return "chartUp";
    if (t.includes("tax")) return "dollar";
    return "figure";
  });

  const slice = duration / types.length;
  return types.map((type, i) => ({
    type,
    start: i * slice,
    end: (i + 1) * slice,
  }));
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  scenes: Scene[],
  elapsed: number,
  duration: number,
  palette: "ink" | "navy"
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const active =
    scenes.find((s) => elapsed >= s.start && elapsed < s.end) ||
    scenes[scenes.length - 1];

  const localT = active ? (elapsed - active.start) / (active.end - active.start || 1) : 1;
  const pop = Math.min(1, Math.max(0, localT * 5));

  const main = palette === "ink" ? "#1a1a1a" : "#0f2557";
  const accent = palette === "ink" ? "#e0483f" : "#2a9d8f";

  ctx.save();
  ctx.globalAlpha = pop;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const cx = w / 2;
  const cy = h / 2;

  if (active?.type === "figure") {
    ctx.strokeStyle = main;
    ctx.beginPath();
    ctx.arc(cx - 60, cy - 60, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy - 38);
    ctx.lineTo(cx - 60, cy + 40);
    ctx.moveTo(cx - 60, cy - 15);
    ctx.lineTo(cx - 95, cy + 20);
    ctx.moveTo(cx - 60, cy - 15);
    ctx.lineTo(cx - 25, cy + 20);
    ctx.stroke();
  } else if (active?.type === "chartUp" || active?.type === "inflationUp") {
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy + 70);
    ctx.lineTo(cx - 40, cy - 30);
    ctx.lineTo(cx + 10, cy + 20);
    ctx.lineTo(cx + 110, cy - 90);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 80, cy - 90);
    ctx.lineTo(cx + 110, cy - 90);
    ctx.lineTo(cx + 110, cy - 60);
    ctx.stroke();
  } else if (active?.type === "debtDown") {
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy - 70);
    ctx.lineTo(cx - 40, cy + 10);
    ctx.lineTo(cx + 10, cy - 20);
    ctx.lineTo(cx + 110, cy + 90);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 80, cy + 90);
    ctx.lineTo(cx + 110, cy + 90);
    ctx.lineTo(cx + 110, cy + 60);
    ctx.stroke();
  } else if (active?.type === "fed") {
    ctx.strokeStyle = main;
    ctx.beginPath();
    ctx.moveTo(cx - 100, cy + 60);
    ctx.lineTo(cx + 100, cy + 60);
    ctx.stroke();
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 25, cy + 60);
      ctx.lineTo(cx + i * 25, cy - 30);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - 110, cy - 30);
    ctx.lineTo(cx, cy - 80);
    ctx.lineTo(cx + 110, cy - 30);
    ctx.stroke();
  } else if (active?.type === "dollar") {
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font = "bold 70px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", cx, cy + 4);
  }

  ctx.restore();

  const pad = 24;
  const barY = h - 18;
  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(pad, barY, w - pad * 2, 6);
  ctx.fillStyle = accent;
  const progress = duration > 0 ? Math.min(1, elapsed / duration) : 0;
  ctx.fillRect(pad, barY, (w - pad * 2) * progress, 6);
}

export default function Home() {
  const [script, setScript] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [style, setStyle] = useState<"ai" | "stock">("stock");
  const [phase, setPhase] = useState<"idle" | "recording" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [timeLabel, setTimeLabel] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  async function generate() {
    if (!audioFile) return;
    setErrorMsg("");
    setVideoUrl(null);
    setPhase("recording");

    try {
      const audioURL = URL.createObjectURL(audioFile);
      const audio = new Audio(audioURL);

      const duration: number = await new Promise((resolve, reject) => {
        audio.addEventListener("loadedmetadata", () => resolve(audio.duration || 10));
        audio.addEventListener("error", () => reject(new Error("Couldn't read that audio file.")));
      });

      const scenes = buildScenes(script, duration);
      const canvas = canvasRef.current!;
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d")!;

      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaElementSource(audio);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);

      const canvasStream: MediaStream = (canvas as any).captureStream(30);
      const combined = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      const mimeCandidates = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ];
      const mimeType =
        mimeCandidates.find((m) => (window as any).MediaRecorder?.isTypeSupported(m)) ||
        "video/webm";

      const recorder = new MediaRecorder(combined, { mimeType });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        setPhase("done");
        audioCtx.close();
      };

      let stopped = false;
      const stopEverything = () => {
        if (stopped) return;
        stopped = true;
        if (recorder.state !== "inactive") recorder.stop();
      };
      audio.addEventListener("ended", stopEverything);

      let rafId = 0;
      function draw() {
        drawScene(ctx, scenes, audio.currentTime, duration, style === "stock" ? "ink" : "navy");
        setTimeLabel(`${audio.currentTime.toFixed(1)}s / ${duration.toFixed(1)}s`);
        if (audio.ended || stopped) {
          cancelAnimationFrame(rafId);
          return;
        }
        rafId = requestAnimationFrame(draw);
      }

      recorder.start();
      await audio.play();
      draw();

      setTimeout(stopEverything, (duration + 1) * 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("idle");
    setVideoUrl(null);
    setErrorMsg("");
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

        {phase === "idle" && (
          <>
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
                onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              />
              <label
                htmlFor="audio-upload"
                className="mt-2 block border-2 border-dashed border-gray-200 rounded-xl p-5 text-center text-sm text-gray-500 cursor-pointer"
              >
                {audioFile ? `🎙️ ${audioFile.name}` : "📎 Tap to upload audio (max 10 min)"}
              </label>
            </div>

            <div className="mt-6">
              <label className="text-xs font-semibold uppercase text-gray-500">Visual style</label>
              <div className="mt-2 flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setStyle("ai")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold ${
                    style === "ai" ? "bg-gray-900 text-white" : "text-gray-500"
                  }`}
                >
                  AI-Generated
                </button>
                <button
                  onClick={() => setStyle("stock")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold ${
                    style === "stock" ? "bg-gray-900 text-white" : "text-gray-500"
                  }`}
                >
                  Stock Whiteboard
                </button>
              </div>
            </div>

            <button
              disabled={!script || !audioFile}
              onClick={generate}
              className="mt-8 w-full py-4 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-40"
            >
              Generate Video
            </button>
          </>
        )}

        {(phase === "recording" || phase === "done") && (
          <div className="mt-6">
            <canvas
              ref={canvasRef}
              className="w-full rounded-xl bg-gray-50 border border-gray-200"
            />
            {phase === "recording" && (
              <p className="text-xs text-gray-400 text-center mt-2">
                Recording your video… {timeLabel}
              </p>
            )}
          </div>
        )}

        {phase === "done" && videoUrl && (
          <div className="mt-4">
            <video src={videoUrl} controls className="w-full rounded-xl" />
            <a
              href={videoUrl}
              download="financeviz-video.webm"
              className="mt-4 block text-center w-full py-4 rounded-xl bg-gray-900 text-white font-semibold"
            >
              ⬇ Download Video
            </a>
            <button
              onClick={reset}
              className="mt-3 w-full py-4 rounded-xl border-2 border-gray-900 font-semibold"
            >
              Start New Project
            </button>
          </div>
        )}

        {phase === "error" && (
          <div className="mt-6 text-center">
            <p className="text-sm text-red-500">{errorMsg}</p>
            <button
              onClick={reset}
              className="mt-4 w-full py-4 rounded-xl border-2 border-gray-900 font-semibold"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
    }
