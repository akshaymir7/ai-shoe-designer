"use client";

import React, { useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";
import ResultPanel from "../components/ResultPanel";
import PromptWithMic from "../components/PromptWithMic";

type GenerateResponse =
  | { ok: true; images: string[] }
  | { ok: false; error?: string };

export default function Page() {
  // Files
  const [hardware, setHardware] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  // Prompt + options
  const [prompt, setPrompt] = useState<string>("");
  const [variations, setVariations] = useState<number>(4);

  // Results
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const canGenerate = useMemo(() => {
    // Hardware + Material required (matches your current UX)
    return Boolean(hardware && material) && !loading;
  }, [hardware, material, loading]);

  function resetAll() {
    setHardware(null);
    setMaterial(null);
    setSole(null);
    setInspiration(null);
    setPrompt("");
    setResults([]);
    setLoading(false);
    setVariations(4);
  }

  async function handleGenerate() {
    // Keep this check EXACTLY — avoids the “I uploaded but it says required” bug
    if (!hardware || !material) {
      alert("Hardware + Material are required.");
      return;
    }

    try {
      setLoading(true);
      setResults([]);

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

      const data = (await res.json()) as GenerateResponse;

      if (!res.ok || !data.ok) {
        const msg =
          (data as any)?.error ||
          `Generate failed (${res.status})`;
        alert(msg);
        return;
      }

      setResults(data.images || []);
    } catch (err) {
      console.error(err);
      alert("Generate failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="appShell">
      {/* Header */}
      <header className="pageHeader">
        <h1 className="appTitle">AI SHOE DESIGNER</h1>
        <p className="appSubtitle">
          Upload design references and generate footwear concepts instantly.
          Hardware + Material are required.
        </p >
      </header>

      {/* Top control bar (Fix #1: Variations lives here) */}
      <section className="topControls">
        <div className="controlsLeft">
          <button className="btnSecondary" onClick={resetAll} disabled={loading}>
            Reset
          </button>

          <button
            className="btnPrimary"
            onClick={handleGenerate}
            disabled={!canGenerate}
            aria-disabled={!canGenerate}
            title={!hardware || !material ? "Upload Hardware + Material to generate" : ""}
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>

        <div className="controlsRight">
          <div className="variationBlock">
            <div className="variationLabel">DESIGN VARIATIONS</div>
            <select
              className="variationSelect"
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
      </section>

      {/* Two-column panels */}
      <section className="panelGrid">
        {/* LEFT: Design inputs */}
        <div className="panelCard">
          <div className="panelHeaderStrip">
            <div className="panelHeaderTitle">Design inputs</div>
          </div>

          <div className="panelBody">
            <UploadBox
              label="Hardware"
              file={hardware}
              onChange={setHardware}
              required
              helper="Upload buckles, trims, or accessories"
            />

            <UploadBox
              label="Material"
              file={material}
              onChange={setMaterial}
              required
              helper="Upload leather, fabric, or surface textures"
            />

            <UploadBox
              label="Sole"
              file={sole}
              onChange={setSole}
              helper="Upload outsole or bottom references"
            />

            <UploadBox
              label="Inspiration"
              file={inspiration}
              onChange={setInspiration}
              helper="Optional references for mood, silhouette, or styling"
            />

            <div className="notesBlock">
              <div className="notesTitle">DESIGN NOTES</div>

              {/* If you prefer PromptWithMic, keep it; otherwise replace with a textarea */}
              <PromptWithMic value={prompt} onChange={setPrompt} />

              <div className="notesExample">
                Example: “Use the buckle from image 1. Use only the material texture from image 2.
                Keep the sole shape from image 3. Make a ladies ballerina. Realistic photoshoot.”
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Result (Fix #2: same header strip styling) */}
        <div className="panelCard">
          <div className="panelHeaderStrip">
            <div className="panelHeaderTitle">RESULT</div>
          </div>

          <div className="panelBody">
            {/* Keep props minimal so it matches your current ResultPanel */}
            <ResultPanel title="RESULT"images={results} loading={loading} />
          </div>
        </div>
      </section>
    </main>
  );
}