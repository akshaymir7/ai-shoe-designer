"use client";

import { useState } from "react";
import UploadBox from "@/components/UploadBox";
import ResultPanel from "@/components/ResultPanel";
import PromptWithMic from "@/components/PromptWithMic";

type BgMode = "dark" | "grey";

export default function Page() {
  const [hardware, setHardware] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [variations, setVariations] = useState<number>(2);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [bgMode, setBgMode] = useState<BgMode>("dark");

  const canGenerate = Boolean(hardware && material) && !loading;

  async function handleGenerate() {
    if (!hardware || !material) {
      alert("Hardware + Material are required.");
      return;
    }

    setLoading(true);
    setImages([]);
    setSelectedIndex(0);

    try {
      const formData = new FormData();
      formData.append("hardware", hardware);
      formData.append("material", material);
      if (sole) formData.append("sole", sole);
      if (inspiration) formData.append("inspiration", inspiration);
      formData.append("prompt", prompt);
      formData.append("variations", String(variations));

      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data?.ok === false) {
        alert(data?.error || "Generation failed.");
        return;
      }

      const out: string[] = Array.isArray(data.images) ? data.images : [];
      setImages(out.slice(0, variations)); // hard-enforce count
    } catch (e) {
      console.error(e);
      alert("Generation error. Check console.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setHardware(null);
    setMaterial(null);
    setSole(null);
    setInspiration(null);
    setPrompt("");
    setImages([]);
    setSelectedIndex(0);
    setVariations(2);
  }

  function handleDownload() {
    const url = images[selectedIndex];
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "design.png";
    a.click();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "22px 18px 28px",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER (always visible) */}
      <header style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "baseline",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 34, letterSpacing: 0.5 }}>
              AI Shoe Designer
            </h1>
            <p style={{ margin: "6px 0 0", opacity: 0.85 }}>
              Upload design references and generate footwear concepts instantly.
            </p >
          </div>
        </div>
      </header>

      {/* TOP CONTROLS */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <button className="btn ghost" onClick={handleReset}>
          Reset
        </button>

        <button className="btn primary" disabled={!canGenerate} onClick={handleGenerate}>
          {loading ? "Generating…" : "Generate"}
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontWeight: 700, letterSpacing: 0.4, opacity: 0.9 }}>
            DESIGN VARIATIONS
          </span>
          <select
            value={variations}
            onChange={(e) => setVariations(Number(e.target.value))}
            style={{
              height: 34,
              borderRadius: 10,
              padding: "0 10px",
              fontWeight: 700,
            }}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT (forces right panel to show) */}
      <section
        style={{
          display: "flex",
          gap: 18,
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {/* LEFT */}
        <div style={{ flex: "0 0 44%", minWidth: 360 }}>
          <div className="panel">
            <div className="panelHeader">Design inputs</div>
            <div className="panelBody">
              <UploadBox label="Hardware" required file={hardware} onChange={setHardware} />
              <UploadBox label="Material" required file={material} onChange={setMaterial} />
              <UploadBox label="Sole" file={sole} onChange={setSole} />
              <UploadBox label="Inspiration" file={inspiration} onChange={setInspiration} />
              <PromptWithMic value={prompt} onChange={setPrompt} />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, minWidth: 420 }}>
          <ResultPanel
            title="Result"
            images={images}
            loading={loading}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            bgMode={bgMode}
            onBgChange={setBgMode}
            onDownload={handleDownload}
          />
        </div>
      </section>

      {/* MOBILE FALLBACK */}
      <style jsx>{`
        @media (max-width: 980px) {
          section {
            flex-direction: column !important;
          }
          section > div {
            min-width: 0 !important;
            flex: 1 1 auto !important;
          }
        }
      `}</style>
    </main>
  );
}