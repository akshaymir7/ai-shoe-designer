'use client';

import React, { useMemo, useState } from 'react';
import UploadBox from '@/components/UploadBox';
import PromptWithMic from '@/components/PromptWithMic';
import ResultPanel from '@/components/ResultPanel';

type GenerateResponse = {
  images: string[];
};

export default function Page() {
  const [accessory, setAccessory] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState('');
  const [n, setN] = useState(4);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const presetHint = useMemo(() => {
    return `Example: "Use the buckle from image 1. Use only the material texture from image 2. Keep the sole shape from image 3. Make a ladies ballerina. Realistic photoshoot."`;
  }, []);

  const canGenerate = useMemo(() => {
    return !!accessory && !!material && !loading;
  }, [accessory, material, loading]);

  function resetAll() {
    setAccessory(null);
    setMaterial(null);
    setSole(null);
    setInspiration(null);
    setPrompt('');
    setResults([]);
    setN(4);
  }

  async function fileToDataUrl(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  }

  async function handleGenerate() {
    if (!accessory || !material) {
      alert('Accessory and Material are required.');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      // Convert files to base64 data URLs (safe to send via JSON)
      const [accessoryDataUrl, materialDataUrl, soleDataUrl, inspirationDataUrl] = await Promise.all([
        fileToDataUrl(accessory),
        fileToDataUrl(material),
        sole ? fileToDataUrl(sole) : Promise.resolve(null),
        inspiration ? fileToDataUrl(inspiration) : Promise.resolve(null),
      ]);

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessory: accessoryDataUrl,
          material: materialDataUrl,
          sole: soleDataUrl,
          inspiration: inspirationDataUrl,
          prompt,
          n,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Generate failed (${res.status}). ${txt}`);
      }

      const data = (await res.json()) as GenerateResponse;

      if (!data?.images || !Array.isArray(data.images) || data.images.length === 0) {
        throw new Error('No images returned from API.');
      }

      // ✅ Option B: use real URLs returned by API (NO mock paths)
      setResults(data.images.slice(0, n));
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Something went wrong while generating.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>AI Shoe Designer</h1>

      <p className="subtitle">Upload inputs, add a prompt, then generate. Accessory + Material are required.</p >

      <div className="actions">
        <button onClick={resetAll}>Reset</button>
        <button onClick={handleGenerate} disabled={!canGenerate}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>

      <div className="grid">
        {/* LEFT */}
        <div className="left">
          <div className="panel">
            <div className="panelHeader">Design inputs</div>
            <div className="panelBody">
              <div className="stack">
                <UploadBox label="Accessory / Hardware" required file={accessory} onChange={setAccessory} />
                <UploadBox label="Upper Material" required file={material} onChange={setMaterial} />
                <UploadBox label="Sole / Bottom" optional file={sole} onChange={setSole} />
                <UploadBox label="Inspiration" optional file={inspiration} onChange={setInspiration} />
              </div>

              <div style={{ marginTop: 14 }}>
                <div className="label">Prompt (optional)</div>
                <div className="muted" style={{ marginBottom: 8 }}>
                  {presetHint}
                </div>
                <PromptWithMic value={prompt} onChange={setPrompt} />
              </div>

              <div className="field" style={{ marginTop: 14 }}>
                <div className="label">Variations</div>
                <select
                  className="select"
                  value={String(n)}
                  onChange={(e) => setN(Number(e.target.value))}
                  disabled={loading}
                >
                  {[1, 2, 3, 4].map((x) => (
                    <option key={x} value={String(x)}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <ResultPanel title="Result" loading={loading} images={results} />
        </div>
      </div>
    </div>
  );
}