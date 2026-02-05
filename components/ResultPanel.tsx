"use client";

import React, { useEffect, useMemo, useState } from "react";

type ResultPanelProps = {
  title: string;
  loading: boolean;
  images: string[]; // expects absolute URLs OR data: URLs OR blob: URLs
};

function safeFilename(name: string) {
  return name.replace(/[^\w.-]+/g, "_");
}

async function downloadImage(url: string, filename: string) {
  // If it's already a data/blob URL, anchor download usually works directly
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  // Otherwise fetch and convert to blob (handles CORS only if server allows it)
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

  // cleanup
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

export default function ResultPanel({ title, loading, images }: ResultPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [bg, setBg] = useState<"white" | "grey">("white");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // reset when new results come
    setActiveIndex(0);
    setImgError(false);
  }, [images?.length]);

  const activeSrc = useMemo(() => images?.[activeIndex] || "", [images, activeIndex]);

  const stageClass = bg === "white" ? "rp_stage rp_bgWhite" : "rp_stage rp_bgGrey";

  const handleOpen = () => {
    if (!activeSrc) return;
    window.open(activeSrc, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async () => {
    if (!activeSrc) return;

    const filename = safeFilename(`ai-shoe-result-${activeIndex + 1}.png`);

    try {
      await downloadImage(activeSrc, filename);
    } catch (e) {
      console.error(e);
      alert("Download failed. Try smaller images (<10MB) or open image and save manually.");
    }
  };

  return (
    <div className="rp_panel">
      <div className="rp_header">
        <div className="rp_title">{title}</div>

        <div className="rp_actions">
          <button
            type="button"
            className={`rp_btn ${bg === "white" ? "rp_btnActive" : ""}`}
            onClick={() => setBg("white")}
            disabled={loading}
          >
            White
          </button>
          <button
            type="button"
            className={`rp_btn ${bg === "grey" ? "rp_btnActive" : ""}`}
            onClick={() => setBg("grey")}
            disabled={loading}
          >
            Grey
          </button>

          <button
            type="button"
            className="rp_btn rp_btnPrimary"
            onClick={handleDownload}
            disabled={loading || !activeSrc}
            title={!activeSrc ? "No image to download" : "Download active image"}
          >
            Download
          </button>
        </div>
      </div>

      <div className={stageClass}>
        {loading ? (
          <div className="rp_loading">
            <div className="rp_spinner" />
            <div className="rp_loadingText">Generating…</div>
          </div>
        ) : !activeSrc ? (
          <div className="rp_empty">No results yet</div>
        ) : (
          <button type="button" className="rp_stageBtn" onClick={handleOpen} title="Click to open full size">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeSrc}
              alt="Result"
              className={`rp_img ${imgError ? "rp_imgHidden" : ""}`}
              onError={() => setImgError(true)}
            />
            {imgError && <div className="rp_error">Image failed to load (bad URL or blocked).</div>}
          </button>
        )}
      </div>

      {!loading && images?.length > 0 && (
        <div className="rp_thumbs">
          {images.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              className={`rp_thumb ${idx === activeIndex ? "rp_thumbActive" : ""}`}
              onClick={() => {
                setActiveIndex(idx);
                setImgError(false);
              }}
              title={`thumb-${idx}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              < img src={src} alt={`thumb-${idx}`} className="rp_thumbImg" onError={() => {}} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}