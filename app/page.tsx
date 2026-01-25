"use client";

import React, { useState } from "react";
import UploadBox from "../components/UploadBox";

export default function Page() {
  const [part1, setPart1] = useState<File | null>(null);
  const [part2, setPart2] = useState<File | null>(null);
  const [part3, setPart3] = useState<File | null>(null);
  const [part4, setPart4] = useState<File | null>(null);

  const selectedCount = [part1, part2, part3, part4].filter(Boolean).length;

  return (
    <div className="container">
      <h1 className="h1">AI Shoe Designer</h1>
      <p className="sub">Upload inputs (we’ll re-add Generate next).</p >

      <div className="grid">
        <div className="col-4">
          <UploadBox
            title="1) Accessory"
            subtitle="Buckle / logo / ornament"
            value={part1}
            onChange={setPart1}
          />
        </div>

        <div className="col-4">
          <UploadBox
            title="2) Material"
            subtitle="Leather / fabric / texture"
            value={part2}
            onChange={setPart2}
          />
        </div>

        <div className="col-4">
          <UploadBox
            title="3) Sole / bottom"
            subtitle="Sole reference image"
            value={part3}
            onChange={setPart3}
            optional
          />
        </div>

        <div className="col-6">
          <UploadBox
            title="4) Inspiration"
            subtitle="Style reference"
            value={part4}
            onChange={setPart4}
            optional
          />
        </div>
      </div>

      <div style={{ marginTop: 14, color: "var(--muted)", fontSize: 12 }}>
        Selected: {selectedCount}/4
      </div>
    </div>
  );
}