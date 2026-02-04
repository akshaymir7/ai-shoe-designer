'use client';

import React, { useMemo, useState } from 'react';

type Props = {
  title: string;
  loading: boolean;
  images: string[];
  emptyHint?: string;
};

export default function ResultPanel({ title, loading, images, emptyHint }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const gridClass = useMemo(() => {
    return images.length <= 1 ? 'rp_grid rp_gridOne' : 'rp_grid';
  }, [images.length]);

  return (
    <div className="panel rp">
      <div className="panelHeader rp_head">
        <div className="rp_title">{title}</div>

        <div className="rp_meta">
          {loading ? (
            <span className="rp_chip">Generating…</span>
          ) : (
            <span className="rp_chip">{images.length} image{images.length === 1 ? '' : 's'}</span>
          )}
        </div>
      </div>

      <div className="panelBody rp_body">
        {loading && (
          <div className="rp_skeletonWrap">
            <div className="rp_skel" />
            <div className="rp_skel" />
            <div className="rp_skel" />
            <div className="rp_skel" />
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="rp_empty">
            <div className="rp_emptyTitle">No result yet</div>
            <div className="rp_emptySub">{emptyHint ?? 'Generate to see results here.'}</div>
          </div>
        )}

        {!loading && images.length > 0 && (
          <div className={gridClass}>
            {images.map((url, i) => (
              <button
                key={`${i}-${url}`}
                type="button"
                className="rp_card"
                onClick={() => setActive(url)}
                title="Click to enlarge"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                < img className="rp_img" src={url} alt={`Result ${i + 1}`} />
                <div className="rp_caption">Variation {i + 1}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {active && (
        <div className="rp_lightbox" onClick={() => setActive(null)}>
          <div className="rp_lightboxInner" onClick={(e) => e.stopPropagation()}>
            <button className="rp_close" type="button" onClick={() => setActive(null)}>
              Close
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            < img className="rp_full" src={active} alt="Preview" />

            <a className="rp_download" href= >
              Download
            </a >
          </div>
        </div>
      )}
    </div>
  );
}