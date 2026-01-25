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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    onFile(selected);
  };

  return (
    <div
      style={{
        border: "1px dashed #ccc",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        background: "#fafafa",
      }}
    >
      <strong>{title}</strong>
      <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
        {subtitle}
      </p >

      {file ? (
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          style={{
            width: 160,
            height: 160,
            objectFit: "cover",
            borderRadius: 8,
            display: "block",
            marginBottom: 12,
          }}
        />
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
      />
    </div>
  );
}