"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  subtitle?: string;
  file: File | null;
  onFile: (file: File | null) => void;
  optional?: boolean;
};

export default function UploadBox({ title, subtitle, file, onFile, optional }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">
            {title} {optional ? <span className="muted">(optional)</span> : null}
          </div>
          {subtitle ? <div className="cardSubtitle">{subtitle}</div> : null}
        </div>

        {file ? (
          <button className="ghostBtn" type="button" onClick={() => onFile(null)}>
            Remove
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hiddenInput"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        className="drop"
        onClick={() => inputRef.current?.click()}
      >
        {previewUrl ? (
          <div className="thumbWrap">
            {/* thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            < img className="thumb" src={previewUrl} alt={`${title} preview`} />
            <div className="fileMeta">
              <div className="fileName">{file?.name}</div>
              <div className="mutedSmall">Click to change</div>
            </div>
          </div>
        ) : (
          <div className="dropEmpty">
            <div className="dropTitle">Click to upload</div>
            <div className="mutedSmall">PNG / JPG / WEBP</div>
          </div>
        )}
      </button>
    </div>
  );
}