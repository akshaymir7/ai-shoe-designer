"use client";

import React, { useMemo, useState } from "react";

type Props = {
  title?: string;
  loading: boolean;
  error?: string;
  images: string[];              // expects data URLs OR remote URLs
  onDownload?: (url: string) => void;

  // refine
  refineValue: string;
  onRefineChange: (v: string) => void;
  onRegenerateWithRefine: () => void;
  canRegenerate: boolean;
};

export default function ResultPanel({
  title = "Result",
  loading,
  error,
  images,
  onDownload,
  refineValue,
  onRefineChange,
  onRegenerateWithRefine,
  canRegenerate,
}: Props) {
  const [active, setActive] = useState(0);

  const hasImages = images && images.length > 0;
  const activeUrl = hasImages ? images[Math.min(active, images.length - 1)] : "";

  const statusText = useMemo(() => {
    if (loading) return "Generating…";
    if (error) return "Something went wrong.";
    if (!hasImages) return "No result yet";
    return "Generated footwear design";
  }, [loading, error, hasImages]);

  return (
    <section className="panel resultPanel">
      <div className="panelHead">
        <div className="panelTitle">{title}</div>

        <div className="panelActions">
          {hasImages && (
            <button
              className="btn btnGhost"
              onClick={() => onDownload?.(activeUrl)}
              type="button"
            >
              Download
            </button>
          )}
        </div>
      </div>

      <div className="resultBody">
        {/* STATUS */}
        <div className="resultStatus">
          <span className="dot" />
          <span>{statusText}</span>
        </div>

        {/* ERROR */}
        {error && <div className="errorBox">{error}</div>}

        {/* IMAGE */}
        <div className="resultFrame">
          {loading ? (
            <div className="skeletonFrame" />
          ) : hasImages ? (
            // eslint-disable-next-line @next/next/no-img-element
            < img className="resultImg" src={activeUrl} alt="Generated result" />
          ) : (
            <div className="resultEmpty">No result yet</div>
          )}
        </div>

        {/* THUMB STRIP */}
        {hasImages && images.length > 1 && (
          <div className="thumbRow">
            {images.map((u, i) => (
              <button
                key={i}
                className={`thumbBtn ${i === active ? "isActive" : ""}`}
                onClick={() => setActive(i)}
                type="button"
                title={`Variation ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                < img className="thumbImg" src={u} alt={`Variation ${i + 1}`} />
              </button>
            ))}
          </div>
        )}

        {/* REFINE */}
        <div className="refineBlock">
          <div className="refineTitle">Refine this design</div>
          <textarea
            className="textarea"
            rows={4}
            placeholder="Change heel height, soften toe shape, adjust buckle placement…"
            value={refineValue}
            onChange={(e) => onRefineChange(e.target.value)}
          />
          <div className="refineFooter">
            <div className="mutedSmall">Tip: keep refinements short + specific.</div>
            <button
              className="btn"
              disabled={!canRegenerate}
              onClick={onRegenerateWithRefine}
              type="button"
            >
              Regenerate with refinements
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}