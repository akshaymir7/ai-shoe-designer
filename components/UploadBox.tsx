// components/UploadBox.tsx
"use client";

import React, { useRef } from "react";

type Props = {
  title: string;
  subtitle?: string;
  file: File | null;
  onFile: (f: File | null) => void;
  optional?: boolean;
};

async function resizeImage(file: File): Promise<File> {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);

  await new Promise((res) => (img.onload = res));

  const MAX = 1024;
  let { width, height } = img;

  if (width > height && width > MAX) {
    height = (height * MAX) / width;
    width = MAX;
  } else if (height > MAX) {
    width = (width * MAX) / height;
    height = MAX;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((res) =>
    canvas.toBlob(
      (b) => res(b!),
      "image/jpeg",
      0.82 // compression quality
    )
  );

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

export default function UploadBox({
  title,
  subtitle,
  file,
  onFile,
  optional,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const resized = await resizeImage(f);
    onFile(resized);
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <div className="cardTitle">
            {title} {optional ? <span className="muted">(optional)</span> : null}
          </div>
          {subtitle ? <div className="cardSub">{subtitle}</div> : null}
        </div>
        {file ? (
          <button className="btnGhost" onClick={() => onFile(null)}>
            Remove
          </button>
        ) : null}
      </div>

      <label className="drop">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hiddenInput"
          onChange={handleChange}
        />

        {!file ? (
          <div className="empty">
            <div className="emptyTitle">Click to upload</div>
            <div className="muted">PNG / JPG / WEBP</div>
          </div>
        ) : (
          <div className="fileRow">
            <img
              src={URL.createObjectURL(file)}
              className="thumb"
              alt="preview"
            />
            <div>
              <div className="fileName">{file.name}</div>
              <div className="muted">
                {(file.size / 1024).toFixed(0)} KB
              </div>
            </div>
          </div>
        )}
      </label>
    </div>
  );
}