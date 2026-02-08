"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  required?: boolean;
  file: File | null;
  onChange: (f: File | null) => void;
  accept?: string;
};

export default function UploadBox({
  label,
  required = false,
  file,
  onChange,
  accept = "image/png,image/jpeg,image/webp,image/jpg",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pick() {
    inputRef.current?.click();
  }

  function onFiles(files: FileList | null) {
    const f = files?.[0] ?? null;
    onChange(f);
  }

  return (
    <div
      className="uploadBox"
      onClick={pick}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onFiles(e.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
      style={
        dragOver
          ? { borderColor: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)" }
          : undefined
      }
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div className="uploadLabel">{label}</div>

        <span className={required ? "requiredBadge" : "optionalBadge"}>
          {required ? "REQUIRED" : "OPTIONAL"}
        </span>
      </div>

      {!file ? (
        <div className="uploadHint">
          Click to upload <br />
          PNG / JPG / WEBP <br />
          or drag &amp; drop
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={previewUrl}
            alt={file.name}
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              objectFit: "cover",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13, opacity: 0.9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {file.name}
            </div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <button
            type="button"
            className="btn"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
          >
            Remove
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => onFiles(e.target.files)}
      />
    </div>
  );
}