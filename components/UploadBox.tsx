"use client";

import React, { useMemo, useRef } from "react";

export type UploadBoxProps = {
  label: string;
  required?: boolean; // show "Required" badge
  optional?: boolean; // alternatively show "Optional"
  hint?: string; // helper text under subtitle
  accept?: string; // defaults to common image types
  disabled?: boolean;

  file: File | null;
  onChange: (file: File | null) => void;
};

export default function UploadBox({
  label,
  required,
  optional,
  hint,
  accept = "image/png,image/jpeg,image/webp",
  disabled,
  file,
  onChange,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  function pickFile() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function onFileSelected(f: File | null) {
    onChange(f);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    onFileSelected(f);
    // reset so selecting same file again triggers change
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled) return;
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) onFileSelected(f);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function removeFile(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
  }

  const badge = required ? "Required" : optional ? "Optional" : "";

  return (
    <div className="ub_card">
      <div className="ub_head">
        <div className="ub_titleRow">
          <div className="ub_title">{label}</div>
          {badge ? <div className="ub_badge">{badge}</div> : null}
        </div>
        {hint ? <div className="ub_hint">{hint}</div> : null}
      </div>

      <div
        className={`ub_drop ${disabled ? "ub_disabled" : ""}`}
        onClick={pickFile}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          style={{ display: "none" }}
          disabled={disabled}
        />

        {!file ? (
          <div className="ub_empty">
            <div className="ub_emptyTitle">Click to upload</div>
            <div className="ub_emptySub">PNG / JPEG / WEBP</div>
            <div className="ub_emptySub2">or drag &amp; drop</div>
          </div>
        ) : (
          <div className="ub_filled">
            <div className="ub_thumbWrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              < img className="ub_thumb" src={previewUrl} alt="preview" />
            </div>

            <div className="ub_fileMeta">
              <div className="ub_fileName">{file.name}</div>
              <div className="ub_fileSize">
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>

            <button className="ub_remove" onClick={removeFile} type="button">
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}