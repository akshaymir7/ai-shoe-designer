"use client";

import React, { useMemo } from "react";

type Props = {
  title: string;
  subtitle?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
};

export default function UploadBox({
  title,
  subtitle,
  file,
  onChange,
  accept = "image/*",
}: Props) {
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  return (
    <div className="card uploadCard">
      <div className="uploadHeader">
        <div>
          <div className="uploadTitle">{title}</div>
          {subtitle ? <div className="uploadSubtitle">{subtitle}</div> : null}
        </div>

        {file ? (
          <button className="btn btnGhost" onClick={() => onChange(null)} type="button">
            Remove
          </button>
        ) : null}
      </div>

      <label className="dropZone">
        <input
          className="fileInput"
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />

        {file && previewUrl ? (
          <div className="previewRow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="previewImg" src={previewUrl} alt="preview" />
            <div className="previewMeta">
              <div className="fileName">{file.name}</div>
              <div className="fileHint">Click to replace</div>
            </div>
          </div>
        ) : (
          <div className="placeholder">
            <div className="placeholderTitle">Choose an image</div>
            <div className="placeholderHint">PNG/JPG works best</div>
          </div>
        )}
      </label>
    </div>
  );
}
