'use client';

import React, { useEffect, useMemo, useState } from 'react';

export type ResultPanelProps = {
  title?: string;
  loading?: boolean;
  images: string[];
  emptyText?: string;
  stageHeight?: number; // px
};

function guessExt(url: string) {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'png';
  if (clean.endsWith('.webp')) return 'webp';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'jpg';
  return 'png';
}

function safeName(base: string) {
  return base.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 80);
}

async function downloadViaFetch(url: string, filenameBase: string) {
  // Best-effort: fetch -> blob -> download
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filenameBase;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
}

export default function ResultPanel({
  title = 'Result',
  loading = false,
  images,
  emptyText = 'No results yet',
  stageHeight = 480,
}: ResultPanelProps) {
  const [active, setActive] = useState<string | null>(null);
  const [bg, setBg] = useState<'white' | 'gray'>('gray');
  const [imgError, setImgError] = useState<string | null>(null);

  // pick first image whenever new images arrive
  useEffect(() => {
    if (images && images.length > 0) {
      setActive(images[0]);
      setImgError(null);
    } else {
      setActive(null);
      setImgError(null);
    }
  }, [images]);

  const canShow = !!active && images.length > 0;

  const filename = useMemo(() => {
    if (!active) return 'result.png';
    const ext = guessExt(active);
    return `${safeName('shoe_result')}.${ext}`;
  }, [active]);

  const handleDownload = async () => {
    if (!active) return;
    try {
      await downloadViaFetch(active, filename);
    } catch (e) {
      // If CORS blocks fetch, fallback: open image and user can Save As
      window.open(active, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="panel rp">
      <div className="panelHeader rp_head">
        <div className="rp_title">{title}</div>

        <div className="rp_controls">
          <button
            type="button"
            className={`rp_toggle ${bg === 'gray' ? 'isActive' : ''}`}
            onClick={() => setBg('gray')}
            title="Gray background"
          >
            Gray
          </button>
          <button
            type="button"
            className={`rp_toggle ${bg === 'white' ? 'isActive' : ''}`}
            onClick={() => setBg('white')}
            title="White background"
          >
            White
          </button>
        </div>
      </div>

      <div className="panelBody rp_body">
        <div
          className={`rp_stage ${bg === 'white' ? 'rp_stageWhite' : 'rp_stageGray'}`}
          style={{ height: stageHeight }}
        >
          {loading && <div className="rp_centerText">Generating…</div>}

          {!loading && images.length === 0 && <div className="rp_centerText">{emptyText}</div>}

          {!loading && canShow && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="rp_img"
                src={active as string}
                alt="Generated result"
                onError={() => setImgError('Image failed to load (bad URL or blocked).')}
                onLoad={() => setImgError(null)}
                onClick={() => window.open(active as string, '_blank', 'noopener,noreferrer')}
                title="Click to open full image"
              />

              <div className="rp_stageActions">
                <button type="button" className="rp_btn" onClick={handleDownload}>
                  Download
                </button>
              </div>
            </>
          )}

          {!loading && imgError && <div className="rp_error">{imgError}</div>}
        </div>

        {!loading && images.length > 0 && (
          <div className="rp_strip">
            {images.map((url, i) => {
              const isActive = url === active;
              return (
                <button
                  key={`${url}-${i}`}
                  type="button"
                  className={`rp_thumbBtn ${isActive ? 'isActive' : ''}`}
                  onClick={() => {
                    setActive(url);
                    setImgError(null);
                  }}
                  title={`Result ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  < img className="rp_thumb" src={url} alt={`thumb-${i}`} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}