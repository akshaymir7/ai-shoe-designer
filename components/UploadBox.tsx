"use client";

import { useRef } from "react";

type UploadBoxProps = {
  title: string;
  subtitle: string;
  file: File | null;
  onFile: (file: File | null) => void;
};

export default function UploadBox({
  title,
  subtitle,
  file,
  onFile,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div
      style={{
        border: "1px dashed #ccc",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        cursor: "pointer",
        background: "#fafafa",
      }}
      onClick={() => inputRef.current?.click()}
    >
      <strong>{title}</strong>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
        {subtitle}
      </div>

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="preview"
          style={{
            width: "100%",
            maxHeight: 180,
            objectFit: "contain",
            borderRadius: 8,
            background: "#fff",
          }}
        />
      ) : (
        <div
          style={{
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            fontSize: 14,
          }}
        >
          Click to upload
        </div>
      )}

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
  );
}