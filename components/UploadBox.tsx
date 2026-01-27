// components/UploadBox.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  title: string;
  subtitle?: string;
  file: File | null;
  onFile: (f: File | null) => void;
  optional?: boolean;
  accept?: string; // e.g. "image/png,image/jpeg,image/webp"
};

export default function UploadBox({
  title,
  subtitle,
  file,
  onFile,
  optional,
  accept = "image/png,image/jpeg,image/webp",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string>("");

  useEffect(() => {
    if (!file) {
      setObjectUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const ext = useMemo(() => {
    if (!file?.name) return "";
    const parts = file.name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
  }, [file]);

  function pickFile() {
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    onFile(f);
    // allow re-selecting the same file
    e.currentTarget.value = "";
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onFile(null);
  }

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div>
          <div style={styles.titleRow}>
            <div style={styles.title}>{title}</div>
            {optional ? <span style={styles.badge}>optional</span> : null}
          </div>
          {subtitle ? <div style={styles.subtitle}>{subtitle}</div> : null}
        </div>

        {file ? (
          <button type="button" onClick={handleRemove} style={styles.removeBtn}>
            Remove
          </button>
        ) : null}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={pickFile}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? pickFile() : null)}
        style={{
          ...styles.drop,
          ...(file ? styles.dropHasFile : null),
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: "none" }}
        />

        {!file ? (
          <div style={styles.dropEmpty}>
            <div style={styles.dropTitle}>Click to upload</div>
            <div style={styles.dropHint}>PNG / JPG / WEBP</div>
          </div>
        ) : (
          <div style={styles.fileRow}>
            <div style={styles.thumbWrap}>
              {/* Thumbnail */}
              <img
                src={objectUrl}
                alt={file.name}
                style={styles.thumb}
                draggable={false}
              />
              {/* Small corner badge for type */}
              {ext ? <div style={styles.extPill}>{ext}</div> : null}
            </div>

            <div style={styles.fileMeta}>
              <div style={styles.fileName} title={file.name}>
                {file.name}
              </div>
              <div style={styles.fileSub}>Click to change</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 16,
    fontWeight: 800,
    color: "rgba(255,255,255,0.92)",
  },
  badge: {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.16)",
    color: "rgba(255,255,255,0.70)",
    background: "rgba(255,255,255,0.04)",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(255,255,255,0.58)",
  },
  removeBtn: {
    borderRadius: 999,
    padding: "8px 12px",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.85)",
    cursor: "pointer",
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: "nowrap",
  },
  drop: {
    borderRadius: 16,
    border: "1px dashed rgba(255,255,255,0.16)",
    background: "rgba(0,0,0,0.15)",
    padding: 14,
    cursor: "pointer",
    transition: "border-color 120ms ease, background 120ms ease",
    overflow: "hidden", // ensures thumbnail never spills out
  },
  dropHasFile: {
    border: "1px dashed rgba(120, 255, 190, 0.25)",
    background: "rgba(0,0,0,0.18)",
  },
  dropEmpty: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  dropTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "rgba(255,255,255,0.85)",
  },
  dropHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  fileRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    overflow: "hidden",
    position: "relative",
    flex: "0 0 auto",
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  extPill: {
    position: "absolute",
    right: 6,
    bottom: 6,
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 6px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.55)",
    color: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(255,255,255,0.14)",
  },
  fileMeta: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  fileName: {
    fontSize: 13,
    fontWeight: 800,
    color: "rgba(255,255,255,0.88)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  fileSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
};