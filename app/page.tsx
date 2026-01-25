// app/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";

type ApiOk = { ok: true; imageBase64: string; imageDataUrl: string };
type ApiErr = { ok: false; error: string };
type GenerateResult = ApiOk | ApiErr;

export default function Page() {
  const [accessory, setAccessory] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [lastMeta, setLastMeta] = useState<string>("");

  const canGenerate = useMemo(
    () => !!accessory && !!material && !loading,
    [accessory, material, loading]
  );

  function buildMeta() {
    const names = [
      accessory ? `Accessory: ${accessory.name}` : "",
      material ? `Material: ${material.name}` : "",
      sole ? `Sole: ${sole.name}` : "",
      inspiration ? `Inspiration: ${inspiration.name}` : "",
    ].filter(Boolean);
    return names.join(" • ");
  }

  async function onGenerate() {
    setError("");
    setResultUrl("");
    setLastMeta("");

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

      const r = await fetch("/api/generate", {
        method: "POST",
        body: fd,
      });

      // If the route returned non-JSON (proxy errors etc.)
      const text = await r.text();
      let data: GenerateResult;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON (${r.status}): ${text.slice(0, 200)}`);
      }

      if (!r.ok || !data.ok) {
        const msg = (data as ApiErr).error || `Request failed (${r.status})`;
        setError(msg);
        return;
      }

      setResultUrl((data as ApiOk).imageDataUrl);
      setLastMeta(buildMeta());
    } catch (e: any) {
      setError(e?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  function onDownload() {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `ai-shoe-${Date.now()}.png`;
    a.click();
  }

  return (
    <main className="wrap">
      <header className="header">
        <h1 className="h1">AI Shoe Designer</h1>
        <p className="sub">Upload references → Generate → Download</p >
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
          placeholder="e.g. Put the buckle and upper on the sole using the material reference image. Photorealistic studio product photo. Flat lateral angle."
          rows={4}
        />

        <div className="actions">
          <button className="btn" onClick={onGenerate} disabled={!canGenerate}>
            {loading ? "Generating..." : "Generate"}
          </button>

          <div className="hint">
            Required: Accessory + Material
            {loading ? <span className="dot"> • working…</span> : null}
          </div>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {resultUrl ? (
          <div className="result">
            <div className="resultHeader">
              <div>
                <div className="resultTitle">Result</div>
                {lastMeta ? <div className="muted">{lastMeta}</div> : null}
              </div>
              <button className="btnGhost" onClick={onDownload} type="button">
                Download PNG
              </button>
            </div>

            < img className="resultImg" src={resultUrl} alt="Generated shoe" />
          </div>
        ) : null}
      </section>
    </main>
  );
}