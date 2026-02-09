"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import UploadBox from "../components/UploadBox";
import ResultPanel from "../components/ResultPanel";
import PromptWithMic from "../components/PromptWithMic";

type BgMode = "dark" | "grey";

type ApiResponse =
  | { ok: true; images: string[] }
  | { ok: false; error: string };

const SUPPORTED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function isSupportedImage(f: File | null) {
  return (
    !!f &&
    (SUPPORTED_TYPES.has(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name))
  );
}

function fileTypeLabel(f: File) {
  return f.type ? `${f.type} (${f.name})` : f.name;
}

// mobile-safe prompt cleaning (NBSP, zero-width, etc.)
function cleanPrompt(s: string) {
  return (s ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

export default function Page() {
  const [hardware, setHardware] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState("");
  const [variations, setVariations] = useState<number>(2);

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [bgMode, setBgMode] = useState<BgMode>("dark");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const lastPromptRef = useRef<string>("");

  useEffect(() => {
    if (!images?.length) {
      setSelectedIndex(0);
      return;
    }
    setSelectedIndex((prev) => Math.min(prev, images.length - 1));
  }, [images]);

  useEffect(() => {
    if (hardware && material) setErrorMsg("");
  }, [hardware, material]);

  const canGenerate = useMemo(() => {
    return Boolean(hardware && material) && !loading;
  }, [hardware, material, loading]);

  function resetAll() {
    setHardware(null);
    setMaterial(null);
    setSole(null);
    setInspiration(null);
    setPrompt("");
    setImages([]);
    setSelectedIndex(0);
    setErrorMsg("");
  }

  async function generate() {
    if (!hardware || !material) {
      setErrorMsg("Accessory + Material are required.");
      return;
    }

    if (!isSupportedImage(hardware)) {
      setErrorMsg(`Unsupported accessory image: ${fileTypeLabel(hardware)}`);
      return;
    }
    if (!isSupportedImage(material)) {
      setErrorMsg(`Unsupported material image: ${fileTypeLabel(material)}`);
      return;
    }
    if (sole && !isSupportedImage(sole)) {
      setErrorMsg(`Unsupported sole image: ${fileTypeLabel(sole)}`);
      return;
    }
    if (inspiration && !isSupportedImage(inspiration)) {
      setErrorMsg(`Unsupported inspiration image: ${fileTypeLabel(inspiration)}`);
      return;
    }
    const safePrompt = cleanPrompt(prompt);

   function cleanPrompt(input: string) {
  return (input ?? "")
    .normalize("NFKC")                 // ✅ critical for iOS
    .replace(/\u00A0/g, " ")            // NBSP
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
    .replace(/[\u2028\u2029]/g, "\n")   // iOS line separators
    .replace(/\s+/g, " ")
    .trim();
}

    try {
      const fd = new FormData();

      // API expects accessory + material
      fd.append("accessory", hardware);
      fd.append("material", material);
      if (sole) fd.append("sole", sole);
      if (inspiration) fd.append("inspiration", inspiration);

      fd.append("prompt", safePrompt);

      // support both server variants (n/variations)
      fd.append("variations", String(variations));
      fd.append("n", String(variations));

      // IMPORTANT for iOS Safari:
      const res = await fetch("/api/generate", { method: "POST", body: fd });

      const data = (await res.json()) as ApiResponse;

      if (!res.ok || data.ok === false) {
        setErrorMsg(data.ok === false ? data.error : `Request failed (${res.status})`);
        return;
      }

      setImages(data.images || []);
      setSelectedIndex(0);
    } catch (err: any) {
      const raw = String(err?.message || err || "Unknown error");
      setErrorMsg(raw);
    } finally {
      setLoading(false);
    }
  }

  function onDownload() {
    if (!images?.length) return;
    const url = images[selectedIndex] || images[0];
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }
  function downloadSelected() {
  if (!images.length) return;

  const url = images[selectedIndex];
  const a = document.createElement("a");
  a.href = url;
  a.download = `ai-shoe-design-${selectedIndex + 1}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
function cleanPrompt(input: string) {
  return input
    .replace(/\u00A0/g, " ")                  // NBSP
    .replace(/[\u200B-\u200D\uFEFF]/g, "")    // zero-width chars
    .replace(/[“”]/g, '"')                    // smart quotes
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

 return (
  <div className="page">
    {/* Header */}
    <header className="header">
      <div>
        <h1 className="title">AI SHOE DESIGNER</h1>
        <p className="subtitle">
          Upload design references and generate footwear concepts instantly.
        </p >
      </div>

      <div className="topActions">
        <button className="btn" onClick={resetAll} disabled={loading}>
          Reset
        </button>

        <button className="btnPrimary" onClick={generate} disabled={!canGenerate}>
          {loading ? "Generating..." : "Generate"}
        </button>

        <div className="variations">
          <span className="variationsLabel">DESIGN VARIATIONS</span>
          <select
            className="select"
            value={variations}
            onChange={(e) => setVariations(Number(e.target.value))}
            disabled={loading}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!!errorMsg && <div className="errorBanner">{errorMsg}</div>}
    </header>

    {/* ✅ THIS is the important part: 2-column grid */}
    <main className="mainGrid">
      {/* LEFT PANEL */}
      <section className="panel">
        <div className="panelHeader">DESIGN INPUTS</div>
        <div className="panelBody">
          <UploadBox label="Hardware" required file={hardware} onChange={setHardware} />
          <UploadBox label="Material" required file={material} onChange={setMaterial} />
          <UploadBox label="Sole" file={sole} onChange={setSole} />
          <UploadBox label="Inspiration" file={inspiration} onChange={setInspiration} />

          <div className="promptBlock">
            <div className="promptLabel">Design notes</div>
            <PromptWithMic value={prompt} onChange={setPrompt} />
          </div>
        </div>
      </section>

      {/* RIGHT PANEL */}
<section className="panel">
  <ResultPanel
    title="RESULT"
    images={images}
    loading={loading}
    selectedIndex={selectedIndex}
    onSelect={setSelectedIndex}
    bgMode={bgMode}
    onBgChange={setBgMode}
    onDownload={downloadSelected}
  />

  {/* Prompt editor under result */}
  <div className="promptCard">
    <div className="promptCardTop">
      <div className="promptCardTitle">Prompt</div>
      <div className="promptCardSub">
        Edit the prompt and regenerate using the same uploaded references.
      </div>
    </div>

    <textarea
      className="promptTextarea"
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      placeholder='Example: "Make a ladies ballerina. Use buckle from hardware..."'
      rows={4}
    />

    <div className="promptActions">
      <button
        className="btnPrimary"
        disabled={!canGenerate || !prompt.trim()}
        onClick={generate}
      >
        Regenerate
      </button>

      <button
        className="btnGhost"
        disabled={loading}
        onClick={() => setPrompt("")}
      >
        Clear
      </button>
    </div>
  </div>
</section>
{/* Prompt editor under result */}
<div className="promptCard">
  <div className="promptCardTop">
    <div className="promptCardTitle">Prompt</div>
    <div className="promptCardSub">
      Edit the prompt and regenerate using the same uploaded references.
    </div>
  </div>

  <textarea
    className="promptTextarea"
    placeholder='Example: "Make a ladies ballerina. Use buckle from hardware. Use only the texture from material. Keep the sole shape. Realistic photoshoot."'
    value={prompt}
    onChange={(e) => setPrompt(e.target.value)}
    rows={4}
  />

  <div className="promptActions">
    <button
      className="btnPrimary"
      disabled={!canGenerate || !prompt.trim()}
      onClick={generate}
      title={!prompt.trim() ? "Type a prompt to regenerate" : "Regenerate"}
    >
      Regenerate
    </button>

    <button
      className="btnGhost"
      disabled={loading}
      onClick={() => setPrompt("")}
    >
      Clear
    </button>
  </div>
</div>
       </main>
    </div>
  );
}

