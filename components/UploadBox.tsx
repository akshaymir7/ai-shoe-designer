"use client";

import { useEffect, useRef, useState } from "react";

type UploadBoxProps = {
  title: string;
  subtitle: string;
  file: File | null;
  onFile: (file: File | null) => void;
  required?: boolean;
};

export default function UploadBox({
  title,
  subtitle,
  file,
  onFile,
  required,
}: UploadBoxProps) {
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
    <div
      style={{
        border: "1px solid #e6e6e6",
        borderRadius: 14,
        padding: 14,
        background: "#fff",
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        {required ? (
          <span style={{ fontSize: 12, color: "#b00020" }}>*required</span>
        ) : (
          <span style={{ fontSize: 12, color: "#777" }}>(optional)</span>
        )}
      </div>

      <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
        {subtitle}
      </div>

      <div style={{ marginTop: 10, position: "relative" }}>
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: "1px dashed #cfcfcf",
            borderRadius: 12,
            padding: 12,
            cursor: "pointer",
            background: "#fafafa",
            minHeight: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              style={{
                width: "100%",
                height: 180,
                objectFit: "contain",
                borderRadius: 10,
                background: "#fff",
              }}
            />
          ) : (
            <div style={{ color: "#888", fontSize: 14 }}>
              Click to upload image
            </div>
          )}
        </div>

        {file ? (
          <button
            type="button"
            onClick={() => onFile(null)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              border: "1px solid #ddd",
              background: "#fff",
              borderRadius: 999,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 12,
            }}
            title="Remove"
          >
            Remove
          </button>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            onFile(f);
          }}
        />
      </div>

      {file ? (
        <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
          Selected: <span style={{ color: "#111" }}>{file.name}</span>
        </div>
      ) : (
        <div style={{ marginTop: 10, fontSize: 12, color: "#888" }}>
          No file selected
        </div>
      )}
    </div>
  );
}