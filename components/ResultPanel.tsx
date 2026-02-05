'use client';

import React, { useEffect, useMemo, useState } from 'react';

export type ResultPanelProps = {
  title: string;
  loading: boolean;
  images: string[];
  emptyText?: string;
  stageHeight?: number; // px (e.g. 480)
};

export default function ResultPanel({
  title,
  loading,
  images,
  emptyText = 'No result yet',
  stageHeight = 480,
}: ResultPanelProps) {
  const hasImages = images && images.length > 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const [active, setActive] = useState<string | null>(null);

  const [bg, setBg] = useState<'white' | 'gray'>('white');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // keep active in sync with images
  useEffect(() => {
    if (!hasImages) {
      setActiveIndex(0);
      setActive(null);
      setIsZoomOpen(false);
      setShowHint(true);
      return;
    }
    const safeIndex = Math.min(activeIndex, images.length - 1);
    setActiveIndex(safeIndex);
    setActive(images[safeIndex]);
  }, [hasImages, images]); // eslint-disable-line react-hooks/exhaustive-deps

  // hide hint after first click OR after first zoom
  useEffect(() => {
    if (isZoomOpen) setShowHint(false);
  }, [isZoomOpen]);

  const counterText = useMemo(() => {
    if (!hasImages) return '';
    return `${activeIndex + 1}/${images.length}`;
  }, [activeIndex, hasImages, images.length]);

  const openZoom = () => {
    if (!active) return;
    setIsZoomOpen(true);
    setShowHint(false);
  };

  const closeZoom = () => setIsZoomOpen(false);

  const downloadActive = async () => {
    if (!active) return;

    try {
      const res = await fetch(active, { mode: 'cors' });
      const blob = await res.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `shoe-result-${activeIndex + 1}-${ts}.png`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Download failed. Try opening the image in a new tab and saving it.');
    }
  };

  return (
    <div className="panel rp">
      <div className="panelHeader rp_head">
        <div className="rp_titleRow">
          <div className="rp_title">{title}</div>
          <div className="rp_meta">
            {hasImages && <div className="rp_counter">{counterText}</div>}

            <div className="rp_toggle">
              <button
                type="button"
                className={`rp_toggleBtn ${bg === 'white' ? 'isActive' : ''}`}
                onClick={() => setBg('white')}
                disabled={loading}
              >
                White
              </button>
              <button
                type="button"
                className={`rp_toggleBtn ${bg === 'gray' ? 'isActive' : ''}`}
                onClick={() => setBg('gray')}
                disabled={loading}
              >
                Gray
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="panelBody rp_body">
        {loading && <div className="rp_empty muted">Generating…</div>}

        {!loading && !hasImages && <div className="rp_empty muted">{emptyText}</div>}

        {!loading && hasImages && (
          <>
            {/* STAGE */}
            <div
              className={`rp_stage ${bg === 'white' ? 'rp_bgWhite' : 'rp_bgGray'}`}
              style={{ height: stageHeight }}
              onClick={openZoom}
              role="button"
              tabIndex={0}
            >
              {active && (
                // eslint-disable-next-line @next/next/no-img-element
                < img className="rp_stageImg" src={active} alt="Result" />
              )}

              {showHint && (
                <div className="rp_hint">
                  Click image to zoom
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="rp_actions">
              <button type="button" className="rp_btn" onClick={downloadActive}>
                Download
              </button>
            </div>

            {/* THUMBS */}
            <div className="rp_thumbs">
              {images.map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  className={`rp_thumbBtn ${i === activeIndex ? 'isActive' : ''}`}
                  onClick={() => {
                    setActiveIndex(i);
                    setActive(url);
                  }}
                  aria-label={`Select result ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  < img className="rp_thumbImg" src={url} alt={`Result ${i + 1}`} />
                </button>
              ))}
            </div>

            {/* ZOOM MODAL */}
            {isZoomOpen && active && (
              <div className="rp_modal" onClick={closeZoom} role="button" tabIndex={0}>
                <div className="rp_modalInner" onClick={(e) => e.stopPropagation()}>
                  <button className="rp_close" onClick={closeZoom} type="button">
                    Close
                  </button>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  < img className="rp_full" src={active} alt="Preview" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}