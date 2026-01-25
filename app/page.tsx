"use client";

import React, { useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";

type GenerateResponse = {
  imageBase64?: string;
  error?: string;
};

export default function Page() {
  const [part1, setPart1] = useState<File | null>(null); // accessory (required)
  const [part2, setPart2] = useState<File | null>(null); // material (required)
  const [part3, setPart3] = useState<File | null>(null); // sole (optional)
  const [part4, setPart4] = useState<File | null>(null); // inspiration (optional)

  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultBase64, setResultBase64] = useState<string | null>(null);

  const canGenerate = useMemo(() => !!part1 && !!part2 && !loading, [part1, part2, loading]);

  async function onGenerate() {
    setError(null);
    setResultBase64(null);

    if (!part1 || !part2) {
      setError("Accessory and Material are required.");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("accessory", part1);
      fd.append("material", part2);
      if (part3) fd.append("sole", part3);
      if (part4) fd.append("inspiration", part4);
      fd.append("prompt", prompt || "");

      const res = await fetch("/api/generate", {
        method: "POST",
        body: fd,
      });

      const json = (await res.json()) as GenerateResponse;

      if (!res.ok || json.error || !json.imageBase64) {
        throw new Error(json.error || `Request failed (${res.status})`);
      }

      setResultBase64(json.imageBase64);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <header className="header">
        <h1 className="h1">AI Shoe Designer</h1>
        <p className="sub">
          Upload your inputs, add a prompt, then Generate.
        </p >
      </header>

      <section className="grid">
        <UploadBox
          title="1) Accessory"
          subtitle="Buckle / logo / ornament"
          file={part1}
          onFile={setPart1}
        />

        <UploadBox
          title="2) Material"
          subtitle="Leather / fabric / texture"
          file={part2}
          onFile={setPart2}
        />

        <UploadBox
          title="3) Sole / bottom"
          subtitle="Sole reference image"
          file={part3}
          onFile={setPart3}
          optional
        />

        <UploadBox
          title="4) Inspiration"
          subtitle="Style reference"
          file={part4}
          onFile={setPart4}
          optional
        />
      </section>

      <section className="panel">
        <div className="row">
          <div className="grow">
            <label className="label">Prompt (optional)</label>
            <textarea
              className="textarea"
              placeholder={`Example: "Men's cork footbed slide sandal, premium look, studio product photo, neutral background."`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <div className="actions">
            <button
              className="primaryBtn"
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate}
            >
              {loading ? "Generating..." : "Generate"}
            </button>

            <div className="mutedSmall">
              Required: Accessory + Material
            </div>
          </div>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {resultBase64 ? (
          <div className="result">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="resultImg"
              src={`data:image/png;base64,${resultBase64}`}
              alt="Generated shoe design"
            />
            <a
              className="ghostBtn"
              href= "shoe-design.png"
            >
              Download PNG
            </a >
          </div>
        ) : null}
      </section>

      <footer className="footer mutedSmall">
        Tip: If output looks off, add a stronger prompt like “studio product photo, white background, realistic materials”.
      </footer>
    </main>
  );
}