'use client';

import React, { useState } from 'react';

export type ResultPanelProps = {
  title: string;
  loading: boolean;
  images: string[];

  emptyText?: string;
  stageHeight?: number;
  onSelect?: (url: string) => void;
};

export default function ResultPanel({
  title,
  loading,
  images,
  emptyText = 'No results yet',
  stageHeight = 480,
  onSelect,
}: ResultPanelProps) {
  const [active, setActive] = useState<string | null>(null);

  const handleSelect = (url: string) => {
    setActive(url);
    onSelect?.(url);
  };

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
          <div className="rp_empty">{emptyText}</div>
        )}

        {!loading && images.length > 0 && (
          <>
            {/* Main stage */}
            <div
              className="rp_stage"
              style={{ height: stageHeight }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active ?? images[0]}
                alt="Result"
                className="rp_stageImage"
                onClick={() => handleSelect(active ?? images[0])}
              />
            </div>

            {/* Actions */}
            <div className="rp_actions">
              <a
                href= "_blank"
                rel="noopener noreferrer"
                className="rp_download"
              >
                Download
              </a >
            </div>

            {/* Thumbnails */}
            <div className="rp_thumbs">
              {images.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  className={`rp_thumbBtn ${
                    (active ?? images[0]) === url ? 'active' : ''
                  }`}
                  onClick={() => handleSelect(url)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  < img src={url} alt={`thumb-${i}`} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}