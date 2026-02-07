"use client";

import React, { useMemo, useState } from "react";
import UploadBox from "@/components/UploadBox";
import ResultPanel from "@/components/ResultPanel";

export default function Page() {
  // Keep state names aligned with backend expectations
  const [accessory, setAccessory] = useState<File | null>(null); // UI label: Hardware
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState("");
  const [variations, setVariations] = useState<number>(4);

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const canGenerate = useMemo(() => {
    return Boolean(accessory && material) && !loading;
  }, [accessory, material, loading]);

  function resetAll() {
    setAccessory(null);
    setMaterial(null);
    setSole(null);
    setInspiration(null);
    setPrompt("");
    setImages([]);
    setLoading(false);
  }

  async function handleGenerate() {
    // Frontend guard
    if (!accessory || !material) {
      alert("Hardware + Material are required.");
      return;
    }

    try {
      setLoading(true);
      setImages([]);

      const form = new FormData();

      // IMPORTANT: backend likely expects these exact keys
      form.append("accessory", accessory);
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
      <header className="hero">
        <div className="heroInner">
          <h1 className="heroTitle">AI SHOE DESIGNER</h1>
          <p className="heroSub">
            Upload design references and generate footwear concepts instantly.
          </p >

          <div className="topControls">
            <button className="btn" type="button" onClick={resetAll} disabled={loading}>
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

      <section className="contentGrid">
        {/* LEFT PANEL */}
        <div className="panel">
          <div className="panelHeader">
            <div className="panelTitle">Design inputs</div>
          </div>

          <div className="panelBody">
            <UploadBox
              label="Hardware"
              file={accessory}
              onChange={setAccessory}
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

            {/* DESIGN NOTES – force good sizing/styling */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 800, letterSpacing: 0.3, marginBottom: 6 }}>
                Design notes
              </div>

              <div style={{ opacity: 0.85, fontSize: 13, lineHeight: 1.35, marginBottom: 10 }}>
                Example: “Use the buckle from image 1. Use only the material texture from image 2.
                Keep the sole shape from image 3. Make a ladies ballerina. Realistic photoshoot.”
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe silhouette, vibe, and details…"
                rows={5}
                style={{
                  width: "100%",
                  minHeight: 120,
                  resize: "vertical",
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.28)",
                  color: "rgba(255,255,255,0.92)",
                  outline: "none",
                  fontSize: 14,
                  lineHeight: 1.4,
                }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="panel">
          {/* Only one RESULT label (avoid double RESULT) */}
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