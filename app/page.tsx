"use client";

import UploadBox from "../components/UploadBox";

export default function Page() {
  return (
    <div style={{ padding: 40, maxWidth: 800 }}>
      <h1>AI Shoe Designer</h1>
      <p>Upload inputs (we’ll add Generate next)</p >

      <UploadBox
        label="1) Accessory"
        description="Buckle / logo / ornament"
      />

      <UploadBox
        label="2) Material"
        description="Leather / fabric / texture"
      />

      <UploadBox
        label="3) Sole / bottom (optional)"
        description="Sole reference image"
      />

      <UploadBox
        label="4) Inspiration (optional)"
        description="Style reference"
      />
    </div>
  );
}