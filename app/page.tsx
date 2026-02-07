// components/ResultPanel.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  title: string;
  images: string[];
  loading: boolean;
};

export default function ResultPanel({ title, images, loading }: Props) {
  const [bgMode, setBgMode] = useState<"dark" | "grey">("dark");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keep selection valid when images change
  useEffect(() => {
    if (!images?.length) {
      setSelectedIndex(0);
      return;
    }
    setSelectedIndex((prev) => Math.min(prev, images.length - 1));
  }, [images]);

  const hasImages = Boolean(images && images.length > 0);

  const selectedImage = useMemo(() => {
    if (!hasImages) return "";
    return images[selectedIndex] ?? images[0] ?? "";
  }, [hasImages, images, selectedIndex]);

  const surfaceClass =
    bgMode === "dark" ? "resultSurface resultSurfaceDark" : "resultSurface resultSurfaceGrey";

  const handleDownload = async () => {
    if (!selectedImage) return;
    try {
      const res = await fetch(selectedImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `design-${selectedIndex + 1}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (e) {
      // fallback: open in new tab
      window.open(selectedImage, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="panelCard">
      <div className="panelHeader">
        <div className="panelTitle">{title}</div>

        <div className="panelActions">
          <button
            type="button"
            className={`pillBtn ${bgMode === "dark" ? "pillActive" : ""}`}
            onClick={() => setBgMode("dark")}
          >
            DARK
          </button>
          <button
            type="button"
            className={`pillBtn ${bgMode === "grey" ? "pillActive" : ""}`}
            onClick={() => setBgMode("grey")}
          >
            GREY
          </button>
          <button
            type="button"
            className="pillBtn"
            onClick={handleDownload}
            disabled={!hasImages || loading}
            aria-disabled={!hasImages || loading}
          >
            DOWNLOAD
          </button>
        </div>
      </div>

      <div className="panelBody">
        <div className={surfaceClass}>
          {loading ? (
            <div className="resultEmpty">
              <div className="resultHeadline">Generating…</div>
              <div className="resultSub">Hold tight. Variations will load below.</div>
            </div>
          ) : hasImages ? (
            <div className="resultStage">
              <img
                src={selectedImage}
                alt={`Generated design ${selectedIndex + 1}`}
                className="resultImage"
                draggable={false}
              />
            </div>
          ) : (
            <div className="resultEmpty">
              <div className="resultHeadline">Your design preview will appear here</div>
              <div className="resultSub">
                Upload references on the left, then click Generate to explore variations.
              </div>
              <div className="resultTip">Tip: Generate 2–4 variations to compare design directions.</div>
            </div>
          )}
        </div>

        {/* Variations strip */}
        <div className="resultStrip">
          {hasImages &&
            images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                className={`thumb ${i === selectedIndex ? "thumbActive" : ""}`}
                onClick={() => setSelectedIndex(i)}
                title={`Variation ${i + 1}`}
              >
                < img src={src} alt={`Variation ${i + 1}`} className="thumbImg" draggable={false} />
                <span className="thumbLabel">{i + 1}</span>
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}