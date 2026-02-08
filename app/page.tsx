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
    lastPromptRef.current = safePrompt;

    setLoading(true);
    setErrorMsg("");

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

  return (
    <div className="page">
      {/* Header area (keep your existing header styles in globals.css) */}
      <div className="hero">
        <div className="heroTitle">AI SHOE DESIGNER</div>
        <div className="heroSub">
          Upload design references and generate footwear concepts instantly.
        </div>

        <div className="topActions">
          <button className="btn" onClick={resetAll} disabled={loading}>
            Reset
          </button>

          <button
            className={`btn btnPrimary ${!canGenerate ? "btnDisabled" : ""}`}
            onClick={generate}
            disabled={!canGenerate}
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          <div className="variationGroup">
            <div className="variationLabel">DESIGN VARIATIONS</div>
            <select
              className="select"
              value={variations}
              onChange={(e) => setVariations(Number(e.target.value))}
              disabled={loading}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
        </div>

        {!!errorMsg && <div className="errorBanner">{errorMsg}</div>}
      </div>

      <div className="grid">
        {/* LEFT panel */}
        <div className="panel">
          <div className="panelHeader">
            <div className="panelTitle">DESIGN INPUTS</div>
          </div>

          <div className="panelBody">
            <UploadBox label="Hardware" required file={hardware} onChange={setHardware} />
            <UploadBox label="Material" required file={material} onChange={setMaterial} />
            <UploadBox label="Sole" file={sole} onChange={setSole} />
            <UploadBox label="Inspiration" file={inspiration} onChange={setInspiration} />
          </div>
        </div>

        {/* RIGHT panel */}
        <div className="panel">
          <div className="panelHeader">
            <div className="panelTitle">RESULT</div>
          </div>

          <div className="panelBody">
            <ResultPanel
              title=""
              images={images}
              loading={loading}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              bgMode={bgMode}
              onBgChange={setBgMode}
              onDownload={onDownload}
            />

            {/* Prompt editor under result */}
            <div className="panel" style={{ padding: 0 }}>
              <div className="panelHeader">
                <div className="panelTitle">PROMPT</div>
                <div className="panelSubtitle">
                  Edit the prompt and regenerate using the same uploaded references.
                </div>
              </div>

              <div className="panelBody">
                <PromptWithMic
                  value={prompt}
                  onChange={setPrompt}
                  placeholder={`Example: "Make a ladies ballerina. Use buckle from hardware. Use only the texture from material. Keep the sole shape. Realistic photoshoot."`}
                />

                <div className="promptActions">
                  <button
                    className={`btn btnPrimary ${loading ? "btnDisabled" : ""}`}
                    onClick={generate}
                    disabled={loading}
                  >
                    Regenerate
                  </button>
                  <button className="btn" onClick={() => setPrompt("")} disabled={loading}>
                    Clear
                  </button>
                  <button
                    className="btn"
                    onClick={() => setPrompt(lastPromptRef.current || "")}
                    disabled={loading}
                  >
                    Reset to last prompt
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}