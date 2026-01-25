"use client";

import React, { useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";

type GenerateResult = {
  imageBase64?: string;
  error?: string;
};

function b64ToFile(b64: string, filename = "result.png"): File {
  const byteString = atob(b64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: "image/png" });
  return new File([blob], filename, { type: "image/png" });
}

async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const iw = img.width;
  const ih = img.height;
  const r = Math.max(w / iw, h / ih);
  const nw = iw * r;
  const nh = ih * r;
  const nx = x + (w - nw) / 2;
  const ny = y + (h - nh) / 2;
  ctx.drawImage(img, nx, ny, nw, nh);
}

async function buildCollage(opts: {
  title: string;
  cells: { label: string; file: File | null }[];
}): Promise<File> {
  const W = 1024;
  const H = 1024;

  const padding = 28;
  const headerH = 86;

  const cellGap = 16;
  const gridW = W - padding * 2;
  const gridH = H - padding * 2 - headerH;

  const cellW = (gridW - cellGap) / 2;
  const cellH = (gridH - cellGap) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Apple-ish background
  ctx.fillStyle = "#F5F5F7";
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.fillStyle = "#111114";
  ctx.font = "700 30px ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
  ctx.fillText(opts.title, padding, padding + 38);

  ctx.fillStyle = "#6E6E73";
  ctx.font = "500 14px ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
  ctx.fillText("Reference board (2×2). These images guide the final design.", padding, padding + 64);

  const positions = [
    { x: padding, y: padding + headerH, w: cellW, h: cellH },
    { x: padding + cellW + cellGap, y: padding + headerH, w: cellW, h: cellH },
    { x: padding, y: padding + headerH + cellH + cellGap, w: cellW, h: cellH },
    { x: padding + cellW + cellGap, y: padding + headerH + cellH + cellGap, w: cellW, h: cellH },
  ];

  for (let i = 0; i < 4; i++) {
    const pos = positions[i];
    const cell = opts.cells[i];

    // Card
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#D2D2D7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const r = 18;
    ctx.roundRect(pos.x, pos.y, pos.w, pos.h, r);
    ctx.fill();
    ctx.stroke();

    // Label
    ctx.fillStyle = "#1D1D1F";
    ctx.font = "700 16px ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
    ctx.fillText(cell.label, pos.x + 14, pos.y + 26);

    // Image area
    const innerX = pos.x + 12;
    const innerY = pos.y + 38;
    const innerW = pos.w - 24;
    const innerH = pos.h - 52;

    if (cell.file) {
      const img = await fileToImage(cell.file);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(innerX, innerY, innerW, innerH, 14);
      ctx.clip();
      drawCover(ctx, img, innerX, innerY, innerW, innerH);
      ctx.restore();

      ctx.strokeStyle = "#E5E5EA";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(innerX, innerY, innerW, innerH, 14);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#F2F2F4";
      ctx.beginPath();
      ctx.roundRect(innerX, innerY, innerW, innerH, 14);
      ctx.fill();

      ctx.fillStyle = "#86868B";
      ctx.font = "600 14px ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
      ctx.fillText("Optional", innerX + 14, innerY + 28);
    }
  }

  const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
  return new File([blob], "reference-board.png", { type: "image/png" });
}

async function callGenerateAPI(imageFile: File, prompt: string): Promise<GenerateResult> {
  const fd = new FormData();
  fd.append("prompt", prompt);
  fd.append("image", imageFile);

  const res = await fetch("/api/generate", { method: "POST", body: fd });
  const json = (await res.json()) as GenerateResult;

  if (!res.ok) {
    return { error: json?.error ?? "Request failed" };
  }
  return json;
}

