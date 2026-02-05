'use client';

import React, { useEffect, useState } from 'react';

export type ResultPanelProps = {
  title: string;
  loading: boolean;
  images: string[];
  emptyText?: string;
};

export default function ResultPanel({
  title,
  loading,
  images,
  emptyText = 'No result yet',
}: ResultPanelProps) {
  const [active, setActive] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (images.length > 0) {
      setActive(images[0]);
    } else {
      setActive(undefined);
    }
  }, [images]);

  return (
    <div className="panel rp">
      {/* Header */}
      <div className="panelHeader rp_head">
        <div className="rp_title">{title}</div>
      </div>

      {/* Body */}
      <div className="panelBody rp_body">
        {loading && (
          <div className="rp_empty">
            <div className="rp_emptyTitle">Generating…</div>
            <div className="rp_emptySub">Please wait</div>
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="rp_empty">
            <div className="rp_emptyTitle">{emptyText}</div>
            <div className="rp_emptySub">Generated images will appear here</div>
          </div>
        )}

        {!loading && images.length > 0 && active && (
          <>
            {/* Stage */}
            <div className="rp_stage rp_stage--grey rp_fit--contain">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="rp_stageImg"
                src={active}
                alt="Generated result"
              />
            </div>

            {/* Thumbnails */}
            <div className="rp_thumbs">
              {images.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  className={`rp_thumbBtn ${url === active ? 'isActive' : ''}`}
                  onClick={() => setActive(url)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="rp_thumbImg"
                    src={url}
                    alt={`Result ${i + 1}`}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}