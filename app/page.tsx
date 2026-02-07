"use client";

import React, { useMemo, useState } from "react";

import UploadBox from "@/components/UploadBox";
import ResultPanel from "@/components/ResultPanel";

export default function Page() {
  const [hardware, setHardware] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState<string>("");
  const [variations, setVariations] = useState<number>(4);

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
    setLoading(false);
  }

  async function handleGenerate() {
    if (!hardware || !material) {
      alert("Hardware + Material are required.");
      return;
    }

    try {
      setLoading(true);
      setImages([]);

      const form = new FormData();
      form.append("hardware", hardware);
      form.append("material", material);
      if (sole) form.append("sole", sole);
      if (inspiration) form.append("inspiration", inspiration);
      if (prompt.trim()) form.append("prompt", prompt.trim());
      form.append("variations", String(variations));

      const res = await fetch("/api/generate", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.error ||
          data?.message ||
          "Generate failed. Please try again.";
        alert(msg);
        return;
      }

      // Support a few common response shapes
      const out: string[] =
        data?.images || data?.urls || data?.result || data?.data || [];

      if (!Array.isArray(out) || out.length === 0) {
        alert("No images returned. Try again with a clearer prompt.");
        return;
      }

      setImages(out);
    } catch (e: any) {
      alert(e?.message || "Something went wrong while generating.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      {/* Header */}
      <header className="hero">
        <div className="heroInner">
          <h1 className="heroTitle">AI SHOE DESIGNER</h1>
          <p className="heroSub">
            Upload design references and generate footwear concepts instantly.
          </p >

          {/* Top controls */}
          <div className="topControls">
            <button
              className="btn"
              type="button"
              onClick={resetAll}
              disabled={loading}
            >
              Reset
            </button>

            <button
              className="btn btnPrimary"
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
            >
              {loading ? "Generating..." : "Generate"}
            </button>

            <div className="controlGroup">
              <div className="controlLabel">DESIGN VARIATIONS</div>
              <select
                className="select"
                value={variations}
                onChange={(e) => setVariations(Number(e.target.value))}
                disabled={loading}
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <section className="contentGrid">
        {/* Left: Inputs */}
        <div className="panel">
          <div className="panelHeader">
            <div className="panelTitle">Design inputs</div>
          </div>

          <div className="panelBody">
            <UploadBox
              label="Hardware"
              file={hardware}
              onChange={setHardware}
              required
            />

            <UploadBox
              label="Material"
              file={material}
              onChange={setMaterial}
              required
            />

            <UploadBox label="Sole" file={sole} onChange={setSole} />

            <UploadBox
              label="Inspiration"
              file={inspiration}
              onChange={setInspiration}
            />

            <div className="fieldBlock">
              <div className="fieldLabel">Design notes</div>
              <div className="fieldHint">
                Example: “Use the buckle from image 1. Use only the material
                texture from image 2. Keep the sole shape from image 3. Make a
                ladies ballerina. Realistic photoshoot.”
              </div>
              <textarea
                className="textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe silhouette, vibe, and details…"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Right: Result */}
        <div className="panel">
          <div className="panelHeader">
            <div className="panelTitle">RESULT</div>
          </div>

          <div className="panelBody">
            <ResultPanel title="RESULT" images={images} loading={loading} />
          </div>
        </div>
      </section>
    </main>
  );
}