export default function Page() {
  // 4-part inputs
  const [part1, setPart1] = useState<File | null>(null); // Buckle / Accessory
  const [part2, setPart2] = useState<File | null>(null); // Upper / Strap
  const [part3, setPart3] = useState<File | null>(null); // Sole / Footbed
  const [part4, setPart4] = useState<File | null>(null); // Reference shoe / vibe

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  // Result + history
  const [resultB64, setResultB64] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedFromHistory, setSelectedFromHistory] = useState<string | null>(null);

  // Refinement
  const [refinePrompt, setRefinePrompt] = useState("");

  const activeImageB64 = selectedFromHistory ?? resultB64;

  const canGenerate = useMemo(() => {
    return prompt.trim().length > 0 && (part1 || part2 || part3 || part4);
  }, [prompt, part1, part2, part3, part4]);

  async function onGenerateBase() {
    setLoading(true);
    try {
      const board = await buildCollage({
        title: "AI Shoe Designer — Reference Board",
        cells: [
          { label: "1) Accessory / Buckle", file: part1 },
          { label: "2) Upper / Strap Material", file: part2 },
          { label: "3) Sole / Footbed", file: part3 },
          { label: "4) Reference Style / Vibe", file: part4 },
        ],
      });

      const fullPrompt = `Use the 2x2 reference board to design ONE final shoe product render.
Follow the user's instructions and combine the elements harmoniously.
User prompt: ${prompt}`;

      const out = await callGenerateAPI(board, fullPrompt);
      if (out.error) throw new Error(out.error);
      if (!out.imageBase64) throw new Error("No image returned");

      setResultB64(out.imageBase64);
      setSelectedFromHistory(null);
      setHistory((h) => [out.imageBase64!, ...h].slice(0, 40));
      setRefinePrompt("");
    } catch (e: any) {
      alert(e?.message ?? "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function onRefine(extraInstruction: string) {
    if (!activeImageB64) return;
    setLoading(true);
    try {
      const baseFile = b64ToFile(activeImageB64, "base.png");

      const out = await callGenerateAPI(
        baseFile,
        `Refine the existing design. Keep everything consistent unless changed.
Instruction: ${extraInstruction}`
      );

      if (out.error) throw new Error(out.error);
      if (!out.imageBase64) throw new Error("No image returned");

      setResultB64(out.imageBase64);
      setSelectedFromHistory(null);
      setHistory((h) => [out.imageBase64!, ...h].slice(0, 40));
    } catch (e: any) {
      alert(e?.message ?? "Refine failed");
    } finally {
      setLoading(false);
    }
  }

  function onClear() {
    setPart1(null); setPart2(null); setPart3(null); setPart4(null);
    setPrompt("");
    setRefinePrompt("");
    setResultB64(null);
    setSelectedFromHistory(null);
    setHistory([]);
  }

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <div className="brand">AI Shoe Designer</div>
          <div className="muted">Upload parts → prompt → generate → refine</div>
        </div>

        <div className="topbarActions">
          <button className="btn btnPrimary" disabled={!canGenerate || loading} onClick={onGenerateBase}>
            {loading ? "Generating…" : "Generate Design"}
          </button>
          <button className="btn btnGhost" onClick={onClear} disabled={loading}>
            Clear
          </button>
        </div>
      </div>

      <div className="layout">
        {/* LEFT: inputs */}
        <div className="left">
          <div className="grid4">
            <UploadBox
              title="Accessory / Buckle"
              subtitle="Hardware, buckle, logo piece"
              file={part1}
              onChange={setPart1}
            />
            <UploadBox
              title="Upper / Strap"
              subtitle="Material, weave, stitching"
              file={part2}
              onChange={setPart2}
            />
            <UploadBox
              title="Sole / Footbed"
              subtitle="Outsole, footbed texture"
              file={part3}
              onChange={setPart3}
            />
            <UploadBox
              title="Reference Style"
              subtitle="Overall silhouette / vibe"
              file={part4}
              onChange={setPart4}
            />
          </div>

          <div className="card promptCard">
            <div className="sectionTitle">Prompt</div>
            <textarea
              className="textarea"
              placeholder='Example: "Make a Birkenstock-style slipper using these buckles, premium leather strap, minimal studio background."'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
            />

            <div className="hint">
              Tip: mention camera angle (“top-down product shot” / “on-foot model shot”), materials, and brand style.
            </div>
          </div>
        </div>

        {/* RIGHT: result (fixed height) + history (horizontal scroll) */}
        <div className="right">
          <div className="card resultCard">
            <div className="resultHeader">
              <div className="sectionTitle">Result</div>
              {activeImageB64 ? (
                <div className="resultActions">
                  <button
                    className="btn btnGhost"
                    disabled={loading}
                    onClick={() =>
                      onRefine("Show a lifestyle photo of a model wearing these slippers, premium editorial lighting.")
                    }
                  >
                    Show on model
                  </button>
                  <button
                    className="btn btnGhost"
                    disabled={loading}
                    onClick={() => onRefine("Make it more premium: cleaner stitching, sharper edges, better leather grain.")}
                  >
                    Make more premium
                  </button>
                </div>
              ) : null}
            </div>

            <div className="resultBody">
              {activeImageB64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="resultImg"
                  src={`data:image/png;base64,${activeImageB64}`}
                  alt="result"
                />
              ) : (
                <div className="emptyState">
                  Upload parts + write prompt, then click <b>Generate Design</b>.
                </div>
              )}
            </div>

            {activeImageB64 ? (
              <div className="refineBar">
                <input
                  className="input"
                  value={refinePrompt}
                  onChange={(e) => setRefinePrompt(e.target.value)}
                  placeholder='Refine: e.g. "make the buckle larger" / "change strap to suede" / "add contrast stitching"'
                />
                <button
                  className="btn btnPrimary"
                  disabled={loading || refinePrompt.trim().length === 0}
                  onClick={() => onRefine(refinePrompt)}
                >
                  Refine
                </button>
              </div>
            ) : null}
          </div>

          <div className="card historyCard">
            <div className="sectionTitle">History</div>
            <div className="historyRow">
              {history.length === 0 ? (
                <div className="muted">No generations yet.</div>
              ) : (
                history.map((b64, idx) => (
                  <button
                    key={idx}
                    className={"thumbBtn " + (b64 === activeImageB64 ? "active" : "")}
                    onClick={() => setSelectedFromHistory(b64)}
                    type="button"
                    title="Click to preview"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="thumbImg" src={`data:image/png;base64,${b64}`} alt={`history-${idx}`} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
