"use client";

import { useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";

type GenerateResponse = {
  imageBase64?: string;
  error?: string;
  debug?: any;
};

export default function Page() {
  const [accessory, setAccessory] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState<string>(
    "Design a premium fashion slipper using the uploaded accessory + material. Keep it product-photo style on a clean background."
  );

  const [loading, setLoading] = useState(false);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = useMemo(() => {
    return !!accessory && !!material && !loading;
  }, [accessory, material, loading]);

  async function onGenerate() {
    setError(null);
    setResultImg(null);

    if (!accessory || !material) {
      setError("Accessory and Material are required.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("accessory", accessory);
      fd.append("material", material);
      if (sole) fd.append("sole", sole);
      if (inspiration) fd.append("inspiration", inspiration);
      fd.append("prompt", prompt);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: fd,
      });

      const data = (await res.json()) as GenerateResponse;

      if (!res.ok || data.error) {
        throw new Error(data.error || "Generate failed.");
      }

      if (!data.imageBase64) {
        throw new Error("No image returned from API.");
      }

      setResultImg(data.imageBase64);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 34, margin: 0, letterSpacing: -0.5 }}>
            AI Shoe Designer
          </h1>
          <div style={{ color: "#666", marginTop: 6 }}>
            Upload inputs → Generate (pipeline test). Next we switch API to OpenAI.
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginTop: 22,
        }}
      >
        <UploadBox
          title="1) Accessory"
          subtitle="Buckle / logo / ornament"
          file={accessory}
          onFile={setAccessory}
          required
        />

        <UploadBox
          title="2) Material"
          subtitle="Leather / fabric / texture"
          file={material}
          onFile={setMaterial}
          required
        />

        <UploadBox
          title="3) Sole / bottom"
          subtitle="Sole reference image"
          file={sole}
          onFile={setSole}
        />

        <UploadBox
          title="4) Inspiration"
          subtitle="Style reference"
          file={inspiration}
          onFile={setInspiration}
        />
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 16,
          border: "1px solid #e6e6e6",
          borderRadius: 14,
          background: "#fff",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Prompt</div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            resize: "vertical",
            borderRadius: 12,
            border: "1px solid #dcdcdc",
            padding: 12,
            fontSize: 14,
            outline: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
          }}
        >
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #111",
              background: canGenerate ? "#111" : "#777",
              color: "#fff",
              cursor: canGenerate ? "pointer" : "not-allowed",
              fontWeight: 700,
            }}
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          <div style={{ fontSize: 12, color: "#666" }}>
            Required: Accessory + Material
          </div>
        </div>

        {error ? (
          <div style={{ marginTop: 12, color: "#b00020", fontSize: 13 }}>
            {error}
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Result</div>
        <div
          style={{
            border: "1px solid #e6e6e6",
            borderRadius: 14,
            background: "#fff",
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
            padding: 14,
            minHeight: 240,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {resultImg ? (
            <img
              src={resultImg}
              alt="result"
              style={{
                width: "100%",
                maxHeight: 520,
                objectFit: "contain",
                borderRadius: 12,
                background: "#fafafa",
              }}
            />
          ) : (
            <div style={{ color: "#888" }}>
              No result yet. Upload files and click Generate.
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 18, fontSize: 12, color: "#666" }}>
        Note: right now the API returns a “pipeline test image” so we confirm
        upload + API + UI. Next step we replace it with OpenAI generation.
      </div>
    </div>
  );
}