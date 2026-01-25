// app/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";

type GenerateResult =
  | { ok: true; imageBase64: string; imageDataUrl: string }
  | { ok: false; error: string };

export default function Page() {
  const [accessory, setAccessory] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");

  const canGenerate = useMemo(() => !!accessory && !!material && !loading, [
    accessory,
    material,
    loading,
  ]);

  async function onGenerate() {
    setError("");
    setResultUrl("");

    if (!accessory || !material) {
      setError("Accessory + Material are required.");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("accessory", accessory);
      fd.append("material", material);
      if (sole) fd.append("sole", sole);
      if (inspiration) fd.append("inspiration", inspiration);
      fd.append("prompt", prompt);

      const r = await fetch("/api/generate", { method: "POST", body: fd });
      const data = (await r.json()) as GenerateResult;

      if (!data.ok) {
        setError(data.error || "Request failed.");
        return;
      }

      // Always use the server-provided data URL
      setResultUrl(data.imageDataUrl);
    } catch (e: any) {
      setError(e?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <header className="header">
        <h1 className="h1">AI Shoe Designer</h1>
        <p className="sub">Upload inputs (thumbnails enabled)</p >
      </header>

      <section className="grid">
        <UploadBox
          title="1) Accessory"
          subtitle="Buckle / logo / ornament"
          file={accessory}
          onFile={setAccessory}
        />
        <UploadBox
          title="2) Material"
          subtitle="Leather / fabric / texture"
          file={material}
          onFile={setMaterial}
        />
        <UploadBox
          title="3) Sole / bottom"
          subtitle="Sole reference image"
          file={sole}
          onFile={setSole}
          optional
        />
        <UploadBox
          title="4) Inspiration"
          subtitle="Style reference"
          file={inspiration}
          onFile={setInspiration}
          optional
        />
      </section>

      <section className="panel">
        <label className="label">Prompt (optional)</label>
        <textarea
          className="textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Put the buckle and upper on the sole using the material reference image. Photorealistic studio product photo."
          rows={4}
        />

        <div className="actions">
          <button className="btn" onClick={onGenerate} disabled={!canGenerate}>
            {loading ? "Generating..." : "Generate"}
          </button>
          <div className="hint">Required: Accessory + Material</div>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {resultUrl ? (
          <div className="result">
            < img className="resultImg" src={resultUrl} alt="Generated result" />
          </div>
        ) : null}
      </section>
    </main>
  );
}