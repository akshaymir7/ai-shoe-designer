'use client';

import React, { useMemo, useState } from 'react';
import UploadBox from '@/components/UploadBox';
import PromptWithMic from '@/components/PromptWithMic';
import ResultPanel from '@/components/ResultPanel';

export default function Page() {
  const [accessory, setAccessory] = useState<File | null>(null);
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

  function resetAll() {
    setAccessory(null);
    setMaterial(null);
    setSole(null);
    setInspiration(null);
    setPrompt('');
    setResults([]);
    setN(4);
  }

  async function handleGenerate() {
    if (!accessory || !material) {
      alert('Accessory and Material are required');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('accessory', accessory);
      fd.append('material', material);
      if (sole) fd.append('sole', sole);
      if (inspiration) fd.append('inspiration', inspiration);
      fd.append('prompt', prompt);
      fd.append('n', String(n));

      const resp = await fetch('/api/generate', { method: 'POST', body: fd });

      // Prevent JSON parse crash if server returns HTML (413 etc)
      const text = await resp.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON (${resp.status}): ${text.slice(0, 220)}`);
      }

      if (!resp.ok || !json?.ok) {
        throw new Error(json?.error || `Request failed (${resp.status})`);
      }

      const images: string[] = json.images ?? [];
      if (!images.length) throw new Error('No images returned.');
      setResults(images);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  }

  const canGenerate = !!accessory && !!material && !loading;

 return (
  <div className="page">
    <h1>AI Shoe Designer</h1>

    <p className="subtitle">
      Upload inputs, add a prompt, then generate. Accessory + Material are required.
    </p >

    <div className="actions">
      <button onClick={resetAll}>Reset</button>
      <button onClick={handleGenerate} disabled={!canGenerate || loading}>
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
              <UploadBox
                label="1) Accessory / Hardware"
                required
                file={accessory}
                onChange={setAccessory}
              />
              <UploadBox
                label="2) Upper Material"
                required
                file={material}
                onChange={setMaterial}
              />
              <UploadBox
                label="3) Sole / Bottom"
                optional
                file={sole}
                onChange={setSole}
              />
              <UploadBox
                label="4) Inspiration (optional)"
                optional
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