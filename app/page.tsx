// app/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";

type HistoryItem = {
  id: string;
  thumb: string;
  prompt: string;
  createdAt: number;
};

async function downscaleImage(file: File, maxSide = 1024, quality = 0.85): Promise<File> {
  // Helps prevent Vercel 413 payload errors on mobile uploads
  const img = document.createElement("img");
  const url = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = url;
    });

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    const scale = Math.min(1, maxSide / Math.max(w, h));
    const nw = Math.max(1, Math.round(w * scale));
    const nh = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = nw;
    canvas.height = nh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, nw, nh);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );

    if (!blob) return file;

    const newName = file.name.replace(/\.(png|jpg|jpeg|webp)$/i, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function Page() {
  const [accessory, setAccessory] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState("");
  const [n, setN] = useState(4);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const canGenerate = useMemo(() => !!accessory && !!material && !loading, [accessory, material, loading]);

  function resetAll() {
    setAccessory(null);
    setMaterial(null);
    setSole(null);
    setInspiration(null);
    setPrompt("");
    setError(null);
    setResult(null);
  }

  async function handleGenerate() {
    setError(null);
    setLoading(true);

    try {
      if (!accessory || !material) {
        setError("Accessory + Material are required.");
        setLoading(false);
        return;
      }

      // Compress/resize to avoid 413 payload too large on mobile/Vercel
      const a2 = await downscaleImage(accessory);
      const m2 = await downscaleImage(material);
      const s2 = sole ? await downscaleImage(sole) : null;
      const i2 = inspiration ? await downscaleImage(inspiration) : null;

      const fd = new FormData();
      fd.append("accessory", a2);
      fd.append("material", m2);
      if (s2) fd.append("sole", s2);
      if (i2) fd.append("inspiration", i2);
      fd.append("prompt", prompt);
      fd.append("n", String(n));

      const resp = await fetch("/api/generate", { method: "POST", body: fd });

      // If server returns HTML (413 etc), this prevents JSON parse crash
      const text = await resp.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON (${resp.status}): ${text.slice(0, 120)}`);
      }

      if (!resp.ok || !json?.ok) {
        throw new Error(json?.error || `Request failed (${resp.status})`);
      }

      const images: string[] = json.images ?? [];
      if (!images.length) throw new Error("No images returned.");

      // Show the first image as the big “Result”
      setResult(images[0]);

      // Add all returned images into history as separate items
      const now = Date.now();
      const newItems: HistoryItem[] = images.map((img64, idx) => ({
        id: `${now}-${idx}-${Math.random().toString(16).slice(2)}`,
        thumb: img64,
        prompt: prompt || "(no prompt)",
        createdAt: now,
      }));

      setHistory((h) => [...newItems, ...h].slice(0, 30));
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function downloadResult() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `ai-shoe-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="wrap">
      <div className="topbar">
        <div>
          <h1 className="title">AI Shoe Designer</h1>
          <p className="subtitle">
            Upload inputs, add a prompt, then generate. <b>Accessory + Material</b> are required.
          </p>
        </div>

        <div className="topbarActions">
          <button className="btnSecondary" type="button" onClick={resetAll} disabled={loading}>
            Reset
          </button>
          <button className="btnPrimary" type="button" onClick={handleGenerate} disabled={!canGenerate}>
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      <div className="grid">
        <div className="left">
          <div className="cardsGrid">
            <div className="cardSlot">
              <UploadBox
                title="1) Accessory"
                subtitle="Buckle / logo / ornament"
                file={accessory}
                onFile={setAccessory}
              />
            </div>

            <div className="cardSlot">
              <UploadBox
                title="2) Material"
                subtitle="Leather / fabric / texture"
                file={material}
                onFile={setMaterial}
              />
            </div>

            <div className="cardSlot">
              <UploadBox
                title="3) Sole / bottom"
                subtitle="Sole reference image"
                file={sole}
                onFile={setSole}
              />
            </div>

            <div className="cardSlot">
              <UploadBox
                title="4) Inspiration"
                subtitle="Style reference"
                file={inspiration}
                onFile={setInspiration}
                optional
              />
            </div>
          </div>

          <div className="promptCard">
            <div className="row">
              <div className="cardTitle">Prompt (optional)</div>

              <div className="rowRight">
                <label className="muted" style={{ marginRight: 8 }}>
                  Variations
                </label>
                <select
                  className="select"
                  value={n}
                  onChange={(e) => setN(Number(e.target.value))}
                  disabled={loading}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                </select>
              </div>
            </div>

            <textarea
              className="textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "Use the buckle and material, keep the same sole shape, studio product photo, realistic, clean background."'
              rows={5}
              disabled={loading}
            />

            <div className="muted" style={{ marginTop: 8 }}>
              Required: <b>Accessory + Material</b>
            </div>

            {error ? <div className="error">{error}</div> : null}
          </div>
        </div>

        <div className="right">
          <div className="resultCard">
            <div className="row">
              <div className="cardTitle">Result</div>
              <button className="btnSecondary" type="button" onClick={downloadResult} disabled={!result}>
                Download
              </button>
            </div>

            <div className="resultFrame">
              {result ? <img className="resultImg" src={result} alt="Result" /> : <div className="placeholder">No result yet</div>}
            </div>
          </div>

          <div className="historyCard">
            <div className="row">
              <div className="cardTitle">History</div>
              <button className="btnSecondary" type="button" onClick={() => setHistory([])} disabled={!history.length}>
                Clear
              </button>
            </div>

            <div className="historyList">
              {history.map((h) => (
                <button
                  key={h.id}
                  className="historyItem"
                  type="button"
                  onClick={() => setResult(h.thumb)}
                  title={h.prompt}
                >
                  <img className="historyThumb" src={h.thumb} alt="thumb" />
                  <div className="historyMeta">
                    <div className="historyPrompt">{h.prompt}</div>
                    <div className="muted">{new Date(h.createdAt).toLocaleString()}</div>
                  </div>
                </button>
              ))}
              {!history.length ? <div className="muted">No history yet.</div> : null}
            </div>
          </div>
        </div>
      </div>

      {/* Minimal styles inline so you don’t have to chase CSS files */}
      <style jsx global>{`
        :root {
          color-scheme: dark;
        }
        body {
          margin: 0;
          background: radial-gradient(1200px 700px at 20% 10%, #1e2b2a 0%, #0b0f12 55%, #070a0d 100%);
          color: #e8eef2;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji",
            "Segoe UI Emoji";
        }
        .wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }
        .topbar {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .title {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.02em;
        }
        .subtitle {
          margin: 6px 0 0 0;
          color: rgba(232, 238, 242, 0.72);
        }
        .topbarActions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 16px;
        }
        @media (max-width: 980px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
        .cardsGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 700px) {
          .cardsGrid {
            grid-template-columns: 1fr;
          }
        }
        .card,
        .promptCard,
        .resultCard,
        .historyCard {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 16px;
          padding: 14px;
          backdrop-filter: blur(10px);
        }
        .cardHeader,
        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }
        .rowRight {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cardTitle {
          font-weight: 700;
        }
        .cardSubtitle {
          margin-top: 4px;
          color: rgba(232, 238, 242, 0.68);
          font-size: 13px;
        }
        .muted {
          color: rgba(232, 238, 242, 0.6);
          font-size: 13px;
        }
        .btnPrimary {
          background: #1d3d33;
          border: 1px solid rgba(120, 255, 200, 0.25);
          color: #e8eef2;
          padding: 10px 14px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .btnPrimary:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .btnSecondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #e8eef2;
          padding: 9px 12px;
          border-radius: 12px;
          cursor: pointer;
        }
        .btnSecondary:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .select {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #e8eef2;
          border-radius: 10px;
          padding: 8px 10px;
        }
        .drop {
          display: block;
          border: 1px dashed rgba(255, 255, 255, 0.18);
          border-radius: 14px;
          padding: 12px;
          cursor: pointer;
          background: rgba(0, 0, 0, 0.12);
        }
        .drop:hover {
          border-color: rgba(120, 255, 200, 0.35);
        }
        .hiddenInput {
          display: none;
        }
        .emptyState {
          padding: 10px 2px;
        }
        .emptyTitle {
          font-weight: 700;
          margin-bottom: 4px;
        }
        .fileRow {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .thumb {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.10);
          display: grid;
          place-items: center;
          overflow: hidden;
        }
        .thumbPlaceholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
        }
        .fileName {
          font-weight: 700;
          font-size: 13px;
          word-break: break-all;
        }
        .textarea {
          width: 100%;
          box-sizing: border-box;
          border-radius: 14px;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.18);
          color: #e8eef2;
          outline: none;
          resize: vertical;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 13px;
        }
        .error {
          margin-top: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(255, 80, 80, 0.12);
          border: 1px solid rgba(255, 80, 80, 0.22);
          color: rgba(255, 200, 200, 0.95);
          font-weight: 700;
        }
        .resultFrame {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(0, 0, 0, 0.16);
          overflow: hidden;
          display: grid;
          place-items: center;
        }
        .resultImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .placeholder {
          color: rgba(232, 238, 242, 0.55);
        }
        .historyList {
          display: grid;
          gap: 10px;
          margin-top: 10px;
        }
        .historyItem {
          width: 100%;
          display: flex;
          gap: 10px;
          align-items: center;
          text-align: left;
          padding: 10px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(0, 0, 0, 0.12);
          cursor: pointer;
        }
        .historyItem:hover {
          border-color: rgba(120, 255, 200, 0.28);
        }
        .historyThumb {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.10);
        }
        .historyPrompt {
          font-weight: 700;
          font-size: 13px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}