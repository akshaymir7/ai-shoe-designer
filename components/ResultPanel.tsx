'use client';

import React, { useEffect, useMemo, useState } from 'react';

export type ResultPanelProps = {
  title: string;
  loading: boolean;
  images: string[];
  emptyText?: string;     // optional (safe even if page.tsx doesn't pass it)
  stageHeight?: number;   // default 480
};

export default function ResultPanel({
  title,
  loading,
  images,
  emptyText = 'No result yet',
  stageHeight = 480,
}: ResultPanelProps) {
  const [active, setActive] = useState<string | null>(null);
  const [bg, setBg] = useState<'white' | 'gray'>('white');

  // Zoom-on-click (no modal): toggle zoom + dynamic transform-origin for "pan"
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (images?.length) setActive(images[0]);
    else setActive(null);
    setZoomed(false);
  }, [images]);

  const canDownload = !!active;

  const fileName = useMemo(() => {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    return `shoe-result-${ts}.png`;
  }, []);

  async function handleDownload() {
    if (!active) return;

    try {
      const res = await fetch(active, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: open image in new tab if CORS blocks blob download
      window.open(active, '_blank', 'noopener,noreferrer');
      console.warn('Download fallback (open new tab). Error:', err);
    }
  }

  function onStageMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!zoomed) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }

  return (
    <div className="panel rp">
      <div className="panelHeader rp_head">
        <div className="rp_title">{title}</div>

        <div className="rp_tools">
          <button
            type="button"
            className="rp_toggle"
            onClick={() => setBg(bg === 'white' ? 'gray' : 'white')}
            title="Toggle background"
          >
            BG: {bg === 'white' ? 'White' : 'Gray'}
          </button>

          <button
            type="button"
            className="rp_download"
            onClick={handleDownload}
            disabled={!canDownload}
            title={canDownload ? 'Download active image' : 'No image to download'}
          >
            Download
          </button>
        </div>
      </div>

      <div className="panelBody rp_body">
        {loading ? (
          <div className="rp_empty">{'Generating…'}</div>
        ) : !active ? (
          <div className="rp_empty">{emptyText}</div>
        ) : (
          <>
            {/* STAGE */}
            <div
              className={`rp_stage ${bg === 'white' ? 'rp_bgWhite' : 'rp_bgGray'}`}
              style={{ height: stageHeight }}
              onMouseMove={onStageMouseMove}
              onClick={() => setZoomed((z) => !z)}
              title={zoomed ? 'Click to unzoom' : 'Click to zoom'}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={`rp_stageImg ${zoomed ? 'isZoomed' : ''}`}
                src={active}
                alt="Result preview"
                style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
                draggable={false}
              />
            </div>

            {/* THUMBNAILS */}
            {images.length > 1 && (
              <div className="rp_thumbs">
                {images.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    className={`rp_thumbBtn ${url === active ? 'isActive' : ''}`}
                    onClick={() => {
                      setActive(url);
                      setZoomed(false);
                    }}
                    title={`Result ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    < img className="rp_thumbImg" src={url} alt={`Result ${i + 1}`} />
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