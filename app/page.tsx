// app/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import UploadBox from "../components/UploadBox";

type HistoryItem = {
  id: string;
  createdAt: number;
  prompt: string;
  preset: ShootPreset;
  variations: number;
  // stored inputs (as Files) are NOT serializable, so we keep only thumbs + prompt metadata
  thumb?: string; // data URL
  image?: string; // data URL of main result (optional)
};

type ShootPreset =
  | "Studio Product"
  | "On-Foot Model"
  | "Flatlay"
  | "Ecom Catalog"
  | "Lifestyle Outdoor";

const PRESET_TEXT: Record<ShootPreset, string> = {
  "Studio Product":
    "Studio product photo, clean background, realistic materials, sharp focus, natural proportions.",
  "On-Foot Model":
    "On-foot model shoot, natural proportions, realistic lighting, lifestyle, accurate footwear fit.",
  Flatlay:
    "Flatlay top-down shot, clean styling, soft shadows, product centered, realistic texture detail.",
  "Ecom Catalog":
    "E-commerce catalog image, centered product, clean background, consistent lighting, sharp details.",
  "Lifestyle Outdoor":
    "Lifestyle outdoor shot, natural light, subtle environment, realistic materials, premium look.",
};

// ---------- small helpers ----------
function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

// Downscale client images to avoid 413 payload issues (does not change your prompt logic).
async function downscaleImage(file: File, maxSide = 1024, quality = 0.85): Promise<File> {
  // If not an image, return as-is
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  const scale = Math.min(1, maxSide / Math.max(width, height));
  const outW = Math.round(width * scale);
  const outH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, outW, outH);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) return file;

  return new File([blob], file.name.replace(/\.(png|webp)$/i, ".jpg"), {
    type: "image/jpeg",
  });
}

function dataUrlFromB64(b64: string) {
  // OpenAI images returns base64 with no header; assume PNG
  return `data:image/png;base64,${b64}`;
}

