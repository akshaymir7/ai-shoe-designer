'use client';

type ResultPanelProps = {
  title: string;
  loading: boolean;
  images: string[];
  emptyHint?: string;
};

export default function ResultPanel({
  title,
  loading,
  images,
  emptyHint,
}: ResultPanelProps) {
  return (
    <div className="panel">
      <div className="panelHeader">{title}</div>

      <div className="panelBody">
        {loading && <p className="muted">Generating images…</p >}

        {!loading && images.length === 0 && (
          <p className="muted">{emptyHint ?? 'No results yet'}</p >
        )}

        {!loading && images.length > 0 && (
          <div className="resultsGrid">
            {images.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              < img key={`${url}-${i}`} src={url} alt={`Result ${i + 1}`} className="resultImage" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}