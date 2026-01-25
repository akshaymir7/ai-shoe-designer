"use client";

import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  accept?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
};

export default function UploadBox({
  title,
  subtitle,
  accept = "image/*",
  file,
  onFileChange,
}: Props) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
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
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
        background: "white",
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
        {subtitle ? (
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            {subtitle}
          </div>
        ) : null}
      </div>

      <label
        style={{
          display: "block",
          border: "1px dashed #cbd5e1",
          borderRadius: 12,
          padding: 14,
          cursor: "pointer",
        }}
      >
        <input
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onFileChange(f);
          }}
        />

        {!file ? (
          <div style={{ color: "#334155", fontSize: 13 }}>
            Click to upload
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="preview"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 10,
                  objectFit: "cover",
                  border: "1px solid #e5e7eb",
                }}
              />
            ) : null}

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{file.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                {(file.size / 1024).toFixed(0)} KB
              </div>

              <button
                type="button"
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                }}
                onClick={(ev) => {
                  ev.preventDefault();
                  onFileChange(null);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </label>
    </div>
  );
}