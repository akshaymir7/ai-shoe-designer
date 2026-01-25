// components/UploadBox.tsx
"use client";

import React, { useId } from "react";

type Props = {
  title: string;
  subtitle?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
};

export default function UploadBox({ title, subtitle, file, onChange, required }: Props) {
  const id = useId();

  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 14,
        padding: 16,
        background: "white",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        {required ? (
          <span style={{ fontSize: 12, opacity: 0.7 }}>(required)</span>
        ) : (
          <span style={{ fontSize: 12, opacity: 0.7 }}>(optional)</span>
        )}
      </div>

      {subtitle ? (
        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>{subtitle}</div>
      ) : null}

      <label
        htmlFor={id}
        style={{
          display: "block",
          marginTop: 12,
          border: "1px dashed rgba(0,0,0,0.25)",
          borderRadius: 12,
          padding: 14,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <input
          id={id}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onChange(f);
          }}
        />

        {!file ? (
          <div style={{ fontSize: 13, opacity: 0.8 }}>Click to upload</div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>{file.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>

            <button
              type="button"
              onClick={(ev) => {
                ev.preventDefault();
                onChange(null);
              }}
              style={{
                border: "1px solid rgba(0,0,0,0.15)",
                background: "white",
                borderRadius: 10,
                padding: "8px 10px",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Remove
            </button>
          </div>
        )}
      </label>
    </div>
  );
}