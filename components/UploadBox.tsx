"use client";

import React, { useId, useRef, useState } from "react";

type UploadBoxProps = {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
  helper?: string;
  accept?: string;
};

export default function UploadBox({
  label,
  file,
  onChange,
  required = false,
  helper,
  accept = "image/png,image/jpeg,image/webp",
}: UploadBoxProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0] ?? null;
    onChange(f);
  };

  return (
    <div className="uploadBox">
      <div className="uploadBoxHeader">
        <div className="uploadBoxTitleRow">
          <div className="uploadBoxTitle">{label}</div>
          <div className={`pill ${required ? "pillReq" : "pillOpt"}`}>
            {required ? "REQUIRED" : "OPTIONAL"}
          </div>
        </div>

        <div className="uploadBoxSub">
          Click to upload or drag & drop
        </div>

        {helper ? <div className="uploadBoxHelper">{helper}</div> : null}

        <div className="uploadBoxMeta">PNG • JPG • WEBP</div>
      </div>

      {/* ALWAYS hidden, independent of global CSS */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      />

      <div
        className={`uploadDrop ${dragOver ? "uploadDropActive" : ""}`}
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? openPicker() : null)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {file ? (
          <div className="uploadFileRow">
            <div className="uploadFileName">{file.name}</div>
            <div className="uploadFileSize">
              {Math.round(file.size / 1024)} KB
            </div>
          </div>
        ) : (
          <div className="uploadEmpty">
            <div className="uploadEmptyTitle">Drop an image here</div>
            <div className="uploadEmptyHint">or click to browse</div>
          </div>
        )}
      </div>
    </div>
  );
}