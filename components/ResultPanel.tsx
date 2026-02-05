'use client';

import React, { useEffect, useMemo, useState } from 'react';

type ResultPanelProps = {
  title?: string;
  loading?: boolean;
  images?: string[];
  emptyText?: string;
};

export default function ResultPanel({
  title = 'Result',
  loading = false,
  images = [],
  emptyText = 'No result yet',
}: ResultPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // keep index valid when images change
  useEffect(() => {
    setActiveIndex(0);
  }, [images.length]);

  const activeImage = useMemo(() => images[activeIndex] ?? '', [images, activeIndex]);
  const canDownload = !!activeImage && !loading;

  function downloadActive() {
    if (!canDownload) return;

    const a = document.createElement('a');
    a.href = activeImage;
    a.download = `ai-shoe-${activeIndex + 1}.png`;
    a.target = '_blank';
    a.rel = 'noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="panel rp">
      {/* Header */}
      <div className="panelHeader rp_head">
        <div className="rp_title">{title}</div>

        <button
          type="button"
          className={`rp_btn ${canDownload ? '' : 'isDisabled'}`}
          onClick={downloadActive}
          disabled={!canDownload}
        >
          Download
        </button>
      </div>

      {/* Body */}
      <div className="panelBody rp_body">
        {loading && <div className="rp_empty">Generating…</div>}

        {!loading && images.length === 0 && <div className="rp_empty">{emptyText}</div>}

        {!loading && images.length > 0 && (
          <>
            <div className="rp_view">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              < img className="rp_img" src={activeImage} alt="Generated result" />
            </div>

            {images.length > 1 && (
              <div className="rp_thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`rp_thumb ${i === activeIndex ? 'isActive' : ''}`}
                    onClick={() => setActiveIndex(i)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    < img className="rp_thumbImg" src={img} alt={`Result ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}