"use client";

import React, { useId, useRef } from "react";

export type UploadBoxProps = {
  label: string;                 // "Hardware" | "Material" | "Sole" | "Inspiration"
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;            // default false
  helperTop?: string;            // optional custom helper line
  helperBottom?: string;         // optional custom helper line
};

export default function UploadBox({
  label,
  file,
  onChange,
  required = false,
  helperTop,
  helperBottom,
}: UploadBoxProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pill = required ? "REQUIRED" : "OPTIONAL";

  // Default helper copy per box
  const defaultHelpers: Record<string, { top: string; bottom: string }> = {
    Hardware: {
      top: "Upload buckles, trims, or accessories",
      bottom: "PNG · JPG · WEBP · or drag & drop",
    },
    Material: {
      top: "Upload leather, fabric, or surface textures",
      bottom: "PNG · JPG · WEBP · or drag & drop",
    },
    Sole: {
      top: "Upload outsole or bottom references",
      bottom: "PNG · JPG · WEBP · or drag & drop",
    },
    Inspiration: {
      top: "Optional references for mood, silhouette, or styling",
      bottom: "PNG · JPG · WEBP · or drag & drop",
    },
  };

  const h =
    defaultHelpers[label] ?? {
      top: "Click to upload or drag & drop",
      bottom: "PNG · JPG · WEBP",
    };

  const topLine = helperTop ?? h.top;
  const bottomLine = helperBottom ?? h.bottom;

  function handleFile(f?: File | null) {
    onChange(f ?? null);
    // allow re-uploading the same file name
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div
      className="uploadBox"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      aria-label={`${label} upload`}
    >
      <div className="uploadHeaderRow">
        <div className="uploadTitle">{label}</div>
        <div className="pill">{pill}</div>
      </div>

      {!file ? (
        <>
          <div className="uploadPrimary">Click to upload or drag & drop</div>
          <div className="uploadSecondary">{topLine}</div>
          <div className="uploadSecondary">{bottomLine}</div>
        </>
      ) : (
        <div className="uploadSelectedRow">
          <div className="uploadFileMeta">
            <div className="uploadFileName">{file.name}</div>
            <div className="uploadFileSize">
              {Math.max(1, Math.round(file.size / 1024))} KB
            </div>
          </div>

          <button
            type="button"
            className="btnSecondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFile(null);
            }}
          >
            Remove file
          </button>
        </div>
      )}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="srOnly"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}