"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";

type Props = {
  title: string;
  subtitle?: string;
  file: File | null;
  onFile: (f: File | null) => void;

  /** optional box = can be empty without showing "required" vibe */
  optional?: boolean;

  /** accept string for the input, defaults to common image types */
  accept?: string;

  /** small helper text under subtitle */
  hint?: string;

  /** disable the box */
  disabled?: boolean;
};

function prettyBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u++;
  }
  return `${n.toFixed(u === 0 ? 0 : 1)} ${units[u]}`;
}

export default function UploadBox({
  title,
  subtitle,
  file,
  onFile,
  optional = false,
  accept = "image/png,image/jpeg,image/webp",
  hint,
  disabled = false,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string>("");

  const hasFile = !!file;

  // Create a stable preview URL (works reliably in most browsers)
  useEffect(() => {
    if (!file) {
      setObjectUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const meta = useMemo(() => {
    if (!file) return "";
    const size = prettyBytes(file.size);
    const name = file.name || "image";
    return `${name}${size ? ` · ${size}` : ""}`;
  }, [file]);

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const validateAndSet = (f: File | null) => {
    if (!f) {
      onFile(null);
      return;
    }
    // Soft validation (don’t block too hard)
    const isImage = f.type?.startsWith("image/");
    if (!isImage) {
      // still allow if browser doesn't provide type, but usually it does
      // If you want strict, return early.
    }
    onFile(f);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    validateAndSet(f);
    // allow re-uploading same file
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    setDragOver(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    validateAndSet(f);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFile(null);
  };

  return (
    <div
      className={[
        "ub_card",
        hasFile ? "isFilled" : "",
        dragOver ? "isDragOver" : "",
        disabled ? "isDisabled" : "",
      ].join(" ")}
      onClick={openPicker}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") openPicker();
      }}
      aria-disabled={disabled}
      aria-label={`${title} upload`}
    >
      <div className="ub_header">
        <div className="ub_titles">
          <div className="ub_titleRow">
            <div className="ub_title">{title}</div>
            {optional ? <div className="ub_pill">Optional</div> : <div className="ub_pill req">Required</div>}
          </div>
          {subtitle ? <div className="ub_subtitle">{subtitle}</div> : null}
          {hint ? <div className="ub_hint">{hint}</div> : null}
        </div>

        {hasFile ? (
          <button className="ub_clear" onClick={clear} type="button">
            Remove
          </button>
        ) : (
          <div className="ub_badge">PNG / JPEG / WEBP</div>
        )}
      </div>

      <div className="ub_body">
        {hasFile ? (
          <div className="ub_previewWrap">
            {/* Preview */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            < img className="ub_preview" src={objectUrl} alt="Uploaded preview" />
            <div className="ub_meta">{meta}</div>
          </div>
        ) : (
          <div className="ub_dropzone">
            <div className="ub_dropTitle">Click to upload</div>
            <div className="ub_dropSub">or drag & drop</div>
          </div>
        )}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        className="ub_input"
        type="file"
        accept={accept}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}