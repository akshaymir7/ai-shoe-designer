"use client";

import React, { useState } from "react";
import UploadBox from "../components/UploadBox";
import PromptWithMic from "../components/PromptWithMic";
import ResultPanel from "../components/ResultPanel";

export default function Page() {
  // ---------- INPUT FILES ----------
  const [accessory, setAccessory] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  // ---------- PROMPTS ----------
  const [prompt, setPrompt] = useState("");
  const [refine, setRefine] = useState("");

  // ---------- RESULT ----------
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------- VARIATIONS ----------
  const [n, setN] = useState(4);

  // ---------- RESET ----------
  function resetAll() {
    setAccessory(null);
    setMaterial(null);
    setSole(null);
    setInspiration(null);
    setPrompt("");
    setRefine("");
    setImages([]);
    setError("");
    setN(4);
  }

  // ---------- GENERATE ----------
  async function generate() {
    if (!accessory || !material) {
      setError("Accessory and Material are required.");
      return;
    }

    setLoading(true);
    setError("");
    setImages([]);

    try {
      const fd = new FormData();
      fd.append("accessory", accessory);
      fd.append("material", material);
      if (sole) fd.append("sole", sole);
      if (inspiration) fd.append("inspiration", inspiration);
      fd.append("prompt", prompt);
      fd.append("n", String(n));

      const resp = await fetch("/api/generate", {
        method: "POST",
        body: fd,
      });

      const text = await resp.text();
      const json = JSON.parse(text);

      if (!resp.ok || !json?.ok) {
        throw new Error(json?.error || "Generation failed");
      }

      if (!json.images || !json.images.length) {
        throw new Error("No images returned");
      }

      setImages(json.images);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ---------- REGENERATE WITH REFINE ----------
  async function regenerateWithRefine() {
    if (!refine.trim()) return;

    setLoading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("accessory", accessory as File);
      fd.append("material", material as File);
      if (sole) fd.append("sole", sole);
      if (inspiration) fd.append("inspiration", inspiration);

      const refinedPrompt =
        (prompt ? prompt + "\n\n" : "") + "Refinement: " + refine;

      fd.append("prompt", refinedPrompt);
      fd.append("n", String(n));

      const resp = await fetch("/api/generate", {
        method: "POST",
        body: fd,
      });

      const text = await resp.text();
      const json = JSON.parse(text);

      if (!resp.ok || !json?.ok) {
        throw new Error(json?.error || "Regeneration failed");
      }

      if (!json.images || !json.images.length) {
        throw new Error("No images returned");
      }

      setImages(json.images);
    } catch (e: any) {
      setError(e.message || "Refine failed");
    } finally {
      setLoading(false);
    }
  }

  // ---------- DOWNLOAD ----------
  function downloadImage(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-shoe-design.png";
    a.click();
  }

  // ---------- UI ----------
  return (
    <div className="pageGrid">
      {/* LEFT SIDE */}
      <section className="panel">
        <div className="panelHead">
          <div className="panelTitle">Design inputs</div>
          <div className="panelActions">
            <button className="btn btnGhost" onClick={resetAll}>
              Reset
            </button>
            <button
              className="btn"
              onClick={generate}
              disabled={loading || !accessory || !material}
            >
              Generate
            </button>
          </div>
        </div>

        <div className="panelBody">
          <UploadBox
            label="1) Accessory / Hardware"
            required
            file={accessory}
            onChange={setAccessory}
          />

          <UploadBox
            label="2) Upper Material"
            required
            file={material}
            onChange={setMaterial}
          />

          <UploadBox
            label="3) Sole / Bottom"
            optional
            file={sole}
            onChange={setSole}
          />

          <UploadBox
            label="4) Inspiration"
            optional
            file={inspiration}
            onChange={setInspiration}
          />

          <PromptWithMic
            value={prompt}
            onChange={setPrompt}
            placeholder="Use the buckle from image 1. Use only the material texture from image 2. Studio product photo."
          />

          <div className="field">
            <div className="label">Variations</div>
            <select
              className="select"
              value={String(n)}
              onChange={(e) => setN(Number(e.target.value))}
              disabled={loading}
            >
              {[1, 2, 3, 4].map((x) => (
                <option key={x} value={String(x)}>
                  {x}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE */}
      <ResultPanel
        title="Result"
        loading={loading}
        error={error}
        images={images}
        onDownload={downloadImage}
        refineValue={refine}
        onRefineChange={setRefine}
        onRegenerateWithRefine={regenerateWithRefine}
        canRegenerate={!loading && images.length > 0 && !!refine.trim()}
      />
    </div>
  );
}