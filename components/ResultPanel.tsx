'use client';

import React, { useEffect, useState } from 'react';

type ResultPanelProps = {
  title: string;
  images: string[];
  loading: boolean;
};

export default function ResultPanel({
  title,
  images,
  loading,
}: ResultPanelProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!images.length) {
      setActive(null);
    }
  }, [images.length]);

  return (
    <div className="panel rp">
      {/* HEADER */}
      <div className="panelHeader rp_head">
        <div className="rp_title">{title}</div>
      </div>

      {/* BODY */}
      <div className="panelBody rp_body">
        {loading && <div className="muted">Generating…</div>}

        {!loading && images.length === 0 && (
          <div className="muted">No result yet</div>
        )}

        {!loading && images.length > 0 && (
          <div className="rp_grid">
            {images.map((url, i) => (
              <button
                key={i}
                className="rp_thumbWrap"
                onClick={() => setActive(url)}
                type="button"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="rp_thumb"
                  src={url}
                  alt={`Result ${i + 1}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {active && (
        <div className="rp_overlay" onClick={() => setActive(null)}>
          <div
            className="rp_modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rp_modalHeader">
              <button
                className="rp_close"
                onClick={() => setActive(null)}
                type="button"
              >
                Close
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="rp_full"
              src={active}
              alt="Preview"
            />

            <a
              className="rp_download"
              href= "_blank"
              rel="noreferrer"
            >
              Download
            </a >
          </div>
        </div>
      )}
    </div>
  );
}