'use client';

import React, { useEffect, useState } from 'react';

type ResultPanelProps = {
  title: string;
  images: string[];
  loading?: boolean;
};

export default function ResultPanel({
  title,
  images,
  loading = false,
}: ResultPanelProps) {
  const [active, setActive] = useState<string | null>(null);

  // Reset active image if results change
  useEffect(() => {
    setActive(null);
  }, [images]);

  return (
    <div className="panel rp">
      {/* Header */}
      <div className="panelHeader rp_head">
        <div className="rp_title">{title}</div>
      </div>

      {/* Body */}
      <div className="panelBody rp_body">
        {loading && <div className="rp_empty">Generating…</div>}

        {!loading && images.length === 0 && (
          <div className="rp_empty">No result yet</div>
        )}

        {!loading && images.length > 0 && (
          <>
            {/* Stage */}
            <div className="rp_stage">
              <img
                src={active ?? images[0]}
                alt="Result preview"
                className="rp_stageImg"
                onClick={() => setActive(active ?? images[0])}
              />
            </div>

            {/* Thumbnails */}
            <div className="rp_thumbs">
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Result ${i + 1}`}
                  className={`rp_thumb ${
                    (active ?? images[0]) === url ? 'active' : ''
                  }`}
                  onClick={() => setActive(url)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="rp_actions">
              <button
                type="button"
                className="rp_download"
                onClick={() => {
                  const url = active ?? images[0];
                  if (!url) return;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                Download
              </button>
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Modal */}
      {active && (
        <div className="rp_modal" onClick={() => setActive(null)}>
          <div
            className="rp_modalInner"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="rp_close"
              onClick={() => setActive(null)}
              type="button"
            >
              Close
            </button>

            <img
              src={active}
              alt="Full preview"
              className="rp_full"
            />

            <button
              type="button"
              className="rp_download rp_download_modal"
              onClick={() =>
                window.open(active, '_blank', 'noopener,noreferrer')
              }
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}