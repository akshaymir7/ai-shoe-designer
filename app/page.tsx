// app/page.tsx
"use client";

import UploadBox from "./components/UploadBox";

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>
        AI Shoe Designer (Beta)
      </h1>
      <UploadBox />
    </main>
  );
}