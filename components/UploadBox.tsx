"use client";

import React from "react";

type UploadBoxProps = {
  label: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
};

export default function UploadBox({
  label,
  required = false,
  file,
  onChange,
}: UploadBoxProps) {
  return (
    <div className="mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">
          {label}
        </span>

        {required && (
          <span className="text-[11px] px-2 py-[2px] rounded-full bg-white/10 text-white/70">
            Required
          </span>
        )}
      </div>

      {/* Upload surface */}
      <label className="block cursor-pointer rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 text-center">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />

        {file ? (
          <p className="text-sm text-white/80 truncate">{file.name}</p >
        ) : (
          <div className="text-xs text-white/60 leading-relaxed">
            <div className="font-medium text-white/80">Click to upload</div>
            PNG / JPEG / WEBP<br />
            or drag & drop
          </div>
        )}
      </label>
    </div>
  );
}