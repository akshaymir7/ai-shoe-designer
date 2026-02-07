"use client";

import React from "react";

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
  const hasImages = images && images.length > 0;

  return (
    <>
      <div className="panelHeader">{title}</div>

      <div className={`resultBody ${bgMode}`}>
        {!hasImages && !loading && (
          <div className="emptyState">
            Your design preview will appear here
            <div className="hint">
              Upload references on the left, then click Generate.
            </div>
          </div>
        )}

        {loading && (
          <div className="loadingState">
            Generating…
            <div className="hint">Hold tight. Variations will load below.</div>
          </div>
        )}

        {hasImages && (
          <>
            <div className="mainImageWrap">
              <img
                src={images[selectedIndex]}
                alt={`Design ${selectedIndex + 1}`}
                className="mainImage"
              />
            </div>

            <div className="thumbRow">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`thumb ${i === selectedIndex ? "active" : ""}`}
                  onClick={() => onSelect(i)}
                >
                  < img src={img} alt={`Thumb ${i + 1}`} />
                </button>
              ))}
            </div>

            <div className="resultActions">
              <div className="bgToggle">
                <button
                  className={bgMode === "dark" ? "active" : ""}
                  onClick={() => onBgChange("dark")}
                >
                  DARK
                </button>
                <button
                  className={bgMode === "grey" ? "active" : ""}
                  onClick={() => onBgChange("grey")}
                >
                  GREY
                </button>
              </div>

              <button className="btnPrimary" onClick={onDownload}>
                Download
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}