'use client';

import React, { useEffect, useMemo, useState } from 'react';

type BgMode = 'white' | 'grey';

export type ResultPanelProps = {
  title: string;
  loading: boolean;
  images: string[];
  stageHeight?: number; // default 480
  emptyText?: string;   // default "No results yet"
};

async function downloadImage(url: string, filename = 'result.png') {
  // If it's already a data URL, download directly.
  if (url.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  // Fetch and convert to Blob so browser download works more reliably.
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(blobUrl);
}

export default function ResultPanel({
  title,
  loading,
  images,
  stageHeight = 480,
  emptyText = 'No results yet',
}: ResultPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [bg, setBg] = useState<BgMode>('white');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Reset when new images arrive
  useEffect(() => {
    setActiveIndex(0);
    setImgError(false);
  }, [images]);

  const active = images?.[activeIndex] ?? null;

  const stageStyle = useMemo(() => {
    const bgColor = bg === 'white' ? '#ffffff' : '#e9ecf1';
    return {
      height: stageHeight,
      background: bgColor,
    } as React.CSSProperties;
  }, [bg, stageHeight]);

  const canShow = !!active && !loading;

  return (
    <div className="panel rp">
      <div className="panelHeader rp_head">
        <div className="rp_title">{title}</div>

        <div className="rp_tools">
          <div className="rp_toggle">
            <button
              type="button"
              className={`rp_toggleBtn ${bg === 'white' ? 'isActive' : ''}`}
              onClick={() => setBg('white')}
              disabled={loading}
              title="White background"
            >
              White
            </button>
            <button
              type="button"
              className={`rp_toggleBtn ${bg === 'grey' ? 'isActive' : ''}`}
              onClick={() => setBg('grey')}
              disabled={loading}
              title="Grey background"
            >
              Grey
            </button>
          </div>

          <button
            type="button"
            className="rp_download"
            disabled={!active || loading}
            onClick={async () => {
              if (!active) return;
              try {
                await downloadImage(active, `result-${activeIndex + 1}.png`);
              } catch (e) {
                console.error(e);
                alert('Download failed (bad URL or blocked by CORS).');
              }
            }}
            title="Download selected image"
          >
            Download
          </button>
        </div>
      </div>

      <div className="panelBody rp_body">
        {loading ? (
          <div className="rp_empty">
            <div className="rp_spinner" />
            <div className="rp_emptyText">Generating…</div>
          </div>
        ) : !images || images.length === 0 ? (
          <div className="rp_empty">
            <div className="rp_emptyText">{emptyText}</div>
          </div>
        ) : (
          <>
            <div className="rp_stage" style={stageStyle}>
              {imgError ? (
                <div className="rp_error">
                  Image failed to load (bad URL or blocked).
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="rp_img"
                  src={active ?? ''}
                  alt="Result"
                  onClick={() => canShow && setIsModalOpen(true)}
                  onError={() => setImgError(true)}
                />
              )}

              <div className="rp_hint">
                {canShow ? 'Click image to zoom' : ''}
              </div>
            </div>

            <div className="rp_thumbs">
              {images.map((u, i) => (
                <button
                  key={`${u}-${i}`}
                  type="button"
                  className={`rp_thumb ${i === activeIndex ? 'isActive' : ''}`}
                  onClick={() => {
                    setActiveIndex(i);
                    setImgError(false);
                  }}
                  title={`View ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  < img className="rp_thumbImg" src={u} alt={`thumb-${i}`} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {isModalOpen && active && (
        <div
          className="rp_modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="rp_modalInner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="rp_close"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            < img className="rp_full" src={active} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
}