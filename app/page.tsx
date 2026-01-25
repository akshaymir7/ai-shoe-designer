"use client";

import { useState } from "react";
import UploadBox from "../components/UploadBox";

export default function Page() {
  const [part1, setPart1] = useState<File | null>(null);
  const [part2, setPart2] = useState<File | null>(null);
  const [part3, setPart3] = useState<File | null>(null);
  const [part4, setPart4] = useState<File | null>(null);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>AI Shoe Designer</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Upload inputs (thumbnails enabled)
      </p >

      <UploadBox
        title="1) Accessory"
        subtitle="Buckle / logo / ornament"
        file={part1}
        onFile={setPart1}
      />

      <UploadBox
        title="2) Material"
        subtitle="Leather / fabric / texture"
        file={part2}
        onFile={setPart2}
      />

      <UploadBox
        title="3) Sole / bottom (optional)"
        subtitle="Sole reference image"
        file={part3}
        onFile={setPart3}
      />

      <UploadBox
        title="4) Inspiration (optional)"
        subtitle="Style reference"
        file={part4}
        onFile={setPart4}
      />
    </div>
  );
}