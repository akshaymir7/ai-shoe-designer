'use client';

import React, { useEffect, useMemo, useState } from 'react';

export type ResultPanelProps = {
  title?: string;
  loading: boolean;
  images: string[];
  emptyText?: string; // (optional) text shown when no results
};

export default function ResultPanel({
  title = 'Result',
  loading,
  images,
  emptyText = 'No result yet',
}: ResultPanelProps) {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (images?.length) setActive(images[0]);
    else setActive(null);
  }, [images]);

  const hasImages = (images?.length ?? 0) > 0;

  const activeIndex = useMemo(() => {
    if (!active) return -1;
    return images.indexOf(active);
  }, [active, images]);

  async function downloadActive() {
    if (!active) return;
    try {
      const res = await fetch(active, { mode: 'cors' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `shoe-design-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (e) {
      // fallback: open in new tab (works even if CORS blocks fetch)
      window.open(active, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="panel rp">
      <div className="panelHeader rp_head">
        <div className="rp_title">{title}</div>

        {hasImages && (
          <div className="rp_actions">
            <button
              type="button"
              className="btn btnGhost"
              onClick={() => setOpen(true)}
              title="Open preview"
            >
              Preview
            </button>
            <button
              type="button"
              className="btn"
              onClick={downloadActive}
              title="Download current"
            >
              Download
            </button>
          </div>
        )}
      </div>

      <div className="panelBody rp_body">
        {loading && (
          <div className="rp_state">
            <div className="spinner" />
            <div className="muted">Generating images…</div>
          </div>
        )}

        {!loading && !hasImages && (
          <div className="rp_state">
            <div className="muted">{emptyText}</div>
          </div>
        )}

        {!loading && hasImages && (
          <>
            <button
              type="button"
              className="rp_stage"
              onClick={() => setOpen(true)}
              title="Click to preview"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              < img className="rp_stageImg" src={active ?? images[0]} alt="Result" />
            </button>

            {images.length > 1 && (
              <div className="rp_strip">
                {images.map((src, i) => (
                  <button
                    type="button"
                    key={src + i}
                    className={'rp_thumbBtn ' + (src === active ? 'isActive' : '')}
                    onClick={() => setActive(src)}
                    title={`Result ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    < img className="rp_thumb" src={src} alt={`thumb ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {open && active && (
        <div className="rp_modal" role="dialog" aria-modal="true">
          <div className="rp_modalTop">
            <div className="rp_modalTitle">
              Preview {activeIndex >= 0 ? `(${activeIndex + 1}/${images.length})` : ''}
            </div>
            <div className="rp_modalActions">
              <button type="button" className="btn btnGhost" onClick={downloadActive}>
                Download
              </button>
              <button type="button" className="btn" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>

          <div className="rp_modalBody" onClick={() => setOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            < img className="rp_full" src={active} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
}