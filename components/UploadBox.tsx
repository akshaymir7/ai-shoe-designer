"use client";

import React, { useId, useMemo } from "react";

export type UploadBoxProps = {
  title: string;
  subtitle?: string;
  file: File | null;
  onFile: (file: File | null) => void;
  accept?: string;
  optional?: boolean;
};

export default function UploadBox({
  title,
  subtitle,
  file,
  onFile,
  accept = "image/png,image/jpeg,image/webp",
  optional = false,
}: UploadBoxProps) {
  const inputId = useId();

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">
            {title} {optional ? <span className="muted">(optional)</span> : null}
          </div>
          {subtitle ? <div className="cardSub">{subtitle}</div> : null}
        </div>

        {file ? (
          <button
            type="button"
            className="btn btnGhost"
            onClick={() => onFile(null)}
            aria-label={`Remove ${title}`}
          >
            Remove
          </button>
        ) : (
          <div />
        )}
      </div>

      <label className={`drop ${file ? "hasFile" : ""}`} htmlFor={inputId}>
        {file && previewUrl ? (
          <div className="fileRow">
            < img className="thumb" src={previewUrl} alt={`${title} preview`} />
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
        id={inputId}
        className="hiddenInput"
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          onFile(f);
        }}
      />
    </div>
  );
}