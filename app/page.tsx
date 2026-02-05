'use client';

import { useMemo, useState } from 'react';
import UploadBox from '@/components/UploadBox';
import ResultPanel from '@/components/ResultPanel';
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

  const canGenerate = !!accessory && !!material && !loading;

  const presetHint = useMemo(() => {
    return `Example:
"Use the buckle from image 1.
Use only the material texture from image 2.
Keep the sole shape from image 3.
Make a ladies ballerina.
Realistic photoshoot."`;
  }, []);

  async function handleGenerate() {
    if (!canGenerate) return;

    setLoading(true);
    setResults([]);

    try {
      // TODO: replace with your real API call
      await new Promise((r) => setTimeout(r, 1500));

      // mock images for now
      setResults([
        '/mock/result1.jpg',
        '/mock/result2.jpg',
        '/mock/result3.jpg',
        '/mock/result4.jpg',
      ].slice(0, n));
    } catch (err) {
      console.error(err);
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
        <button onClick={handleGenerate} disabled={!canGenerate}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid">
        {/* LEFT COLUMN */}
        <div className="left">
          <div className="panel">
            <div className="panelHeader">Design inputs</div>
            <div className="panelBody">
              <div className="stack">
                <UploadBox
                  label="Accessory / Hardware"
                  file={accessory}
                  onChange={setAccessory}
                  required
                />

                <UploadBox
                  label="Upper Material"
                  file={material}
                  onChange={setMaterial}
                  required
                />

                <UploadBox
                  label="Sole / Bottom"
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

        {/* RIGHT COLUMN */}
        <div className="right">
          <ResultPanel
  title="Result"
  loading={loading}
  images={results}
  emptyText="No results yet"
  stageHeight={480}
/>
        </div>
      </div>
    </div>
  );
}