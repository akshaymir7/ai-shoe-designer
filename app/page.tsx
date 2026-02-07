"use client";

import React, { useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";
import ResultPanel from "../components/ResultPanel";
import PromptWithMic from "../components/PromptWithMic";

type BgMode = "dark" | "grey";

export default function Page() {
  // REQUIRED
  const [hardware, setHardware] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);

  // OPTIONAL
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState<string>("");

  const [variations, setVariations] = useState<number>(4);
  const [bgMode, setBgMode] = useState<BgMode>("dark");

  const [loading, setLoading] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

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
    setBgMode("dark");
  }

  async function handleGenerate() {
    // ✅ FIX: validate hardware + material (NOT accessory)
    if (!hardware || !material) {
      alert("Hardware + Material are required.");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("hardware", hardware);
      fd.append("material", material);
      if (sole) fd.append("sole", sole);
      if (inspiration) fd.append("inspiration", inspiration);
      fd.append("prompt", prompt || "");
      fd.append("variations", String(variations));
      fd.append("bg", bgMode);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Generate failed (${res.status})`);
      }

      const data = await res.json();

      // Expecting: { images: string[] }
      const nextImages: string[] = Array.isArray(data?.images) ? data.images : [];

      setImages(nextImages);
      setSelectedIndex(0);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Generate failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="appShell">
      {/* Header */}
      <div className="topBar">
        <div className="brandBlock">
          <h1 className="brandTitle">AI SHOE DESIGNER</h1>
          <p className="brandSub">
            Upload design references and generate footwear concepts instantly.
          </p >
        </div>

        <div className="controlsRow">
          <button className="btn" onClick={resetAll} disabled={loading}>
            Reset
          </button>

          <button className="btnPrimary" onClick={handleGenerate} disabled={!canGenerate}>
            {loading ? "Generating..." : "Generate Designs"}
          </button>

          <div className="controlGroup">
            <div className="controlLabel">DESIGN VARIATIONS</div>
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
      </div>

      {/* ✅ Panels (kept aligned) */}
      <div className="panelsRow">
        {/* LEFT */}
        <div className="panel">
          <div className="panelHeader">
            <div className="panelTitle">Design inputs</div>
          </div>

          <div className="panelBody">
            <UploadBox label="Hardware" required file={hardware} onChange={setHardware} />
            <UploadBox label="Material" required file={material} onChange={setMaterial} />
            <UploadBox label="Sole" file={sole} onChange={setSole} />
            <UploadBox label="Inspiration" file={inspiration} onChange={setInspiration} />

            <div className="notesBlock">
              <div className="notesTitle">DESIGN NOTES</div>
              <div className="notesHint">
                Example: “Use the buckle from image 1. Use only the material texture from image 2.
                Keep the sole shape from image 3. Make a ladies ballerina. Realistic photoshoot.”
              </div>

              <PromptWithMic value={prompt} onChange={setPrompt} />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="panel">
          <div className="panelHeader panelHeaderSplit">
            <div className="panelTitle">RESULT</div>

            <div className="pillRow">
              <button
                className={`pill ${bgMode === "dark" ? "pillActive" : ""}`}
                onClick={() => setBgMode("dark")}
                disabled={loading}
                type="button"
              >
                DARK
              </button>
              <button
                className={`pill ${bgMode === "grey" ? "pillActive" : ""}`}
                onClick={() => setBgMode("grey")}
                disabled={loading}
                type="button"
              >
                GREY
              </button>
            </div>
          </div>

          <div className="panelBody">
            <ResultPanel
              title="RESULT"
              images={images}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}