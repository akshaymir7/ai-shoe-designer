'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import ResultPanel from '@/components/ResultPanel';

export default function Page() {
  const [accessory, setAccessory] = useState<File | null>(null);
  const [material, setMaterial] = useState<File | null>(null);
  const [sole, setSole] = useState<File | null>(null);
  const [inspiration, setInspiration] = useState<File | null>(null);

  const [prompt, setPrompt] = useState('');
  const [refinePrompt, setRefinePrompt] = useState('');

  const [results, setResults] = useState<string[]>([]);
  const [activeResult, setActiveResult] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  async function handleGenerate(refine = false) {
    setLoading(true);

    const form = new FormData();
    if (accessory) form.append('accessory', accessory);
    if (material) form.append('material', material);
    if (sole) form.append('sole', sole);
    if (inspiration) form.append('inspiration', inspiration);

    form.append('prompt', prompt);
    if (refine && refinePrompt && activeResult) {
      form.append('refinePrompt', refinePrompt);
      form.append('baseImage', activeResult);
    }

    const res = await fetch('/api/generate', {
      method: 'POST',
      body: form,
    });

    const json = await res.json();
    setResults(json.images || []);
    setActiveResult(null);
    setRefinePrompt('');
    setLoading(false);
  }

  return (
    <div className="page">
      <h1>AI Shoe Designer</h1>

      <div className="grid">
        <UploadBox label="Accessory / Hardware" file={accessory} onChange={setAccessory} required />
        <UploadBox label="Upper Material" file={material} onChange={setMaterial} required />
        <UploadBox label="Sole / Bottom" file={sole} onChange={setSole} />
        <UploadBox label="Inspiration" file={inspiration} onChange={setInspiration} />
      </div>

      <textarea
        className="prompt"
        placeholder="Describe the shoe you want…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button disabled={loading} onClick={() => handleGenerate(false)}>
        Generate
      </button>

      <ResultPanel
        title="Result"
        loading={loading}
        images={results}
        onSelect={setActiveResult}
      />

      {activeResult && (
        <div className="refineBox">
          <h3>Refine this result</h3>
          <textarea
            placeholder="Eg: make the sole thinner, change buckle to matte gold, show on model"
            value={refinePrompt}
            onChange={(e) => setRefinePrompt(e.target.value)}
          />
          <button disabled={loading || !refinePrompt} onClick={() => handleGenerate(true)}>
            Regenerate from this image
          </button>
        </div>
      )}
    </div>
  );
}