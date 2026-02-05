'use client';

import React, { useState } from 'react';

type ResultPanelProps = {
  title: string;
  loading: boolean;
  images: string[];
};

export default function ResultPanel({ title, loading, images }: ResultPanelProps) {
  const [active, setActive] = useState<string | null>(null);
  const [bg, setBg] = useState<'white' | 'gray'>('white');

  return (
    <div className="panel">
      <div className="panelHeader">
        <span>{title}</span>

        <button
          className="ghostBtn"
          onClick={() => setBg(bg === 'white' ? 'gray' : 'white')}
        >
          BG: {bg === 'white' ? 'White' : 'Grey'}
        </button>
      </div>

      <div className="panelBody">
        {loading && <div className="empty">Generating…</div>}

        {!loading && images.length === 0 && (
          <div className="empty">No results yet</div>
        )}

        {!loading && images.length > 0 && (
          <>
            {/* MAIN STAGE */}
            <div
              className="stage"
              style={{ background: bg === 'white' ? '#fff' : '#e5e7eb' }}
            >
              <img
                src={active ?? images[0]}
                alt="Generated shoe"
                onClick={() => setActive(active ?? images[0])}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* THUMBNAILS */}
            <div className="thumbs">
              {images.map((src, i) => (
                <button
                  key={i}
                  className={`thumb ${active === src ? 'active' : ''}`}
                  onClick={() => setActive(src)}
                >
                  <img
                    src={src}
                    alt={`thumb-${i}`}
                    onError={(e) => {
                      e.currentTarget.style.opacity = '0.3';
                    }}
                  />
                </button>
              ))}
            </div>

            {/* DOWNLOAD */}
            <div className="downloadRow">
              <a
                href= "_blank"
                rel="noopener noreferrer"
                className="downloadBtn"
              >
                Download
              </a >
            </div>
          </>
        )}
      </div>
    </div>
  );
}