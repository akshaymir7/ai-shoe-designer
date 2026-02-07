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
      alert("Accessory + Material are required.");
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

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data?.ok === false) {
        alert(data?.error || "Generation failed");
        return;
      }

      const out: string[] = Array.isArray(data.images) ? data.images : [];
      setImages(out.slice(0, variations));
    } catch (err) {
      console.error(err);
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
    if (!images[selectedIndex]) return;
    const a = document.createElement("a");
    a.href = images[selectedIndex];
    a.download = "design.png";
    a.click();
  }

  return (
    <main className="pageRoot">
      {/* TOP BAR */}
      <div className="topBar">
        <button className="btn ghost" onClick={handleReset}>
          Reset
        </button>

        <button
          className="btn primary"
          disabled={!canGenerate}
          onClick={handleGenerate}
        >
          {loading ? "Generating…" : "Generate"}
        </button>

        <div className="variationControl">
          <label>Design variations</label>
          <select
            value={variations}
            onChange={(e) => setVariations(Number(e.target.value))}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </div>
      </div>

      {/* MAIN GRID */}
      <section className="mainGrid">
        {/* LEFT PANEL */}
        <div className="leftPanel">
          <h3 className="panelTitle">Design inputs</h3>

          <UploadBox label="Hardware" required file={hardware} onChange={setHardware} />
          <UploadBox label="Material" required file={material} onChange={setMaterial} />
          <UploadBox label="Sole" file={sole} onChange={setSole} />
          <UploadBox label="Inspiration" file={inspiration} onChange={setInspiration} />

          <PromptWithMic value={prompt} onChange={setPrompt} />
        </div>

        {/* RIGHT PANEL */}
        <div className="rightPanel">
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
    </main>
  );
}