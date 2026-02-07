"use client";

import React, { useEffect, useMemo, useState } from "react";

type ThemeMode = "dark" | "grey";

export type ResultPanelProps = {
  title?: string;
  images: string[]; // URLs returned from your generate route
  loading: boolean;

  // optional: if your page passes these, it will use them
  onDownload?: (url: string) => void;

  // optional: if you already manage theme outside, you can ignore this
  initialMode?: ThemeMode;
};

export default function ResultPanel({
  title = "RESULT",
  images,
  loading,
  onDownload,
  initialMode = "dark",
}: ResultPanelProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [selected, setSelected] = useState<number>(0);

  // keep selected valid when new images arrive
  useEffect(() => {
    if (!images?.length) {
      setSelected(0);
      return;
    }
    setSelected((prev) => (prev >= images.length ? 0 : prev));
  }, [images]);

  const hasImages = Boolean(images && images.length > 0);

  const selectedUrl = useMemo(() => {
    if (!hasImages) return "";
    return images[selected] ?? images[0];
  }, [images, selected, hasImages]);

  const handleDownload = () => {
    if (!selectedUrl) return;
    if (onDownload) return onDownload(selectedUrl);

    // fallback: open image in new tab (browser download still works)
    window.open(selectedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      className={[
        "panel",
        "resultPanel",
        mode === "grey" ? "panelGrey" : "panelDark",
      ].join(" ")}
    >
      <header className="panelHeader">
        <div className="panelTitle">{title}</div>

        <div className="panelActions">
          <button
            type="button"
            className={["chip", mode === "dark" ? "chipActive" : ""].join(" ")}
            onClick={() => setMode("dark")}
          >
            DARK
          </button>
          <button
            type="button"
            className={["chip", mode === "grey" ? "chipActive" : ""].join(" ")}
            onClick={() => setMode("grey")}
          >
            GREY
          </button>
          <button
            type="button"
            className="chip chipPrimary"
            onClick={handleDownload}
            disabled={!hasImages}
            title={hasImages ? "Download selected" : "No image to download"}
          >
            DOWNLOAD
          </button>
        </div>
      </header>

      <div className="resultStage">
        <div className="resultFrame">
          {!hasImages && !loading && (
            <div className="resultEmpty">
              <div className="resultEmptyTitle">Your design will appear here</div>
              <div className="resultEmptySub">
                Upload inputs on the left, then click Generate to preview.
              </div>
            </div>
          )}

          {loading && (
            <div className="resultEmpty">
              <div className="resultEmptyTitle">Generating…</div>
              <div className="resultEmptySub">Hold tight. Variations will load below.</div>
            </div>
          )}

          {hasImages && !loading && (
            // Use plain img to avoid Next/Image domain config issues
            <img
              src={selectedUrl}
              alt={`Result ${selected + 1}`}
              className="resultImage"
              draggable={false}
            />
          )}
        </div>

        {/* Thumbnails / Variations */}
        {hasImages && (
          <div className="thumbStrip" aria-label="Variations">
            {images.map((url, idx) => {
              const isSelected = idx === selected;
              return (
                <button
                  key={`${url}-${idx}`}
                  type="button"
                  className={[
                    "thumb",
                    isSelected ? "thumbSelected" : "",
                  ].join(" ")}
                  onClick={() => setSelected(idx)}
                  aria-pressed={isSelected}
                  title={`Variation ${idx + 1}`}
                >
                  < img src={url} alt={`Thumb ${idx + 1}`} className="thumbImg" />
                  <span className="thumbIndex">{idx + 1}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="resultTip">
          Tip: Generate 2–4 variations to compare quickly.
        </div>
      </div>
    </section>
  );
}