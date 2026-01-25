// app/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";

export default function Page() {
  const [accessory, setAccessory] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState<string>(
    "Design a women's flat sandal. Use the uploaded accessory prominently. Match the uploaded material for straps. Minimal, premium look."
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultB64, setResultB64] = useState<string | null>(null);

  const selectedCount = useMemo(() => {
    return [accessory, material, sole, inspiration].filter(Boolean).length;
  }, [accessory, material, sole, inspiration]);

  const canGenerate = useMemo(() => {
    // Require at least one image + prompt
    return !!prompt.trim() && selectedCount >= 1;
  }, [prompt, selectedCount]);

  async function onGenerate() {
    setError(null);
    setResultB64(null);

    if (!canGenerate) {
      setError("Please add a prompt and upload at least one image.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("prompt", prompt.trim());
      if (accessory) fd.append("accessory", accessory, accessory.name);
      if (material) fd.append("material", material, material.name);
      if (sole) fd.append("sole", sole, sole.name);
      if (inspiration) fd.append("inspiration", inspiration, inspiration.name);

      const resp = await fetch("/api/generate", {
        method: "POST",
        body: fd,
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        throw new Error(data?.error || "Generate failed");
      }

      if (!data?.imageBase64) {
        throw new Error("No image returned from server.");
      }

      setResultB64(data.imageBase64);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))",
        padding: 28,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 34, letterSpacing: -0.5 }}>AI Shoe Designer</h1>
            <div style={{ marginTop: 6, opacity: 0.75 }}>
              Upload inputs, write a prompt, then Generate.
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Selected</div>
            <div style={{ fontWeight: 700 }}>{selectedCount} / 4</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 14,
          }}
        >
          <div style={{ gridColumn: "span 4" }}>
            <UploadBox
              title="1) Accessory"
              subtitle="Buckle / logo / ornament"
              file={accessory}
              onChange={setAccessory}
              required={false}
            />
          </div>

          <div style={{ gridColumn: "span 4" }}>
            <UploadBox
              title="2) Material"
              subtitle="Leather / fabric / texture"
              file={material}
              onChange={setMaterial}
              required={false}
            />
          </div>

          <div style={{ gridColumn: "span 4" }}>
            <UploadBox
              title="3) Sole / bottom"
              subtitle="Sole reference image"
              file={sole}
              onChange={setSole}
              required={false}
            />
          </div>

          <div style={{ gridColumn: "span 6" }}>
            <UploadBox
              title="4) Inspiration"
              subtitle="Style reference"
              file={inspiration}
              onChange={setInspiration}
              required={false}
            />
          </div>

          <div
            style={{
              gridColumn: "span 6",
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 14,
              padding: 16,
              background: "white",
              boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15 }}>Prompt</div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={7}
              placeholder="Describe the shoe type (flat/heel/boot), silhouette, toe shape, strap style, mood, etc."
              style={{
                width: "100%",
                resize: "vertical",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.15)",
                padding: 12,
                fontSize: 14,
                outline: "none",
              }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={onGenerate}
                disabled={!canGenerate || loading}
                style={{
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 14px",
                  cursor: !canGenerate || loading ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  opacity: !canGenerate || loading ? 0.55 : 1,
                  background: "black",
                  color: "white",
                  minWidth: 140,
                }}
              >
                {loading ? "Generating..." : "Generate"}
              </button>

              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Tip: Upload at least one image. Best results: Inspiration or Material.
              </div>
            </div>

            {error ? (
              <div
                style={{
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 12,
                  background: "rgba(255,0,0,0.06)",
                  border: "1px solid rgba(255,0,0,0.18)",
                  color: "rgba(120,0,0,0.95)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          {resultB64 ? (
            <div
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 16,
                overflow: "hidden",
                background: "white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ padding: 12, borderBottom: "1px solid rgba(0,0,0,0.08)", fontWeight: 700 }}>
                Result
              </div>
              <img
                src={`data:image/png;base64,${resultB64}`}
                alt="Generated shoe design"
                style={{ display: "block", width: "100%", height: "auto" }}
              />
            </div>
          ) : (
            <div style={{ opacity: 0.7, fontSize: 13, marginTop: 4 }}>
              Result will appear here after you Generate.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}