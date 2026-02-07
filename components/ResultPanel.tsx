"use client";

import React, { useMemo } from "react";

type ResultPanelProps = {
  title?: string;           // keep compatible
  loading: boolean;
  images: string[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  onDownload?: () => void;
  mode?: "dark" | "grey";
  onModeChange?: (m: "dark" | "grey") => void;
};

export default function ResultPanel({
  title = "Preview",
  loading,
  images,
  selectedIndex = 0,
  onSelect,
  onDownload,
  mode = "dark",
  onModeChange,
}: ResultPanelProps) {
  const hasImages = images && images.length > 0;

  const tip = useMemo(() => {
    if (loading) return "Exploring variations based on your inputs.";
    if (!hasImages) return "Tip: Generate 2–4 variations to compare design directions.";
    return "Tip: Click a variation to select it, then download.";
  }, [loading, hasImages]);

  return (
    <div className="panel">
      <div className="panelHeader">
        <div className="panelTitle">{title}</div>

        <div className="panelActions">
          {onModeChange && (
            <>
              <button
                type="button"
                className={`chip ${mode === "dark" ? "chipActive" : ""}`}
                onClick={() => onModeChange("dark")}
              >
                Dark
              </button>
              <button
                type="button"
                className={`chip ${mode === "grey" ? "chipActive" : ""}`}
                onClick={() => onModeChange("grey")}
              >
                Grey
              </button>
            </>
          )}

          {onDownload && (
            <button
              type="button"
              className="btnPrimary"
              onClick={onDownload}
              disabled={!hasImages}
              title={!hasImages ? "Generate designs first" : "Download selected"}
            >
              Download
            </button>
          )}
        </div>
      </div>

      <div className={`resultStage ${mode}`}>
        {!hasImages && !loading && (
          <div className="resultEmpty">
            <div className="resultEmptyTitle">Your design preview will appear here</div>
            <div className="resultEmptySub">
              Upload references and generate to explore variations.
            </div>
          </div>
        )}

        {loading && (
          <div className="resultEmpty">
            <div className="resultEmptyTitle">Generating designs…</div>
            <div className="resultEmptySub">Exploring variations based on your inputs.</div>
          </div>
        )}

        {hasImages && (
          <div className="resultGrid">
            {images.map((src, i) => {
              const active = i === selectedIndex;
              return (
                <button
                  key={src + i}
                  type="button"
                  className={`resultThumb ${active ? "resultThumbActive" : ""}`}
                  onClick={() => onSelect?.(i)}
                  aria-label={`Select variation ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  < img src={src} alt={`Variation ${i + 1}`} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="panelTip">{tip}</div>
    </div>
  );
}