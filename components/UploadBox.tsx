"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  title: string;
  subtitle?: string;
  file: File | null;
  onFile: (f: File | null) => void;
  accept?: string;
};

export default function UploadBox({
  title,
  subtitle,
  file,
  onFile,
  accept = "image/png,image/jpeg,image/webp",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Create a local preview URL whenever file changes
  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const onPick = () => inputRef.current?.click();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    onFile(f);
  };

  const onRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      onClick={onPick}
      style={{
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 16,
        padding: 14,
        background: "rgba(255,255,255,0.03)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Thumbnail */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.25)",
            overflow: "hidden",
            flex: "0 0 auto",
            display: "grid",
            placeItems: "center",
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div style={{ fontSize: 12, opacity: 0.7, textAlign: "center" }}>
              Click to upload
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                PNG / JPG / WEBP
              </div>
            </div>
          )}
        </div>

        {/* Text */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700 }}>{title}</div>
          {subtitle ? (
            <div style={{ opacity: 0.7, fontSize: 12, marginTop: 2 }}>
              {subtitle}
            </div>
          ) : null}

          {file ? (
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
              {file.name}
            </div>
          ) : null}
        </div>

        {/* Remove */}
        {file ? (
          <button
            onClick={onRemove}
            type="button"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.25)",
              color: "rgba(255,255,255,0.9)",
              padding: "6px 10px",
              borderRadius: 12,
              cursor: "pointer",
              flex: "0 0 auto",
            }}
          >
            Remove
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        style={{ display: "none" }}
      />
    </div>
  );
}