"use client";

import React, { useId } from "react";

type Props = {
  title: string;
  subtitle?: string;
  value: File | null;
  onChange: (f: File | null) => void;
  optional?: boolean;
};

export default function UploadBox({ title, subtitle, value, onChange, optional }: Props) {
  const id = useId();
  const selected = !!value;

  return (
    <div
      style={{
        background: "var(--card)",
        border: selected ? "1px solid rgba(37, 99, 235, 0.55)" : "1px solid var(--border)",
        borderRadius: 16,
        padding: 16,
        boxShadow: selected ? "var(--shadow2)" : "var(--shadow)",
        transition: "transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0px)";
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          {title} {optional ? <span style={{ color: "var(--muted)", fontWeight: 500 }}>(optional)</span> : null}
        </div>
        {selected ? (
          <span
            style={{
              fontSize: 12,
              color: "#0f172a",
              background: "rgba(37, 99, 235, 0.10)",
              border: "1px solid rgba(37, 99, 235, 0.18)",
              padding: "3px 8px",
              borderRadius: 999,
            }}
          >
            Selected
          </span>
        ) : null}
      </div>

      {subtitle ? (
        <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>{subtitle}</div>
      ) : null}

      <label
        htmlFor={id}
        style={{
          display: "block",
          marginTop: 12,
          borderRadius: 14,
          border: selected ? "1px dashed rgba(37, 99, 235, 0.55)" : "1px dashed var(--border2)",
          padding: 14,
          cursor: "pointer",
          background: selected ? "rgba(37, 99, 235, 0.06)" : "rgba(2, 6, 23, 0.02)",
          transition: "background 140ms ease, border-color 140ms ease",
          outline: "none",
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

        {!selected ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Click to upload</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>PNG/JPG</span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {value!.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {(value!.size / 1024).toFixed(0)} KB
              </div>
            </div>

            <button
              type="button"
              onClick={(ev) => {
                ev.preventDefault();
                onChange(null);
              }}
              style={{
                border: "1px solid var(--border)",
                background: "white",
                borderRadius: 12,
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