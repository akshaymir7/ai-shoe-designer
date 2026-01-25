"use client";

import React, { useState } from "react";
import UploadBox from "../components/UploadBox";

export default function Page() {
  const [part1, setPart1] = useState<File | null>(null);
  const [part2, setPart2] = useState<File | null>(null);
  const [part3, setPart3] = useState<File | null>(null);
  const [part4, setPart4] = useState<File | null>(null);

  return (
    <div style={{ padding: 28, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>AI Shoe Designer</h1>
      <p style={{ color: "#6b7280", marginTop: 0, marginBottom: 18 }}>
        Upload inputs (we’ll re-add Generate next).
      </p >

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        <UploadBox
          title="1) Accessory"
          subtitle="Buckle / logo / ornament"
          file={part1}
          onFileChange={setPart1}
        />
        <UploadBox
          title="2) Material"
          subtitle="Leather / fabric / texture"
          file={part2}
          onFileChange={setPart2}
        />
        <UploadBox
          title="3) Sole / bottom (optional)"
          subtitle="Sole reference image"
          file={part3}
          onFileChange={setPart3}
        />
        <UploadBox
          title="4) Inspiration (optional)"
          subtitle="Style reference"
          file={part4}
          onFileChange={setPart4}
        />
      </div>

      <div style={{ marginTop: 18, fontSize: 12, color: "#6b7280" }}>
        Selected: {[part1, part2, part3, part4].filter(Boolean).length}/4
      </div>
    </div>
  );
}