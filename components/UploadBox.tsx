// components/UploadBox.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";

type UploadBoxProps = {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;

  // page.tsx currently passes this:
  optional?: boolean;

  // some places may pass this:
  required?: boolean;
};

function normalizeLabel(raw: string) {
  const s = (raw || "").trim();
  const lower = s.toLowerCase();

  if (lower.includes("accessory") || lower.includes("hardware")) return "Hardware";
  if (lower.includes("upper") || lower.includes("material")) return "Material";
  if (lower.includes("sole") || lower.includes("bottom")) return "Sole";
  if (lower.includes("inspiration")) return "Inspiration";

  return s.replace(/\(optional\)/gi, "").replace(/\boptional\b/gi, "").trim();
}

export default function UploadBox({
  label,
  file,
  onChange,
  optional,
  required,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const displayLabel = useMemo(() => normalizeLabel(label), [label]);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function openPicker() {
    inputRef.current?.click();
  }

  function handlePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    onChange(f);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const f = e.dataTransfer.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) return;

    onChange(f);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  const showRequiredPill = Boolean(required) && !optional;

  return (
    <div className="uploadBox">
      <div className="uploadHeader">
        <div className="uploadTitle">
          <span className="uploadTitleText">{displayLabel}</span>
          {showRequiredPill ? <span className="pill pillRequired">Required</span> : null}
          {/* Optional pill intentionally removed */}
        </div>
      </div>

      {!file ? (
        <div
          className={`uploadDropzone ${dragOver ? "isDragOver" : ""}`}
          onClick={openPicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
        >
          <div className="uploadHint">
            <div className="uploadHintTitle">Click to upload</div>
            <div className="uploadHintSub">PNG / JPEG / WEBP</div>
            <div className="uploadHintSub2">or drag &amp; drop</div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handlePicked}
            style={{ display: "none" }}
          />
        </div>
      ) : (
        <div className="uploadFileRow">
          <div className="uploadFileLeft" onClick={openPicker} role="button" tabIndex={0}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              < img className="uploadThumb" src={previewUrl} alt={file.name} />
            ) : (
              <div className="uploadThumbFallback" />
            )}

            <div className="uploadMeta">
              <div className="uploadName">{file.name}</div>
              <div className="uploadSize">{Math.round(file.size / 1024)} KB</div>
            </div>
          </div>

          <button className="btn btnSecondary" type="button" onClick={() => onChange(null)}>
            Remove
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handlePicked}
            style={{ display: "none" }}
          />
        </div>
      )}
    </div>
  );
}