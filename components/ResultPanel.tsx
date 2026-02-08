"use client";

import React, { useMemo } from "react";

type BgMode = "dark" | "grey";

type Props = {
  title: string;
  images: string[];
  loading: boolean;

  selectedIndex: number;
  onSelect: (index: number) => void;

  bgMode: BgMode;
  onBgChange: (mode: BgMode) => void;

  onDownload: () => void;
};

export default function ResultPanel({
  title,
  images,
  loading,
  selectedIndex,
  onSelect,
  bgMode,
  onBgChange,
  onDownload,
}: Props) {
  const hasImages = Boolean(images && images.length > 0);

  const selectedImage = useMemo(() => {
    if (!hasImages) return "";
    return images[Math.min(selectedIndex, images.length - 1)] || "";
  }, [hasImages, images, selectedIndex]);

  return (
    <div
      className="panel"
      style={{
        minHeight: 560,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="panelHeader"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            className={`pill ${bgMode === "dark" ? "active" : ""}`}
            onClick={() => onBgChange("dark")}
            type="button"
          >
            DARK
          </button>

          <button
            className={`pill ${bgMode === "grey" ? "active" : ""}`}
            onClick={() => onBgChange("grey")}
            type="button"
          >
            GREY
          </button>

          <button
            className="pill"
            onClick={onDownload}
            disabled={!hasImages}
            type="button"
          >
            DOWNLOAD
          </button>
        </div>
      </div>

      {/* Preview frame */}
      <div
        className="resultFrame"
        style={{
          flex: 1,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.14)",
          background:
            bgMode === "grey"
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.20)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          marginTop: 12,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              opacity: 0.85,
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "0.02em" }}>
              Generating…
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Hold tight. Variations will load below.
            </div>
          </div>
        ) : !hasImages ? (
          <div
            style={{
              textAlign: "center",
              opacity: 0.8,
              maxWidth: 520,
              lineHeight: 1.65,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: "0.01em",
                marginBottom: 6,
              }}
            >
              Your design preview will appear here
            </div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              Upload references on the left, then click Generate.
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                opacity: 0.7,
                fontWeight: 650,
              }}
            >
              Tip: Generate 2–4 variations to compare design directions.
            </div>
          </div>
        ) : (
          <img
            src={selectedImage}
            alt={`Result ${selectedIndex + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: 12,
            }}
          />
        )}
      </div>

      {/* Thumbnails */}
      {hasImages ? (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 6,
          }}
        >
          {images.map((src, idx) => {
            const active = idx === selectedIndex;
            return (
              <button
                key={src + idx}
                onClick={() => onSelect(idx)}
                className="thumbBtn"
                type="button"
                style={{
                  borderRadius: 14,
                  border: active
                    ? "1px solid rgba(255,255,255,0.55)"
                    : "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(255,255,255,0.05)",
                  padding: 8,
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: active
                    ? "0 0 0 2px rgba(255,255,255,0.18), 0 0 18px rgba(120,180,255,0.22)"
                    : "none",
                  transition: "all 160ms ease",
                }}
                aria-label={`Select variation ${idx + 1}`}
              >
                <img
                  src={src}
                  alt={`Thumb ${idx + 1}`}
                  style={{
                    width: 88,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 10,
                    display: "block",
                    opacity: active ? 1 : 0.88,
                  }}
                />

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    opacity: active ? 0.92 : 0.65,
                    textAlign: "center",
                  }}
                >
                  V{idx + 1}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}