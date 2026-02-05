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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (images.length > 0) setActive(images[0]);
    else setActive(undefined);
  }, [images]);

  // ESC to close modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="panel rp">
      <div className="panelHeader rp_head">
        <div className="rp_title">{title}</div>

        {/* Right-side actions */}
        <div className="rp_actions">
          {active ? (
            <a
              className="rp_download"
              href= "_blank"
              rel="noreferrer"
              title="Download (or open in new tab)"
            >
              Download
            </a >
          ) : (
            <span className="rp_download rp_download--disabled">Download</span>
          )}
        </div>
      </div>

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
            <button
              type="button"
              className="rp_stage rp_stage--grey rp_fit--contain"
              onClick={() => setOpen(true)}
              title="Click to view large"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              < img className="rp_stageImg" src={active} alt="Generated result" />
            </button>

            {/* Thumbs */}
            <div className="rp_thumbs">
              {images.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  className={`rp_thumbBtn ${url === active ? 'isActive' : ''}`}
                  onClick={() => setActive(url)}
                  title={`Result ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  < img className="rp_thumbImg" src={url} alt={`Result ${i + 1}`} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {open && active && (
        <div className="rp_modal" onClick={() => setOpen(false)} role="presentation">
          <div className="rp_modalInner" onClick={(e) => e.stopPropagation()}>
            <div className="rp_modalTop">
              <a className="rp_download" href={active} download target="_blank" rel="noreferrer">
                Download
              </a >
              <button className="rp_close" type="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            < img className="rp_full" src={active} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
}