async function fileToDataURL(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ---------- page ----------
export default function Page() {
  // Inputs
  const [accessory, setAccessory] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  // Prompt + options
  const [preset, setPreset] = useState<ShootPreset>("Studio Product");
  const [variations, setVariations] = useState<number>(4);
  const [prompt, setPrompt] = useState<string>("");

  // Result
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeImage = resultImages[activeIndex] || "";

  // Prompt editor under result (this is the feature you asked for)
  const [resultPrompt, setResultPrompt] = useState<string>(""); // what was used to generate current result
  const [editPrompt, setEditPrompt] = useState<string>(""); // editable prompt box under image

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // UX/state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  // Locks for regeneration
  const [lockAccessory, setLockAccessory] = useState(true);
  const [lockMaterial, setLockMaterial] = useState(true);
  const [lockSole, setLockSole] = useState(true);
  const [lockInspiration, setLockInspiration] = useState(true);
  const [lockPrompt, setLockPrompt] = useState(true);
  const [lockPreset, setLockPreset] = useState(true);

  // Mobile UX toggles
  const [showResult, setShowResult] = useState(true);
  const [showHistory, setShowHistory] = useState(true);

  // Remember last successful generation payload pieces so "Regenerate" never changes gen quality logic.
  const lastPayloadRef = useRef<{
    accessory: File | null;
    material: File | null;
    sole: File | null;
    inspiration: File | null;
    preset: ShootPreset;
    variations: number;
    prompt: string;
  } | null>(null);

  const selectedCount = useMemo(() => {
    return [accessory, material, sole, inspiration].filter(Boolean).length;
  }, [accessory, material, sole, inspiration]);

  const requiredOk = !!accessory && !!material;

  const composedPrompt = useMemo(() => {
    const presetText = PRESET_TEXT[preset];
    const userText = (prompt || "").trim();
    // Keep it simple: preset line + user prompt
    if (!userText) return presetText;
    return `${presetText}\n\n${userText}`;
  }, [preset, prompt]);

  // Whenever we have a new resultPrompt, default editPrompt to it.
  useEffect(() => {
    if (resultPrompt) setEditPrompt(resultPrompt);
  }, [resultPrompt]);

  async function generateNow(override?: Partial<{
    accessory: File | null;
    material: File | null;
    sole: File | null;
    inspiration: File | null;
    preset: ShootPreset;
    variations: number;
    prompt: string;
  }>) {
    setError("");
    if (!requiredOk) {
      setError("Accessory + Material are required.");
      return;
    }

    const payload = {
      accessory,
      material,
      sole,
      inspiration,
      preset,
      variations,
      prompt: composedPrompt,
      ...override,
    };

    // store last payload for regeneration controls
    lastPayloadRef.current = { ...payload };

    setBusy(true);
    try {
      const fd = new FormData();

      // IMPORTANT: keep payload exactly same style as before (files + text fields)
      if (payload.accessory) fd.append("accessory", await downscaleImage(payload.accessory));
      if (payload.material) fd.append("material", await downscaleImage(payload.material));
      if (payload.sole) fd.append("sole", await downscaleImage(payload.sole));
      if (payload.inspiration) fd.append("inspiration", await downscaleImage(payload.inspiration));

      fd.append("prompt", payload.prompt);
      fd.append("preset", payload.preset);
      fd.append("variations", String(payload.variations));

      const res = await fetch("/api/generate", { method: "POST", body: fd });

      // If server returns HTML error page, this avoids "non-JSON"
      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON (${res.status})`);
      }

      if (!res.ok || !json?.ok) {
        throw new Error(json?.detail || json?.error || `Request failed (${res.status})`);
      }

      const imagesB64: string[] = Array.isArray(json.images) ? json.images : [];
      const imgs = imagesB64.map(dataUrlFromB64);

      setResultImages(imgs);
      setActiveIndex(0);

      // Set the "prompt used for this result"
      setResultPrompt(payload.prompt);

      // Add to history (thumb from first image)
      const newItem: HistoryItem = {
        id: uid(),
        createdAt: Date.now(),
        prompt: payload.prompt,
        preset: payload.preset,
        variations: payload.variations,
        thumb: imgs[0],
        image: imgs[0],
      };
      setHistory((h) => [newItem, ...h].slice(0, 25));
      setShowResult(true);
      setShowHistory(true);
    } catch (e: any) {
      setError(e?.message || "Generate failed");
    } finally {
      setBusy(false);
    }
  }

  async function onGenerateClick() {
    await generateNow();
  }

  // This is the NEW feature: regenerate using the edited prompt under the result image
  async function onRegenerateWithEditedPrompt() {
    if (!lastPayloadRef.current) {
      // If no previous run, just generate with current composed prompt
      await generateNow({ prompt: composedPrompt });
      return;
    }

    const last = lastPayloadRef.current;

    // Decide what to lock / reuse
    const nextAccessory = lockAccessory ? last.accessory : accessory;
    const nextMaterial = lockMaterial ? last.material : material;
    const nextSole = lockSole ? last.sole : sole;
    const nextInspiration = lockInspiration ? last.inspiration : inspiration;
    const nextPreset = lockPreset ? last.preset : preset;
    const nextPrompt = lockPrompt ? (editPrompt || last.prompt) : composedPrompt;

    await generateNow({
      accessory: nextAccessory,
      material: nextMaterial,
      sole: nextSole,
      inspiration: nextInspiration,
      preset: nextPreset,
      variations,
      prompt: nextPrompt,
    });
  }

  function resetAll() {
    setAccessory(null);
    setMaterial(null);
    setSole(null);
    setInspiration(null);
    setPrompt("");
    setPreset("Studio Product");
    setVariations(4);
    setResultImages([]);
    setActiveIndex(0);
    setResultPrompt("");
    setEditPrompt("");
    setError("");
  }

  async function downloadActive() {
    if (!activeImage) return;
    const a = document.createElement("a");
    a.href = activeImage;
    a.download = `ai-shoe-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // UI polish
  const styles: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      background:
        "radial-gradient(1200px 800px at 20% 0%, rgba(35, 120, 80, 0.18), transparent 50%), radial-gradient(900px 700px at 90% 10%, rgba(70, 90, 160, 0.18), transparent 55%), #0b0f14",
      color: "#e8eef7",
      padding: 16,
      boxSizing: "border-box",
    },
    container: {
      maxWidth: 1220,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1.15fr 0.85fr",
      gap: 16,
    },
    card: {
      background: "rgba(17, 22, 30, 0.72)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: 16,
      backdropFilter: "blur(10px)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    },
    headerRow: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 12,
    },
    title: { fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: 0.2 },
    subtitle: { margin: "6px 0 0", opacity: 0.85, lineHeight: 1.35 },
    headerButtons: { display: "flex", gap: 10, alignItems: "center" },
    btn: {
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(255,255,255,0.06)",
      color: "#e8eef7",
      padding: "10px 14px",
      fontWeight: 700,
      cursor: "pointer",
    },
    btnPrimary: {
      borderRadius: 12,
      border: "1px solid rgba(65, 210, 140, 0.45)",
      background: "rgba(35, 120, 80, 0.35)",
      color: "#e8eef7",
      padding: "10px 16px",
      fontWeight: 800,
      cursor: "pointer",
    },
    btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginTop: 12,
    },
    sectionTitle: { fontSize: 14, fontWeight: 800, opacity: 0.9, margin: "14px 0 8px" },
    promptBox: {
      width: "100%",
      minHeight: 110,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(0,0,0,0.25)",
      color: "#e8eef7",
      padding: 12,
      resize: "vertical",
      outline: "none",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 13,
      lineHeight: 1.35,
      boxSizing: "border-box",
    },
    row: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
    label: { fontSize: 12, opacity: 0.85, fontWeight: 700 },
    select: {
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(0,0,0,0.25)",
      color: "#e8eef7",
      padding: "10px 12px",
      fontWeight: 700,
      outline: "none",
    },
    chip: {
      borderRadius: 999,
      padding: "6px 10px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      fontSize: 12,
      fontWeight: 800,
      opacity: 0.95,
    },
    danger: {
      marginTop: 12,
      padding: "12px 14px",
      borderRadius: 14,
      border: "1px solid rgba(255, 80, 80, 0.35)",
      background: "rgba(160, 35, 35, 0.18)",
      color: "#ffd8d8",
      fontWeight: 700,
    },
    resultWrap: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    resultHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    resultFrame: {
      width: "100%",
      aspectRatio: "1 / 1",
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(0,0,0,0.22)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    resultImg: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      display: "block",
    },
    thumbsRow: {
      display: "flex",
      gap: 8,
      overflowX: "auto",
      paddingBottom: 4,
    },
    thumbBtn: {
      width: 56,
      height: 56,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      overflow: "hidden",
      cursor: "pointer",
      flex: "0 0 auto",
    },
    thumbImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    locksWrap: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 10,
      marginTop: 8,
    },
    lock: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 10px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.05)",
      fontWeight: 800,
      fontSize: 12,
      userSelect: "none",
    },
    footerToggles: { display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" },
    // Mobile responsive: stack columns
    mobileStack: {
      gridTemplateColumns: "1fr",
    },
  };

  const isNarrow = typeof window !== "undefined" ? window.innerWidth < 980 : false;

  // keep variations in sane range
  useEffect(() => {
    setVariations((v) => clamp(v, 1, 8));
  }, []);

  return (
    <div style={styles.page}>
      <div style={{ ...styles.container, ...(isNarrow ? styles.mobileStack : {}) }}>
        {/* LEFT: inputs */}
        <div style={styles.card}>
          <div style={styles.headerRow}>
            <div>
              <h1 style={styles.title}>AI Shoe Designer</h1>
              <p style={styles.subtitle}>
                Upload inputs, add a prompt, then generate. <b>Accessory + Material</b> are required.
              </p>
            </div>
            <div style={styles.headerButtons}>
              <button style={styles.btn} onClick={resetAll} disabled={busy}>
                Reset
              </button>
              <button
                style={{
                  ...styles.btnPrimary,
                  ...(busy || !requiredOk ? styles.btnDisabled : {}),
                }}
                onClick={onGenerateClick}
                disabled={busy || !requiredOk}
              >
                {busy ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>

          <div style={styles.grid}>
            <UploadBox
              title="1) Accessory"
              subtitle="Buckle / logo / ornament"
              file={accessory}
              onFile={setAccessory}
            />
            <UploadBox
              title="2) Material"
              subtitle="Leather / fabric / texture"
              file={material}
              onFile={setMaterial}
            />
            <UploadBox
              title="3) Sole / bottom (optional)"
              subtitle="Sole reference image"
              file={sole}
              onFile={setSole}
            />
            <UploadBox
              title="4) Inspiration (optional)"
              subtitle="Style reference"
              file={inspiration}
              onFile={setInspiration}
            />
          </div>

          <div style={styles.sectionTitle}>Prompt (optional)</div>

          <div style={styles.row}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 240px" }}>
              <span style={styles.label}>Shoot preset</span>
              <select
                style={styles.select}
                value={preset}
                onChange={(e) => setPreset(e.target.value as ShootPreset)}
                disabled={busy}
              >
                {Object.keys(PRESET_TEXT).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 160px" }}>
              <span style={styles.label}>Variations</span>
              <select
                style={styles.select}
                value={variations}
                onChange={(e) => setVariations(parseInt(e.target.value || "4", 10))}
                disabled={busy}
              >
                {[1, 2, 3, 4, 6, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.chip}>Selected: {selectedCount}/4</div>
          </div>

          <div style={{ marginTop: 10 }}>
            <textarea
              style={styles.promptBox}
              placeholder="Describe what to make. Tip: specify what to take from each input (accessory/material/sole/style)."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={busy}
            />
          </div>

          <div style={{ marginTop: 10, opacity: 0.85, fontSize: 12 }}>
            Required: <b>Accessory + Material</b>
          </div>

          {!!error && <div style={styles.danger}>{error}</div>}

          {/* Mobile toggles */}
          {isNarrow && (
            <div style={styles.footerToggles}>
              <button style={styles.btn} onClick={() => setShowResult((v) => !v)}>
                {showResult ? "Hide Result" : "Show Result"}
              </button>
              <button style={styles.btn} onClick={() => setShowHistory((v) => !v)}>
                {showHistory ? "Hide History" : "Show History"}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: result + history */}
        <div style={styles.card}>
          <div style={styles.resultWrap}>
            {/* Result */}
            {(!isNarrow || showResult) && (
              <>
                <div style={styles.resultHeader}>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>Result</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={styles.btn} onClick={downloadActive} disabled={!activeImage}>
                      Download
                    </button>
                  </div>
                </div>

                <div style={styles.resultFrame}>
                  {activeImage ? (
                    <img src={activeImage} alt="Result" style={styles.resultImg} />
                  ) : (
                    <div style={{ opacity: 0.7, fontWeight: 800 }}>Generate to see results here.</div>
                  )}
                </div>

                {/* variations thumbnails */}
                {resultImages.length > 1 && (
                  <div style={styles.thumbsRow}>
                    {resultImages.map((src, i) => (
                      <button
                        key={i}
                        style={{
                          ...styles.thumbBtn,
                          outline: i === activeIndex ? "2px solid rgba(65,210,140,0.7)" : "none",
                        }}
                        onClick={() => setActiveIndex(i)}
                        title={`Variation ${i + 1}`}
                      >
                        <img src={src} alt={`v${i + 1}`} style={styles.thumbImg} />
                      </button>
                    ))}
                  </div>
                )}

                {/* ✅ NEW: Prompt editor under generated image */}
                <div style={{ marginTop: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, opacity: 0.9 }}>
                      Edit prompt for this result
                    </div>
                    <button
                      style={{
                        ...styles.btnPrimary,
                        ...(busy || !requiredOk ? styles.btnDisabled : {}),
                        padding: "10px 14px",
                      }}
                      onClick={onRegenerateWithEditedPrompt}
                      disabled={busy || !requiredOk}
                      title="Regenerate using the edited prompt below (without changing image-generation quality logic)"
                    >
                      {busy ? "Regenerating..." : "Regenerate"}
                    </button>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <textarea
                      style={{ ...styles.promptBox, minHeight: 120 }}
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="This is the exact prompt used for the current result. Edit it and press Regenerate."
                      disabled={busy}
                    />
                  </div>

                  {/* Locks */}
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85, fontWeight: 800 }}>
                    Regenerate locks
                  </div>
                  <div style={styles.locksWrap}>
                    <label style={styles.lock}>
                      <input
                        type="checkbox"
                        checked={lockAccessory}
                        onChange={(e) => setLockAccessory(e.target.checked)}
                      />
                      Accessory
                    </label>
                    <label style={styles.lock}>
                      <input
                        type="checkbox"
                        checked={lockMaterial}
                        onChange={(e) => setLockMaterial(e.target.checked)}
                      />
                      Material
                    </label>
                    <label style={styles.lock}>
                      <input
                        type="checkbox"
                        checked={lockSole}
                        onChange={(e) => setLockSole(e.target.checked)}
                      />
                      Sole
                    </label>
                    <label style={styles.lock}>
                      <input
                        type="checkbox"
                        checked={lockInspiration}
                        onChange={(e) => setLockInspiration(e.target.checked)}
                      />
                      Inspiration
                    </label>
                    <label style={styles.lock}>
                      <input
                        type="checkbox"
                        checked={lockPrompt}
                        onChange={(e) => setLockPrompt(e.target.checked)}
                      />
                      Prompt
                    </label>
                    <label style={styles.lock}>
                      <input
                        type="checkbox"
                        checked={lockPreset}
                        onChange={(e) => setLockPreset(e.target.checked)}
                      />
                      Preset
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* History */}
            {(!isNarrow || showHistory) && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>History</div>
                  <button style={styles.btn} onClick={() => setHistory([])} disabled={busy}>
                    Clear
                  </button>
                </div>

                {history.length === 0 ? (
                  <div style={{ opacity: 0.65, fontWeight: 700 }}>
                    No history yet. Generate to save it here.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {history.map((h) => (
                      <div
                        key={h.id}
                        style={{
                          border: "1px solid rgba(255,255,255,0.10)",
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 16,
                          padding: 12,
                          display: "grid",
                          gridTemplateColumns: "72px 1fr",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: 14,
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "rgba(0,0,0,0.25)",
                          }}
                        >
                          {h.thumb ? (
                            <img
                              src={h.thumb}
                              alt="thumb"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ fontSize: 12, opacity: 0.7, padding: 10 }}>thumb</div>
                          )}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <div style={{ opacity: 0.85, fontWeight: 800, fontSize: 12 }}>
                              {new Date(h.createdAt).toLocaleString()}
                            </div>
                            <div style={styles.chip}>{h.preset}</div>
                          </div>

                          <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.35 }}>
                            {h.prompt.length > 120 ? h.prompt.slice(0, 120) + "…" : h.prompt}
                          </div>

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                              style={styles.btn}
                              onClick={() => {
                                // Load this prompt into editor + main prompt (so user can continue iterating)
                                setResultPrompt(h.prompt);
                                setEditPrompt(h.prompt);
                                setPrompt(h.prompt.replace(PRESET_TEXT[h.preset] + "\n\n", ""));
                                setPreset(h.preset);
                                setShowResult(true);
                              }}
                            >
                              Load prompt
                            </button>
                            <button
                              style={styles.btn}
                              onClick={() => {
                                if (h.image) {
                                  setResultImages([h.image]);
                                  setActiveIndex(0);
                                  setResultPrompt(h.prompt);
                                  setEditPrompt(h.prompt);
                                  setShowResult(true);
                                }
                              }}
                              disabled={!h.image}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
