"use client";

import React, { useEffect, useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";
import ResultPanel from "../components/ResultPanel";
import PromptWithMic from "../components/PromptWithMic";

type BgMode = "dark" | "grey";

type ApiResponse =
  | { ok: true; images: string[] }
  | { ok: false; error: string };

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

  // Keep selection valid as images change
  useEffect(() => {
    if (!images?.length) {
      setSelectedIndex(0);
      return;
    }
    setSelectedIndex((prev) => Math.min(prev, images.length - 1));
  }, [images]);

  const canGenerate = useMemo(() => {
    return Boolean(hardware && material) && !loading;
  }, [hardware, material, loading]);

  useEffect(() => {
  if (hardware && material) {
    setErrorMsg("");
  }
}, [hardware, material]);

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

  async function handleGenerate() {
    setErrorMsg("");

    if (!hardware || !material) {
      setErrorMsg("Hardware + Material are required.");
      return;
    }

    // clamp variations to allowed set
    const v = [1, 2, 4].includes(variations) ? variations : 2;

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("accessory", hardware);
      fd.append("material", material);
      if (sole) fd.append("sole", sole);
      if (inspiration) fd.append("inspiration", inspiration);
      if (prompt?.trim()) fd.append("prompt", prompt.trim());
      fd.append("variations", String(variations));

      const res = await fetch("/api/generate", {
        method: "POST",
        body: fd,
      });

      const data = (await res.json()) as ApiResponse;

      if (!data.ok) {
        setErrorMsg(data.error || "Generation failed.");
        return;
      }

      setImages(Array.isArray(data.images) ? data.images : []);
      setSelectedIndex(0);
    } catch (e: any) {
      setErrorMsg(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!images?.length) return;
    const url = images[selectedIndex];
    if (!url) return;

    const a = document.createElement("a");
    a.href = url;
    a.download = `design-${selectedIndex + 1}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px 24px 40px",
        color: "rgba(255,255,255,0.92)",
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: 18, maxWidth: 1200 }}>
        <div
          style={{
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.05,
          }}
        >
          AI SHOE
          <br />
          DESIGNER
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: "0.02em",
            opacity: 0.85,
            maxWidth: 720,
          }}
        >
          Upload design references and generate footwear concepts instantly.
        </div>
      </header>

      {/* Top actions */}
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 18,
          maxWidth: 1200,
        }}
      >
        <button className="btn ghost" onClick={resetAll} disabled={loading}>
          Reset
        </button>

        <button
          className="btn primary"
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {loading ? "Generating…" : "Generate"}
        </button>

        {/* Variations belongs with Generate */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginLeft: 6,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            Design Variations
          </div>

          <select
            value={variations}
            onChange={(e) => setVariations(Number(e.target.value))}
            style={{
              height: 36,
              borderRadius: 12,
              padding: "0 12px",
              fontWeight: 800,
              letterSpacing: "0.02em",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(255,255,255,0.18)",
              outline: "none",
            }}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </div>

        {/* Inline error (no annoying alert/json popup) */}
        {errorMsg ? (
          <div
            style={{
              marginLeft: "auto",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.25)",
              fontSize: 13,
              fontWeight: 650,
              letterSpacing: "0.02em",
              color: "rgba(255,255,255,0.9)",
              maxWidth: 520,
            }}
          >
            {errorMsg}
          </div>
        ) : (
          <div style={{ marginLeft: "auto" }} />
        )}
      </div>

      {/* Main layout */}
      <section
        style={{
          display: "flex",
          gap: 18,
          alignItems: "stretch",
          maxWidth: 1200,
        }}
      >
        {/* Left panel */}
        <div style={{ flex: "0 0 520px", minWidth: 360 }}>
          <div className="panel">
            <div
              className="panelHeader"
              style={{
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Design inputs
            </div>

            <div className="panelBody">
              <UploadBox
                label="Hardware"
                required
                file={hardware}
                onChange={setHardware}
              />

              <UploadBox
                label="Material"
                required
                file={material}
                onChange={setMaterial}
              />

              <UploadBox label="Sole" file={sole} onChange={setSole} />

              <UploadBox
                label="Inspiration"
                file={inspiration}
                onChange={setInspiration}
              />

              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 850,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    opacity: 0.78,
                    marginBottom: 8,
                  }}
                >
                  Design notes
                </div>

                <div
                  style={{
                    fontSize: 13,
                    opacity: 0.75,
                    marginBottom: 8,
                    lineHeight: 1.45,
                  }}
                >
                  Example: “Use the buckle from image 1. Use only the material
                  texture from image 2. Keep the sole shape from image 3. Make a
                  ladies ballerina. Realistic photoshoot.”
                </div>

                <PromptWithMic value={prompt} onChange={setPrompt} />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, minWidth: 360 }}>
          <ResultPanel
            title="RESULT"
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

      {/* Responsive fallback (stack) */}
      <style jsx>{`
        @media (max-width: 980px) {
          section {
            flex-direction: column;
          }
          section > div {
            flex: 1 1 auto !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </main>
  );
}