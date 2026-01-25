"use client";

import React, { useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";

type GenItem = {
  id: string;
  imageBase64: string; // raw base64 (no data: prefix)
  createdAt: number;
};

function dataUrlFromB64(b64: string) {
  // If server already returns data URL, keep it
  if (b64.startsWith("data:image")) return b64;
  return `data:image/png;base64,${b64}`;
}

export default function Page() {
  // 4 uploads
  const [part1, setPart1] = useState<File | null>(null); // accessory
  const [part2, setPart2] = useState<File | null>(null); // material
  const [part3, setPart3] = useState<File | null>(null); // sole (optional)
  const [part4, setPart4] = useState<File | null>(null); // inspiration (optional)

  // prompt
  const [prompt, setPrompt] = useState("");

  // generation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // history thumbnails
  const [history, setHistory] = useState<GenItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    if (!history.length) return null;
    const found = history.find((h) => h.id === selectedId);
    return found ?? history[0];
  }, [history, selectedId]);

  const selectedCount = useMemo(() => {
    return [part1, part2, part3, part4].filter(Boolean).length;
  }, [part1, part2, part3, part4]);

  async function onGenerate() {
    setError(null);

    // Require at least accessory + material (your core)
    if (!part1 || !part2) {
      setError("Please upload at least Accessory and Material.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();

      // IMPORTANT: match your backend names (these were used earlier in your project)
      fd.append("part1", part1);
      fd.append("part2", part2);
      if (part3) fd.append("part3", part3);
      if (part4) fd.append("part4", part4);

      fd.append("prompt", prompt || "");

      const res = await fetch("/api/generate", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          json?.error ||
          json?.message ||
          `Generate failed (HTTP ${res.status})`;
        throw new Error(msg);
      }

      const b64: string | undefined =
        json?.imageBase64 || json?.image || json?.b64;

      if (!b64 || typeof b64 !== "string") {
        throw new Error("No image returned from /api/generate");
      }

      const item: GenItem = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        imageBase64: b64,
        createdAt: Date.now(),
      };

      setHistory((prev) => [item, ...prev]);
      setSelectedId(item.id);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setPart1(null);
    setPart2(null);
    setPart3(null);
    setPart4(null);
    setPrompt("");
    setError(null);
    // keep history (usually you want to keep it)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        padding: "28px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          gap: 18,
        }}
      >
        {/* LEFT: Inputs */}
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: 16,
            boxShadow: "0 8px 22px rgba(20,20,50,0.06)",
            border: "1px solid rgba(20,20,50,0.06)",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: -0.5,
              }}
            >
              AI Shoe Designer
            </div>
            <div style={{ color: "#60657a", marginTop: 6, fontSize: 13 }}>
              Upload inputs, then generate. Thumbnails save your iterations.
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
              marginTop: 14,
            }}
          >
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
              title="3) Sole / bottom (optional)"
              subtitle="Sole reference image"
              file={part3}
              onFile={setPart3}
            />
            <UploadBox
              title="4) Inspiration (optional)"
              subtitle="Style reference"
              file={part4}
              onFile={setPart4}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: "#6a7087", marginBottom: 6 }}>
              Prompt (optional)
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "Minimal Zara-style, navy straps, brushed metal buckles, cork footbed, studio lighting"'
              style={{
                width: "100%",
                minHeight: 90,
                resize: "vertical",
                borderRadius: 12,
                border: "1px solid rgba(20,20,50,0.14)",
                padding: "10px 12px",
                outline: "none",
                fontSize: 13,
                lineHeight: 1.35,
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginTop: 10,
                padding: "10px 12px",
                borderRadius: 12,
                background: "#fff4f4",
                border: "1px solid #ffd2d2",
                color: "#a40000",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 12,
              alignItems: "center",
            }}
          >
            <button
              onClick={onGenerate}
              disabled={loading}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "#c8cbe0" : "#111827",
                color: "white",
                fontWeight: 700,
                letterSpacing: 0.2,
              }}
            >
              {loading ? "Generating..." : "Generate"}
            </button>

            <button
              onClick={clearAll}
              disabled={loading}
              style={{
                height: 44,
                padding: "0 14px",
                borderRadius: 12,
                border: "1px solid rgba(20,20,50,0.14)",
                background: "white",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
                color: "#1f2937",
              }}
            >
              Clear
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: "#6a7087" }}>
            Selected: {selectedCount}/4 • History: {history.length}
          </div>
        </div>

        {/* RIGHT: Output */}
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: 16,
            boxShadow: "0 8px 22px rgba(20,20,50,0.06)",
            border: "1px solid rgba(20,20,50,0.06)",
            minHeight: 520,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 16 }}>Output</div>
            <div style={{ fontSize: 12, color: "#6a7087" }}>
              Click thumbnails to compare
            </div>
          </div>

          {/* Main image area */}
          <div
            style={{
              borderRadius: 14,
              border: "1px solid rgba(20,20,50,0.10)",
              background: "#fafbff",
              overflow: "hidden",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 360,
              position: "relative",
            }}
          >
            {selectedItem ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrlFromB64(selectedItem.imageBase64)}
                alt="Generated shoe"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  background: "white",
                }}
              />
            ) : (
              <div style={{ color: "#6a7087", fontSize: 13, padding: 18 }}>
                No generations yet. Upload Accessory + Material and click{" "}
                <b>Generate</b>.
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {history.map((h) => {
              const active = h.id === (selectedItem?.id ?? null);
              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedId(h.id)}
                  style={{
                    border: active
                      ? "2px solid #111827"
                      : "1px solid rgba(20,20,50,0.14)",
                    borderRadius: 12,
                    padding: 0,
                    background: "white",
                    cursor: "pointer",
                    width: 92,
                    height: 70,
                    overflow: "hidden",
                    flex: "0 0 auto",
                  }}
                  title={new Date(h.createdAt).toLocaleString()}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dataUrlFromB64(h.imageBase64)}
                    alt="thumb"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}