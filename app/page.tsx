'use client';

import React, { useMemo, useState } from 'react';
import UploadBox from '@/components/UploadBox';
import PromptWithMic from '@/components/PromptWithMic';
import ResultPanel from '@/components/ResultPanel';

export default function Page() {
  const [hardware, setHardware] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [n, setN] = useState(4);

  const presetHint = useMemo(() => {
    return `Example: "Use the buckle from image 1. Use only the material texture from image 2. Keep the sole shape from image 3. Make a ladies ballerina. Realistic photoshoot."`;
  }, []);

  const canGenerate = Boolean(accessory && material) && !loading;

  function resetAll() {
    setAccessory(null);
    setMaterial(null);
    setSole(null);
    setInspiration(null);
    setPrompt('');
    setResults([]);
    setLoading(false);
  }

  async function handleGenerate() {
    if (!accessory || !material) {
      alert('Accessory + Material are required.');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      // IMPORTANT: send multipart/form-data via FormData (do NOT set Content-Type header)
      const fd = new FormData();
      fd.append('accessory', accessory);
      fd.append('material', material);

      if (sole) fd.append('sole', sole);
      if (inspiration) fd.append('inspiration', inspiration);

      fd.append('prompt', prompt || '');
      fd.append('n', String(n));

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const msg =
          err?.error ||
          err?.message ||
          `Generate failed (${res.status})`;
        throw new Error(msg);
      }

      const data = await res.json();

      // Expecting: { images: string[] }
      const imgs = Array.isArray(data?.images) ? data.images : [];
      setResults(imgs);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Generate failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>AI Shoe Designer</h1>

      <p className="subtitle">
        Upload inputs, add a prompt, then generate. Accessory + Material are required.
      </p >

      <div className="actions">
        <button onClick={resetAll} disabled={loading}>
          Reset
        </button>

        <button onClick={handleGenerate} disabled={!canGenerate}>
          {loading ? 'Generating…' : 'Generate'}
        </button>

        <div className="field inline" style={{ marginLeft: 12 }}>
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

      <div className="grid">
        {/* LEFT */}
        <div className="left">
          <div className="panel">
            <div className="panelHeader">Design inputs</div>

            <div className="panelBody">
              <div className="stack">
                <UploadBox
  label="Hardware"
  file={accesory}
  onChange={setHardware}
/>

                <UploadBox
  label="Material"
  file={material}
  onChange={setMaterial}
/>
                <UploadBox
  label="Sole"
  file={sole}
  onChange={setSole}
/>
                <UploadBox
  label="Inspiration"
  file={inspiration}
  onChange={setInspiration}
/>
              </div>

              <div style={{ marginTop: 14 }}>
                <div className="label">Prompt (optional)</div>
                <div className="muted" style={{ marginBottom: 8 }}>
                  {presetHint}
                </div>
                <PromptWithMic value={prompt} onChange={setPrompt} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <ResultPanel
            title="Result"
            loading={loading}
            images={results}
          />
        </div>
      </div>
    </div>
  );
}