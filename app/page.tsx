"use client";

import React, { useEffect, useMemo, useState } from "react";
import UploadBox from "./components/UploadBox";

type Item = { label: string; file: File | null; clear: () => void };

export default function Page() {
  const [part1, setPart1] = useState<File | null>(null);
  const [part2, setPart2] = useState<File | null>(null);
  const [part3, setPart3] = useState<File | null>(null);
  const [part4, setPart4] = useState<File | null>(null);

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const items: Item[] = useMemo(
    () => [
      { label: "Accessory", file: part1, clear: () => setPart1(null) },
      { label: "Material", file: part2, clear: () => setPart2(null) },
      { label: "Sole / bottom", file: part3, clear: () => setPart3(null) },
      { label: "Inspiration", file: part4, clear: () => setPart4(null) },
    ],
    [part1, part2, part3, part4]
  );

  const canGenerate = !!part1 && !!part2 && prompt.trim().length > 0 && !isGenerating;

  async function onGenerate() {
    if (!canGenerate) return;
    setIsGenerating(true);

    // Mock generation for now (we’ll hook OpenAI next)
    await new Promise((r) => setTimeout(r, 2200));

    // Create a simple “result” preview using one of the uploaded images (material)
    // (So the UI feels real before we wire AI.)
    if (part2) {
      const url = URL.createObjectURL(part2);
      // Revoke previous result url if any
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(url);
    }

    setIsGenerating(false);
  }

  // Cleanup resultUrl on unmount
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>AI Shoe Designer</h1>
          <p style={styles.sub}>
            Upload inputs → write a prompt → generate. (AI wiring comes next)
          </p>
        </div>
        <div style={styles.badge}>Beta</div>
      </div>

      <div style={styles.grid}>
        <UploadBox title="1) Accessory" subtitle="Buckle / logo / ornament" onFile={setPart1} />
        <UploadBox title="2) Material" subtitle="Leather / fabric / texture" onFile={setPart2} />
        <UploadBox title="3) Sole / bottom (optional)" subtitle="Sole reference image" onFile={setPart3} />
        <UploadBox title="4) Inspiration (optional)" subtitle="Style reference" onFile={setPart4} />
      </div>

      <ThumbnailStrip items={items} />

      <div style={styles.twoCol}>
        {/* Left: Prompt + Generate */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Prompt</div>
          <div style={styles.cardHint}>
            Be specific: style, heel height, toe shape, mood, materials, branding.
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Minimal premium slide sandal. Matte black leather upper, brushed metal buckle, thin outsole, rounded toe. Studio lighting, product shot."
            style={styles.textarea}
            rows={4}
          />

          <div style={styles.actions}>
            <div style={styles.requirements}>
              Required: <b>Accessory</b> + <b>Material</b> + <b>Prompt</b>
            </div>

            <button
              onClick={onGenerate}
              disabled={!canGenerate}
              style={{
                ...styles.primaryBtn,
                ...(canGenerate ? {} : styles.primaryBtnDisabled),
              }}
            >
              {isGenerating ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <Spinner />
                  Generating…
                </span>
              ) : (
                "Generate Design"
              )}
            </button>
          </div>
        </div>

        {/* Right: Result preview */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Result</div>
          <div style={styles.cardHint}>This will show the AI output. For now it previews your uploaded material.</div>

          <div style={styles.resultBox}>
            {resultUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resultUrl}
                alt="result"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={styles.resultEmpty}>
                <div style={styles.resultEmptyTitle}>No result yet</div>
                <div style={styles.resultEmptySub}>Upload Accessory + Material, write a prompt, then Generate.</div>
              </div>
            )}
          </div>

          <div style={styles.smallRow}>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() => {
                if (resultUrl) URL.revokeObjectURL(resultUrl);
                setResultUrl(null);
              }}
              disabled={!resultUrl || isGenerating}
            >
              Clear Result
            </button>

            <div style={styles.mutedSmall}>
              {isGenerating ? "Working…" : resultUrl ? "Ready" : "Idle"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Thumbnail strip ---------------- */

function ThumbnailStrip({ items }: { items: Item[] }) {
  const selected = items.filter((i) => i.file);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    selected.forEach((i) => {
      if (i.file) next[i.label] = URL.createObjectURL(i.file);
    });
    setUrls(next);

    return () => {
      Object.values(next).forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.file?.name + i.file?.size + i.file?.lastModified).join("|")]);

  if (selected.length === 0) return null;

  return (
    <div style={{ marginTop: 22 }}>
      <div style={styles.stripHeader}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>Selected ({selected.length}/4)</div>
        <button
          onClick={() => items.forEach((i) => i.clear())}
          style={styles.secondaryBtn}
          type="button"
        >
          Clear all
        </button>
      </div>

      <div style={styles.stripRow}>
        {selected.map((i) => (
          <div key={i.label} style={styles.thumbCard}>
            <div style={styles.thumbImgWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urls[i.label]}
                alt={i.label}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{i.label}</div>
              <div style={styles.ellipsis} title={i.file?.name || ""}>
                {i.file?.name}
              </div>
              <button
                onClick={i.clear}
                style={{ ...styles.secondaryBtn, width: "100%", marginTop: 8 }}
                type="button"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Tiny spinner ---------------- */

function Spinner() {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.35)",
        borderTopColor: "white",
        display: "inline-block",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}

/* ---------------- Styles ---------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 28,
    maxWidth: 1100,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
  },
  h1: { fontSize: 28, fontWeight: 750, margin: 0, letterSpacing: "-0.02em" },
  sub: { color: "#64748b", margin: "8px 0 0", fontSize: 14 },
  badge: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15, 23, 42, 0.12)",
    background: "rgba(15, 23, 42, 0.04)",
    color: "#0f172a",
    fontWeight: 650,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
    marginTop: 18,
  },

  stripHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  stripRow: {
    display: "flex",
    gap: 12,
    overflowX: "auto",
    paddingBottom: 6,
  },
  thumbCard: {
    minWidth: 190,
    borderRadius: 16,
    border: "1px solid rgba(15, 23, 42, 0.10)",
    background: "white",
    boxShadow: "0 10px 28px rgba(2, 6, 23, 0.06)",
    overflow: "hidden",
  },
  thumbImgWrap: {
    height: 110,
    background: "rgba(2,6,23,0.03)",
  },
  ellipsis: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 18,
  },

  card: {
    border: "1px solid rgba(15, 23, 42, 0.10)",
    borderRadius: 18,
    background: "white",
    padding: 16,
    boxShadow: "0 10px 28px rgba(2, 6, 23, 0.06)",
  },
  cardTitle: { fontWeight: 750, fontSize: 14, marginBottom: 6 },
  cardHint: { color: "#64748b", fontSize: 12, marginBottom: 10 },

  textarea: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid rgba(15, 23, 42, 0.12)",
    padding: 12,
    fontSize: 13,
    outline: "none",
    resize: "vertical",
    background: "rgba(2,6,23,0.02)",
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  requirements: { fontSize: 12, color: "#64748b" },

  primaryBtn: {
    border: "none",
    borderRadius: 14,
    padding: "12px 16px",
    background: "#0f172a",
    color: "white",
    fontWeight: 750,
    cursor: "pointer",
    minWidth: 170,
  },
  primaryBtnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  secondaryBtn: {
    border: "1px solid rgba(15, 23, 42, 0.12)",
    background: "white",
    borderRadius: 12,
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 650,
  },

  resultBox: {
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(15, 23, 42, 0.10)",
    height: 330,
    background: "rgba(2,6,23,0.02)",
  },
  resultEmpty: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
    textAlign: "center",
    gap: 6,
  },
  resultEmptyTitle: { fontWeight: 800, fontSize: 14, color: "#0f172a" },
  resultEmptySub: { fontSize: 12, color: "#64748b" },

  smallRow: {
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  mutedSmall: { color: "#64748b", fontSize: 12 },
};

// Spinner keyframes (inline CSS injection)
if (typeof document !== "undefined") {
  const id = "spin-keyframes";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
}
