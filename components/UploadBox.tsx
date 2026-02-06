"use client";

import React, { useId, useMemo, useRef, useState } from "react";

type UploadBoxProps = {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
  accept?: string;
};

export default function UploadBox({
  label,
  file,
  onChange,
  required = false,
  accept = "image/png,image/jpeg,image/webp,image/jpg,image/jfif",
}: UploadBoxProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    const url = URL.createObjectURL(file);
    return url;
  }, [file]);

  // cleanup preview URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function openPicker() {
    inputRef.current?.click();
  }

  function handlePicked(f: File | null) {
    onChange(f);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    handlePicked(f);
    // allow re-picking same file
    e.currentTarget.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) handlePicked(f);
  }

  function onDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  const boxStyle: React.CSSProperties = {
    borderRadius: 14,
    padding: 14,
    border: dragOver ? "1px solid rgba(255,255,255,0.28)" : "1px dashed rgba(255,255,255,0.18)",
    background: dragOver ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.10)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    transition: "all 120ms ease",
    cursor: "pointer",
  };

  const labelRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  };

  const pillStyle: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    padding: "4px 8px",
    borderRadius: 999,
    background: required ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.85)",
  };

  const hintStyle: React.CSSProperties = {
    marginTop: 8,
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.3,
  };

  const metaStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
  };

  const thumbStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    overflow: "hidden",
    flex: "0 0 auto",
    display: "grid",
    placeItems: "center",
  };

  const nameStyle: React.CSSProperties = {
    fontSize: 13,
    color: "rgba(255,255,255,0.90)",
    fontWeight: 600,
    marginBottom: 2,
    maxWidth: 320,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const subStyle: React.CSSProperties = {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  };

  const removeBtnStyle: React.CSSProperties = {
    marginLeft: "auto",
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.90)",
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <div>
      {/* Hidden native input */}
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={onInputChange}
      />

      {/* Custom box */}
      <div
        style={boxStyle}
        onClick={openPicker}
        onDrop={onDrop}
        onDragEnter={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
        onDragOver={onDrag}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openPicker();
        }}
      >
        <div style={labelRowStyle}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>
            {label}
          </div>
          {required ? <span style={pillStyle}>Required</span> : <span style={pillStyle}>Optional</span>}
        </div>

        {!file ? (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
              Click to upload
            </div>
            <div style={hintStyle}>
              PNG / JPEG / WEBP
              <br />
              or drag & drop
            </div>
          </div>
        ) : (
          <div style={metaStyle} onClick={(e) => e.stopPropagation()}>
            <div style={thumbStyle}>
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="thumb"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>IMG</span>
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={nameStyle}>{file.name}</div>
              <div style={subStyle}>{Math.round(file.size / 1024)} KB</div>
            </div>

            <button
              type="button"
              style={removeBtnStyle}
              onClick={() => onChange(null)}
              title="Remove"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}