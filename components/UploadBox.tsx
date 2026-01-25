// components/UploadBox.tsx
"use client";

import React, { useId, useMemo } from "react";

type Props = {
  title: string;
  subtitle?: string;
  file: File | null;
  onFile: (f: File | null) => void;
  optional?: boolean;
};

export default function UploadBox({ title, subtitle, file, onFile, optional }: Props) {
  const id = useId();

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <div className="cardTitle">
            {title} {optional ? <span className="muted">(optional)</span> : null}
          </div>
          {subtitle ? <div className="cardSub">{subtitle}</div> : null}
        </div>

        {file ? (
          <button className="btnGhost" type="button" onClick={() => onFile(null)}>
            Remove
          </button>
        ) : null}
      </div>

      <label className="drop" htmlFor={id}>
        {file ? (
          <div className="fileRow">
            < img className="thumb" src={previewUrl} alt="preview" />
            <div className="fileMeta">
              <div className="fileName">{file.name}</div>
              <div className="muted">Click to change</div>
            </div>
          </div>
        ) : (
          <div className="empty">
            <div className="emptyTitle">Click to upload</div>
            <div className="muted">PNG / JPG / WEBP</div>
          </div>
        )}
      </label>

      <input
        id={id}
        className="hiddenInput"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          onFile(f);
        }}
      />
    </div>
  );
}