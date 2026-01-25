// components/UploadBox.tsx
"use client";

import React, { useId } from "react";

type Props = {
  title: string;
  subtitle?: string;
  file: File | null;
  onFile: (file: File | null) => void;
  optional?: boolean;
  accept?: string;
};

export default function UploadBox({
  title,
  subtitle,
  file,
  onFile,
  optional = false,
  accept = "image/png,image/jpeg,image/webp",
}: Props) {
  const id = useId();

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <div className="cardTitle">
            {title} {optional ? <span className="muted">(optional)</span> : null}
          </div>
          {subtitle ? <div className="cardSubtitle">{subtitle}</div> : null}
        </div>

        <button
          className="btnSecondary"
          type="button"
          onClick={() => onFile(null)}
          disabled={!file}
        >
          Remove
        </button>
      </div>

      <label className="drop" htmlFor={id}>
        <div className="dropInner">
          {file ? (
            <div className="fileRow">
              <div className="thumb">
                {/* preview handled by parent; this box only shows filename */}
                <div className="thumbPlaceholder" />
              </div>
              <div className="fileMeta">
                <div className="fileName">{file.name}</div>
                <div className="muted">Click to change</div>
              </div>
            </div>
          ) : (
            <div className="emptyState">
              <div className="emptyTitle">Click to upload</div>
              <div className="muted">PNG / JPG / WEBP</div>
            </div>
          )}
        </div>

        <input
          id={id}
          type="file"
          accept={accept}
          className="hiddenInput"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onFile(f);
          }}
        />
      </label>
    </div>
  );
}