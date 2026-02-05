"use client";

import React, { useEffect, useMemo, useState } from "react";

type ResultPanelProps = {
  title: string;
  loading: boolean;
  images: string[];
};

function safeFilename(name: string) {
  return name.replace(/[^\w.-]+/g, "_");
}

async function downloadImage(url: string, filename: string) {
  // data/blob can be downloaded directly
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

export default function ResultPanel({ title, loading, images }: ResultPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [bg, setBg] = useState<"dark" | "mid">("dark");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setImgError(false);
  }, [images?.length]);

  const activeSrc = useMemo(() => images?.[activeIndex] || "", [images, activeIndex]);

  const stageClass =
    bg === "dark" ? "rp_stage rp_stageDark" : "rp_stage rp_stageMid";

  const handleOpen = () => {
    if (!activeSrc) return;
    window.open(activeSrc, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async () => {
    if (!activeSrc) return;
    try {
      await downloadImage(activeSrc, safeFilename(`ai-shoe-${activeIndex + 1}.png`));
    } catch (e) {
      console.error(e);
      alert("Download failed (URL blocked). Open image and save manually.");
    }
  };

  return (
    <div className="rp_shell">
      {/* Header */}
      <div className="rp_top">
        <div className="rp_title">{title}</div>

        <div className="rp_controls">
          <div className="rp_seg">
            <button
              type="button"
              className={`rp_segBtn ${bg === "dark" ? "isActive" : ""}`}
              onClick={() => setBg("dark")}
              disabled={loading}
              title="Dark stage"
            >
              Dark
            </button>
            <button
              type="button"
              className={`rp_segBtn ${bg === "mid" ? "isActive" : ""}`}
              onClick={() => setBg("mid")}
              disabled={loading}
              title="Mid-grey stage"
            >
              Grey
            </button>
          </div>

          <button
            type="button"
            className="rp_primaryBtn"
            onClick={handleDownload}
            disabled={loading || !activeSrc}
          >
            Download
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className={stageClass}>
        {loading ? (
          <div className="rp_center">
            <div className="rp_loader" />
            <div className="rp_centerText">Generating…</div>
          </div>
        ) : !activeSrc ? (
          <div className="rp_center">
            <div className="rp_centerText">No results yet</div>
          </div>
        ) : (
          <button type="button" className="rp_stageBtn" onClick={handleOpen} title="Click to open full size">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeSrc}
              alt="Result"
              className={`rp_img ${imgError ? "rp_hidden" : ""}`}
              onError={() => setImgError(true)}
            />
            {imgError && <div className="rp_error">Image failed to load.</div>}
            <div className="rp_hint">Click to zoom</div>
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {!loading && images?.length > 0 && (
        <div className="rp_thumbs">
          {images.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              className={`rp_thumb ${idx === activeIndex ? "isActive" : ""}`}
              onClick={() => {
                setActiveIndex(idx);
                setImgError(false);
              }}
              title={`Result ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              < img className="rp_thumbImg" src={src} alt={`thumb-${idx}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}