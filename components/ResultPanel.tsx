"use client";

import React, { useEffect, useMemo, useState } from "react";

type Mode = "dark" | "grey";

export type ResultPanelProps = {
  title?: string;
  loading: boolean;
  images: string[]; // urls (data urls or remote)
};

export default function ResultPanel({
  title = "Result",
  loading,
  images,
}: ResultPanelProps) {
  const hasImages = images && images.length > 0;

  const [mode, setMode] = useState<Mode>("dark");
  const [activeIndex, setActiveIndex] = useState(0);

  // Keep index valid if images count changes
  useEffect(() => {
    if (!hasImages) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex > images.length - 1) setActiveIndex(0);
  }, [hasImages, images.length, activeIndex]);

  const activeSrc = useMemo(() => {
    if (!hasImages) return "";
    return images[activeIndex] || images[0] || "";
  }, [hasImages, images, activeIndex]);

  async function downloadOne(src: string) {
    if (!src) return;

    try {
      // If it's a data URL, download directly
      if (src.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = src;
        a.download = `design-${activeIndex + 1}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      // Otherwise fetch as blob for reliable downloads
      const res = await fetch(src, { cache: "no-store" });
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // try to infer extension
      const ext =
        blob.type === "image/jpeg"
          ? "jpg"
          : blob.type === "image/webp"
          ? "webp"
          : "png";

      a.download = `design-${activeIndex + 1}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Download failed. Try again.");
    }
  }

  const surfaceBg =
    mode === "dark"
      ? "linear-gradient(180deg, rgba(20,24,33,0.92), rgba(12,14,20,0.92))"
      : "linear-gradient(180deg, rgba(30,34,44,0.88), rgba(18,20,28,0.88))";

  const stageBg =
    mode === "dark"
      ? "linear-gradient(180deg, rgba(10,12,18,0.65), rgba(8,10,14,0.65))"
      : "linear-gradient(180deg, rgba(22,26,36,0.55), rgba(16,18,26,0.55))";

  const chipBase: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.88)",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.6,
    cursor: "pointer",
    userSelect: "none",
  };

  const chipActive: React.CSSProperties = {
    ...chipBase,
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.22)",
  };

  return (
    <section
      style={{
        borderRadius: 18,
        padding: 14,
        background: surfaceBg,
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        minHeight: 520,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "6px 6px 12px 6px",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            onClick={() => setMode("dark")}
            style={mode === "dark" ? chipActive : chipBase}
            role="button"
            aria-label="Dark surface"
            title="Dark"
          >
            DARK
          </div>
          <div
            onClick={() => setMode("grey")}
            style={mode === "grey" ? chipActive : chipBase}
            role="button"
            aria-label="Grey surface"
            title="Grey"
          >
            GREY
          </div>

          <button
            onClick={() => downloadOne(activeSrc)}
            disabled={!hasImages || loading}
            style={{
              ...chipBase,
              cursor: !hasImages || loading ? "not-allowed" : "pointer",
              opacity: !hasImages || loading ? 0.45 : 1,
            }}
            aria-label="Download"
            title={!hasImages ? "Generate first" : "Download selected"}
          >
            DOWNLOAD
          </button>
        </div>
      </div>

      {/* Stage */}
      <div
        style={{
          borderRadius: 18,
          padding: 14,
          background: stageBg,
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.35)",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          minHeight: 420,
        }}
      >
        {/* subtle grid */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
            opacity: mode === "dark" ? 0.18 : 0.14,
            pointerEvents: "none",
          }}
        />

        {/* content */}
        {!hasImages && !loading && (
          <div
            style={{
              textAlign: "center",
              maxWidth: 360,
              padding: "18px 14px",
              borderRadius: 14,
              background: "rgba(0,0,0,0.18)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.86)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 0.3 }}>
              Your design will appear here
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              Upload inputs on the left, then click <b>Generate</b> to preview.
            </div>
          </div>
        )}

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "18px 14px",
              borderRadius: 14,
              background: "rgba(0,0,0,0.18)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.86)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 0.6 }}>
              GENERATING…
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "rgba(255,255,255,0.62)",
              }}
            >
              Cooking variations. Hang tight.
            </div>
          </div>
        )}

        {hasImages && !loading && (
          <img
            src={activeSrc}
            alt={`Result ${activeIndex + 1}`}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 14,
              boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.12)",
            }}
            onError={(e) => {
              console.error("Image failed to load:", activeSrc);
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </div>

      {/* Thumbnails */}
      <div style={{ marginTop: 12 }}>
        {hasImages ? (
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                style={{
                  borderRadius: 12,
                  padding: 0,
                  border:
                    i === activeIndex
                      ? "2px solid rgba(255,255,255,0.55)"
                      : "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  flex: "0 0 auto",
                  width: 74,
                  height: 54,
                  overflow: "hidden",
                  boxShadow:
                    i === activeIndex ? "0 10px 30px rgba(0,0,0,0.35)" : "none",
                }}
                aria-label={`Select result ${i + 1}`}
                title={`Result ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`Thumb ${i + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: i === activeIndex ? 1 : 0.85,
                  }}
                />
              </button>
            ))}
          </div>
        ) : (
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.45)",
              padding: "6px 4px",
            }}
          >
            Tip: Generate 2–4 variations to compare quickly.
          </div>
        )}
      </div>
    </section>
  );
}