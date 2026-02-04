'use client';

import React, { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import PromptWithMic from '@/components/PromptWithMic';

export default function Page() {
  const [accessory, setAccessory] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [n, setN] = useState(4);

  async function handleGenerate() {
    if (!accessory || !material) {
      alert('Accessory and Material are required');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const fd = new FormData();
      fd.append('prompt', prompt);
      fd.append('n', String(n));
      fd.append('accessory', accessory);
      fd.append('material', material);

      if (sole) fd.append('sole', sole);
      if (inspiration) fd.append('inspiration', inspiration);

      const resp = await fetch('/api/generate', {
        method: 'POST',
        body: fd,
      });

      const text = await resp.text();
      const json = JSON.parse(text);

      if (!resp.ok) {
        throw new Error(json?.error || 'Generation failed');
      }

      setResults(json.images || []);
    } catch (err: any) {
      alert(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setAccessory(null);
    setMaterial(null);
    setSole(null);
    setInspiration(null);
    setPrompt('');
    setResults([]);
  }

  return (
    <div className="page">
      <h1>AI Shoe Designer</h1>
      <p className="subtitle">
        Upload inputs, add a prompt, then generate. Accessory + Material are required.
      </p >

      <div className="actions">
        <button onClick={resetAll}>Reset</button>
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>

      <div className="grid">
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
          label="4) Inspiration"
          optional
          file={inspiration}
          onChange={setInspiration}
        />
      </div>

      <PromptWithMic value={prompt} onChange={setPrompt} />

      <div className="field">
        <label>Variations</label>
        <select value={n} onChange={(e) => setN(Number(e.target.value))} disabled={loading}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>

      <div className="results">
        {loading && <p>Generating images…</p >}

        {!loading && results.length === 0 && <p className="muted">No results yet</p >}

        {!loading &&
          results.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            < img key={i} src={url} alt={`Result ${i + 1}`} className="resultImage" />
          ))}
      </div>
    </div>
  );
}