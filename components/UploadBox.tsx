// components/UploadBox.tsx
"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";

type Props = {
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
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function pickFile() {
    inputRef.current?.click();
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    onFile(f);
    // allow picking the same file again
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) onFile(f);
  }

  return (
    <div className={`ub_card ${dragOver ? "ub_cardDrag" : ""}`}>
      <div className="ub_head">
        <div className="ub_titles">
          <div className="ub_titleRow">
            <div className="ub_title">{title}</div>
            {optional ? <span className="ub_optional">optional</span> : null}
          </div>
          {subtitle ? <div className="ub_subtitle">{subtitle}</div> : null}
        </div>

        {file ? (
          <button type="button" className="ub_removeBtn" onClick={() => onFile(null)}>
            Remove
          </button>
        ) : null}
      </div>

      <div
        className="ub_drop"
        onClick={pickFile}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept}
          className="ub_input"
          onChange={onInputChange}
        />

        {!file ? (
          <div className="ub_empty">
            <div className="ub_emptyTitle">Click to upload</div>
            <div className="ub_emptyHint">PNG / JPEG / WEBP</div>
            <div className="ub_emptyHint2">or drag & drop</div>
          </div>
        ) : (
          <div className="ub_filled">
            <div className="ub_thumbWrap">
              {/* using <img> for blob URL reliability */}
              < img className="ub_thumb" src={previewUrl} alt="preview" />
            </div>

            <div className="ub_meta">
              <div className="ub_filename" title={file.name}>
                {file.name}
              </div>
              <div className="ub_actions">
                <button
                  type="button"
                  className="ub_linkBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    pickFile();
                  }}
                >
                  Click to change
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}