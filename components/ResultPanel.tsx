"use client";

import React, { useMemo, useState } from "react";

type ThemeMode = "dark" | "grey";

export type ResultPanelProps = {
  title?: string;          // e.g. "RESULT"
  loading: boolean;
  images: string[];        // array of image URLs/base64 strings
};

export default function ResultPanel({
  title = "RESULT",
  loading,
  images,
}: ResultPanelProps) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSrc = useMemo(() => {
    if (!images || images.length === 0) return "";
    const safeIndex = Math.min(Math.max(activeIndex, 0), images.length - 1);
    return images[safeIndex] ?? "";
  }, [images, activeIndex]);

  async function downloadActive() {
    if (!activeSrc) return;

    try {
      // supports both remote URLs and data URLs
      const res = await fetch(activeSrc);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-shoe-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Download failed");
    }
  }

  const panelStyle: React.CSSProperties = {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.18) 100%)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    padding: 18,
    height: "100%",
    minHeight: 520,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  };

  const headerRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  };

  const titleStyle: React.CSSProperties = {
    letterSpacing: "0.10em",
    fontWeight: 800,
    fontSize: 18,
    textTransform: "uppercase",
    opacity: 0.95,
  };

  const btnRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const pillBtn = (active: boolean): React.CSSProperties => ({
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    border: "1px solid rgba(255,255,255,0.14)",
    background: active ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    boxShadow: active ? "0 10px 30px rgba(0,0,0,0.30)" : "none",
  });

  const downloadBtn: React.CSSProperties = {
    ...pillBtn(false),
    padding: "8px 14px",
  };

  const stageBg =
    mode === "grey"
      ? "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.18))"
      : "linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.28))";

  const stageStyle: React.CSSProperties = {
    flex: 1,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: stageBg,
    padding: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  };

  const innerFrame: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    border: "1px dashed rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  };

  const emptyBox: React.CSSProperties = {
    width: "min(520px, 92%)",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.14)",
    padding: "16px 18px",
    textAlign: "center",
  };

  const tipStyle: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.75,
    marginTop: 6,
  };

  const thumbsRow: React.CSSProperties = {
    display: images?.length ? "flex" : "none",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 2,
  };

  const thumbStyle = (active: boolean): React.CSSProperties => ({
    width: 56,
    height: 56,
    borderRadius: 12,
    border: active
      ? "1px solid rgba(255,255,255,0.35)"
      : "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    overflow: "hidden",
    flex: "0 0 auto",
    cursor: "pointer",
    boxShadow: active ? "0 16px 40px rgba(0,0,0,0.35)" : "none",
  });

  return (
    <section style={panelStyle}>
      <div style={headerRow}>
        <div style={titleStyle}>{title}</div>

        <div style={btnRow}>
          <button
            type="button"
            style={pillBtn(mode === "dark")}
            onClick={() => setMode("dark")}
          >
            Dark
          </button>
          <button
            type="button"
            style={pillBtn(mode === "grey")}
            onClick={() => setMode("grey")}
          >
            Grey
          </button>
          <button
            type="button"
            style={downloadBtn}
            onClick={downloadActive}
            disabled={!activeSrc}
            aria-disabled={!activeSrc}
          >
            Download
          </button>
        </div>
      </div>

      <div style={stageStyle}>
        <div style={innerFrame}>
          {loading ? (
            <div style={{ textAlign: "center", opacity: 0.85 }}>
              <div style={{ fontWeight: 800, letterSpacing: "0.06em" }}>
                Generating…
              </div>
              <div style={tipStyle}>Hang tight — cooking variations.</div>
            </div>
          ) : activeSrc ? (
            // Using <img> (not next/image) to avoid domain config issues on Vercel
            <img
              src={activeSrc}
              alt="Generated result"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: 14,
                boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
              }}
            />
          ) : (
            <div style={emptyBox}>
              <div style={{ fontWeight: 900, fontSize: 16, opacity: 0.92 }}>
                Your design will appear here
              </div>
              <div style={{ fontSize: 13, opacity: 0.78, marginTop: 6 }}>
                Upload inputs on the left, then click Generate to preview.
              </div>
              <div style={tipStyle}>Tip: Generate 2–4 variations to compare quickly.</div>
            </div>
          )}
        </div>
      </div>

      <div style={thumbsRow}>
        {images?.map((src, i) => (
          <div
            key={src + i}
            style={thumbStyle(i === activeIndex)}
            onClick={() => setActiveIndex(i)}
            title={`Variation ${i + 1}`}
          >
            <img
              src={src}
              alt={`Thumb ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}