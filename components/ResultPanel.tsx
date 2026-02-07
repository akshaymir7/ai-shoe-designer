'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Props = {
  title: string;
  loading: boolean;
  images: string[];
};

export default function ResultPanel({ title, loading, images }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length > 0) setActive(0);
  }, [images.length]);

  const hasImages = images && images.length > 0;

  const activeSrc = useMemo(() => {
    if (!hasImages) return '';
    return images[Math.min(active, images.length - 1)];
  }, [active, images, hasImages]);

  return (
    <div className="rp">
      <div className="rpHead">
        <div className="rpTitle">{title}</div>
      </div>

      <div className="rpStage">
        {loading ? (
          <div className="rpCenter">
            <div className="rpBig">Generating…</div>
            <div className="rpSmall">Variations will load below.</div>
          </div>
        ) : !hasImages ? (
          <div className="rpCenter">
            <div className="rpBig">Your design preview will appear here</div>
            <div className="rpSmall">
              Upload references on the left, then click Generate to explore
              variations.
            </div>
            <div className="rpTip">
              Tip: Generate 2–4 variations to compare design directions.
            </div>
          </div>
        ) : (
          <div className="rpPreviewWrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            < img className="rpPreview" src={activeSrc} alt="Result preview" />
          </div>
        )}
      </div>

      {hasImages ? (
        <div className="rpThumbRow">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              className={`rpThumb ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
              title={`Variation ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              < img src={src} alt={`Variation ${i + 1}`} />
            </button>
          ))}
        </div>
      ) : null}

      <style jsx>{`
        .rp {
          width: 100%;
        }

        .rpHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .rpTitle {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.95;
        }

        .rpStage {
          border-radius: 18px;
          min-height: 420px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.18);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
          padding: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rpCenter {
          max-width: 520px;
          text-align: center;
        }

        .rpBig {
          font-size: 16px;
          font-weight: 800;
          opacity: 0.95;
        }

        .rpSmall {
          margin-top: 8px;
          font-size: 13px;
          opacity: 0.75;
          line-height: 1.4;
        }

        .rpTip {
          margin-top: 14px;
          font-size: 12px;
          opacity: 0.7;
        }

        .rpPreviewWrap {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .rpPreview {
          max-width: 100%;
          max-height: 560px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
          background: rgba(255, 255, 255, 0.03);
        }

        .rpThumbRow {
          display: flex;
          gap: 10px;
          margin-top: 14px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .rpThumb {
          width: 78px;
          height: 54px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.18);
          cursor: pointer;
          padding: 0;
          flex: 0 0 auto;
          transition: transform 140ms ease, border-color 140ms ease,
            box-shadow 140ms ease;
        }

        .rpThumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .rpThumb:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.22);
        }

        .rpThumb.active {
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.12);
        }
      `}</style>
    </div>
  );
}