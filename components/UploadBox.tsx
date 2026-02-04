'use client';

import React, { useEffect, useRef, useState } from 'react';

type UploadBoxProps = {
  label: string;
  required?: boolean;
  optional?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
};

export default function UploadBox({
  label,
  required,
  optional,
  file,
  onChange,
  accept = 'image/png,image/jpeg,image/webp',
  disabled,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function openPicker() {
    if (!disabled) inputRef.current?.click();
  }

  function onFilePicked(f: File | null) {
    if (f) onChange(f);
  }

  function removeFile(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) onFilePicked(f);
  }

  return (
    <div className="ub_wrap">
      <div className="ub_titleRow">
        <div className="ub_title">{label}</div>
        {required && <span className="ub_badge required">Required</span>}
        {optional && <span className="ub_badge optional">Optional</span>}
      </div>

      <div
        className={`ub_drop ${dragOver ? 'drag' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={openPicker}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
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
              < img className="ub_thumb" src={previewUrl!} alt="preview" />
            </div>

            <div className="ub_fileMeta">
              <div className="ub_fileName">{file.name}</div>
              <div className="ub_fileSize">
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>

            <button
              className="ub_remove"
              onClick={removeFile}
              type="button"
            >
              Remove
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          hidden
          onChange={(e) => onFilePicked(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}