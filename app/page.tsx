"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import UploadBox from "../components/UploadBox";
import ResultPanel from "../components/ResultPanel";
import PromptWithMic from "../components/PromptWithMic";

type BgMode = "dark" | "grey";

type ApiResponse =
  | { ok: true; images: string[] }
  | { ok: false; error: string };

const SUPPORTED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function isSupportedImage(f: File | null) {
  return (
    !!f &&
    (SUPPORTED_TYPES.has(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name))
  );
}

function fileTypeLabel(f: File) {
  return f.type ? `${f.type} (${f.name})` : f.name;
}

// ✅ iOS/mobile-safe prompt cleaning
function cleanPrompt(input: string) {
  return (input ?? "")
    .normalize("NFKC")
    .replace(/\u00A0/g, " ") // NBSP
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width
    .replace(/[\u2028\u2029]/g, "\n") // iOS line/para separators
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

export default function Page() {
  const [hardware, setHardware] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState("");
  const [variations, setVariations] = useState<number>(2);

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [bgMode, setBgMode] = useState<BgMode>("dark");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const lastPromptRef = useRef<string>("");

  // keep selection valid as images change
  useEffect(() => {
    if (!images?.length) {
      setSelectedIndex(0);
      return;
    }
    setSelectedIndex((prev) => Math.min(prev, images.length - 1));
  }, [images]);

  // clear error once required files exist
  useEffect(() => {
    if (hardware && material) setErrorMsg("");
  }, [hardware, material]);

  const canGenerate = useMemo(() => {
    return Boolean(hardware && material) && !loading;
  }, [hardware, material, loading]);

  function resetAll() {
    setHardware(null);
    setMaterial(null);
    setSole(null);
    setInspiration(null);
    setPrompt("");
    setImages([]);
    setSelectedIndex(0);
    setErrorMsg("");
    lastPromptRef.current = "";
  }

  function downloadSelected() {
    const url = images[selectedIndex];
    if (!url) return;

    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-shoe-design-${selectedIndex + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function generate() {
    try {
      setErrorMsg("");

      if (!hardware || !material) {
        setErrorMsg("Accessory + Material are required.");
        return;
      }

      // Validate file types
      if (!isSupportedImage(hardware)) {
        setErrorMsg(`Unsupported hardware image: ${fileTypeLabel(hardware)}`);
        return;
      }
      if (!isSupportedImage(material)) {
        setErrorMsg(`Unsupported material image: ${fileTypeLabel(material)}`);
        return;
      }
      if (sole && !isSupportedImage(sole)) {
        setErrorMsg(`Unsupported sole image: ${fileTypeLabel(sole)}`);
        return;
      }
      if (inspiration && !isSupportedImage(inspiration)) {
        setErrorMsg(
          `Unsupported inspiration image: ${fileTypeLabel(inspiration)}`
        );
        return;
      }

      const safePrompt = cleanPrompt(prompt);
      lastPromptRef.current = safePrompt;

      setLoading(true);

      const fd = new FormData();
      fd.append("accessory", hardware);
      fd.append("material", material);
      if (sole) fd.append("sole", sole);
      if (inspiration) fd.append("inspiration", inspiration);

      fd.append("prompt", safePrompt);

      // support both server variants
      fd.append("variations", String(variations));
      fd.append("n", String(variations));

      const res = await fetch("/api/generate", { method: "POST", body: fd });

      // ✅ JSON-safe parsing (handles HTML/text like 413)
      const contentType = res.headers.get("content-type") || "";
      const raw = await res.text();

      let data: ApiResponse | null = null;
      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(raw) as ApiResponse;
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        const msg =
          (data && "error" in data && data.error) ||
          raw?.slice(0, 240) ||
          `Request failed (${res.status})`;
        setErrorMsg(msg);
        return;
      }

      if (!data) {
        setErrorMsg(raw?.slice(0, 240) || "Server returned non-JSON response.");
        return;
      }

      if (!data.ok) {
        setErrorMsg(data.error || "Generation failed.");
        return;
      }

      setImages(Array.isArray(data.images) ? data.images : []);
      setSelectedIndex(0);
    } catch (err: any) {
      setErrorMsg(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div className="headerLeft">
          <h1 className="title">AI SHOE DESIGNER</h1>
          <p className="subtitle">
            Upload references, add design notes, then generate. Hardware +
            Material are required.
          </p >
        </div>

        <div className="headerRight">
          <button className="btn" onClick={resetAll} disabled={loading}>
            Reset
          </button>
          <button className="btnPrimary" onClick={generate} disabled={!canGenerate}>
            {loading ? "Generating…" : "Generate"}
          </button>

          <div className="fieldInline">
            <div className="label">Design variations</div>
            <select
              className="select"
              value={String(variations)}
              onChange={(e) => setVariations(Number(e.target.value))}
              disabled={loading}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!!errorMsg && <div className="errorBanner">{errorMsg}</div>}
      </header>

      <main className="mainGrid">
        {/* LEFT */}
        <section className="panel">
          <div className="panelHeader">DESIGN INPUTS</div>
          <div className="panelBody">
            <div className="stack">
              <UploadBox label="Hardware" required file={hardware} onChange={setHardware} />
              <UploadBox label="Material" required file={material} onChange={setMaterial} />
              <UploadBox label="Sole" file={sole} onChange={setSole} />
              <UploadBox label="Inspiration" file={inspiration} onChange={setInspiration} />
            </div>

            <div className="promptBlock">
              <div className="label">Design notes</div>
              <PromptWithMic value={prompt} onChange={setPrompt} />
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="panel">
          <ResultPanel
            title="RESULT"
            images={images}
            loading={loading}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            bgMode={bgMode}
            onBgChange={setBgMode}
            onDownload={downloadSelected}
          />

          <div className="promptCard">
            <div className="promptCardTop">
              <div className="promptCardTitle">Prompt</div>
              <div className="promptCardSub">
                Edit prompt and regenerate using the same uploaded references.
              </div>
            </div>

            <textarea
              className="promptTextarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder='Example: "Use hardware from box 1, only texture from box 2, keep sole shape from box 3. Realistic photoshoot."'
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            <div className="promptActions">
              <button
                className="btnPrimary"
                onClick={generate}
                disabled={!canGenerate || loading}
                title="Regenerate"
              >
                Regenerate
              </button>

              <button
                className="btnGhost"
                onClick={() => setPrompt("")}
                disabled={loading}
              >
                Clear
              </button>

              {!!lastPromptRef.current && (
                <button
                  className="btn"
                  onClick={() => setPrompt(lastPromptRef.current)}
                  disabled={loading}
                  title="Restore last used prompt"
                >
                  Restore
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}