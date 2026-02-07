"use client";

import React, { useMemo, useState } from "react";
import UploadBox from "@/components/UploadBox";
import ResultPanel from "@/components/ResultPanel";

type BgMode = "dark" | "grey";

export default function Page() {
  // Inputs
  const [hardware, setHardware] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");

  // UI
  const [variations, setVariations] = useState<number>(2); // ✅ includes 1 in dropdown
  const [loading, setLoading] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  // Result panel selection + bg
  const [bgMode, setBgMode] = useState<BgMode>("dark");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

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
    setError("");
    setBgMode("dark");
  }

  async function handleGenerate() {
    setError("");

    if (!hardware || !material) {
      setError("Hardware + Material are required.");
      return;
    }

    try {
      setLoading(true);
      setImages([]);
      setSelectedIndex(0);

      const form = new FormData();

      // Files (use multiple common names so backend matches regardless)
      form.append("hardware", hardware);
      form.append("accessory", hardware); // backward compatible
      form.append("material", material);

      if (sole) form.append("sole", sole);
      if (inspiration) form.append("inspiration", inspiration);

      // Prompt
      form.append("prompt", prompt ?? "");

      // Variations: send multiple keys so API won't default to 4
      const v = String(variations);
      form.append("variations", v);
      form.append("n", v);
      form.append("num_images", v);
      form.append("numOutputs", v);
      form.append("count", v);

      // Optional: send bg mode if your API uses it (safe)
      form.append("bg", bgMode);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: form,
      });

      // Read response safely
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          `Generate failed (HTTP ${res.status}).`;
        setError(String(msg));
        return;
      }

      // Accept common shapes:
      // { images: string[] } OR { output: string[] } OR { data: string[] }
      const out: string[] =
        (data?.images as string[]) ||
        (data?.output as string[]) ||
        (data?.data as string[]) ||
        [];

      if (!Array.isArray(out) || out.length === 0) {
        setError("No images returned. Try again.");
        return;
      }

      setImages(out);
      setSelectedIndex(0);
    } catch (e: any) {
      setError(e?.message || "Something went wrong while generating.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    setError("");
    if (!images?.length) return;

    const url = images[selectedIndex] || images[0];
    if (!url) return;

    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-shoe-design-${selectedIndex + 1}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setError("Download failed. Try right-click → Save image as.");
    }
  }

  return (
    <main className="pageWrap">
      <header className="topHeader">
        <div className="brandBlock">
          <div className="brandTitle">AI SHOE DESIGNER</div>
          <div className="brandSub">
            Upload design references and generate footwear concepts instantly.
            <span className="brandReq"> Hardware + Material are required.</span>
          </div>
        </div>

        <div className="topActions">
          <button className="btn" onClick={resetAll} disabled={loading}>
            Reset
          </button>

          <button className="btnPrimary" onClick={handleGenerate} disabled={!canGenerate}>
            {loading ? "Generating..." : "Generate Designs"}
          </button>

          <div className="variationBlock">
            <div className="labelSmall">DESIGN VARIATIONS</div>
            <select
              className="select"
              value={variations}
              onChange={(e) => setVariations(Number(e.target.value))}
              disabled={loading}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
        </div>
      </header>

      {error ? (
        <div className="errorBanner" role="alert">
          {error}
        </div>
      ) : null}

      <section className="contentGrid">
        {/* LEFT */}
        <div className="panel">
          <div className="panelHeader">Design inputs</div>

          <div className="panelBody">
            <UploadBox
              label="Hardware"
              required
              file={hardware}
              onChange={setHardware}
              helper="Upload buckles, trims, or accessories"
            />

            <UploadBox
              label="Material"
              required
              file={material}
              onChange={setMaterial}
              helper="Upload leather, fabric, or surface textures"
            />

            <UploadBox
              label="Sole"
              file={sole}
              onChange={setSole}
              helper="Upload outsole or bottom references"
            />

            <UploadBox
              label="Inspiration"
              file={inspiration}
              onChange={setInspiration}
              helper="Optional references for mood, silhouette, or styling"
            />

            <div className="notesBlock">
              <div className="notesTitle">Design notes</div>
              <div className="notesHint">
                Example: “Use the buckle from image 1. Use only the material texture from image 2. Keep
                the sole shape from image 3. Make a ladies ballerina. Realistic photoshoot.”
              </div>

              <textarea
                className="textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe silhouette, vibe, and details…"
                rows={5}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="panel">
          <ResultPanel
            title="RESULT"
            images={images}
            loading={loading}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            bgMode={bgMode}
            onBgChange={setBgMode}
            onDownload={handleDownload}
          />
        </div>
      </section>
    </main>
  );
}