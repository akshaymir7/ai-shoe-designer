"use client";

import React, { useEffect, useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";

type GenerateResponse =
  | { imageBase64: string; error?: never }
  | { error: string; imageBase64?: never };

type HistoryItem = {
  id: string;
  createdAt: number;
  prompt: string;
  imageBase64: string;
};

function downloadBase64Png(base64: string, filename = "design.png") {
  const link = document.createElement("a");
  link.href = `data:image/png;base64,${base64}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function Page() {
  // 4-part inputs
  const [part1, setPart1] = useState<File | null>(null); // accessory
  const [part2, setPart2] = useState<File | null>(null); // material
  const [part3, setPart3] = useState<File | null>(null); // sole (optional)
  const [part4, setPart4] = useState<File | null>(null); // inspiration (optional)

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [resultB64, setResultB64] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedFromHistory = useMemo(() => {
    if (!selectedId) return null;
    return history.find((h) => h.id === selectedId) ?? null;
  }, [history, selectedId]);

  const canGenerate = !!part1 && !!part2 && !loading;

  // Load history from localStorage (client-side only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ai_shoe_history");
      if (!raw) return;
      const parsed = JSON.parse(raw) as HistoryItem[];
      if (Array.isArray(parsed)) setHistory(parsed.slice(0, 12));
    } catch {
      // ignore
    }
  }, []);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem("ai_shoe_history", JSON.stringify(history.slice(0, 12)));
    } catch {
      // ignore
    }
  }, [history]);

  async function callGenerateAPI() {
    setErrorMsg(null);
    setResultB64(null);

    if (!part1 || !part2) {
      setErrorMsg("Accessory + Material are required.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("accessory", part1);
      fd.append("material", part2);
      if (part3) fd.append("sole", part3);
      if (part4) fd.append("inspiration", part4);
      fd.append("prompt", prompt ?? "");

      const res = await fetch("/api/generate", { method: "POST", body: fd });

      // Sometimes proxies return HTML on errors; handle safely:
      const contentType = res.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        data = (await res.json()) as GenerateResponse;
      } else {
        const text = await res.text();
        throw new Error(
          `Server returned non-JSON (${res.status}): ${text.slice(0, 120)}`
        );
      }

      if (!res.ok) {
        throw new Error((data as any)?.error || `Request failed (${res.status})`);
      }

      if (!("imageBase64" in data) || !data.imageBase64) {
        throw new Error("No image returned from server.");
      }

      setResultB64(data.imageBase64);

      const item: HistoryItem = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        prompt: prompt ?? "",
        imageBase64: data.imageBase64,
      };

      setHistory((prev) => [item, ...prev].slice(0, 12));
      setSelectedId(item.id);
    } catch (e: any) {
      setErrorMsg(e?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setPart1(null);
    setPart2(null);
    setPart3(null);
    setPart4(null);
    setPrompt("");
    setResultB64(null);
    setErrorMsg(null);
  }

  const activeB64 = selectedFromHistory?.imageBase64 ?? resultB64;

  return (
    <main className="wrap">
      <header className="top">
        <div>
          <h1 className="h1">AI Shoe Designer</h1>
          <p className="sub">
            Upload inputs, add a prompt, then generate. Accessory + Material are required.
          </p >
        </div>

        <div className="topActions">
          <button type="button" className="btn btnGhost" onClick={clearAll}>
            Reset
          </button>
          <button
            type="button"
            className="btn btnPrimary"
            disabled={!canGenerate}
            onClick={callGenerateAPI}
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
      </header>

      <section className="grid">
        <div className="left">
          <div className="twoCol">
            <UploadBox
              title="1) Accessory"
              subtitle="Buckle / logo / ornament"
              file={part1}
              onFile={setPart1}
            />
            <UploadBox
              title="2) Material"
              subtitle="Leather / fabric / texture"
              file={part2}
              onFile={setPart2}
            />
          </div>

          <div className="twoCol">
            <UploadBox
              title="3) Sole / bottom"
              subtitle="Sole reference image"
              file={part3}
              onFile={setPart3}
              optional
            />
            <UploadBox
              title="4) Inspiration"
              subtitle="Style reference"
              file={part4}
              onFile={setPart4}
              optional
            />
          </div>

          <div className="card">
            <div className="cardTitle">Prompt (optional)</div>
            <textarea
              className="textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Use the accessory + material to design a women ballerina shoe. Use the sole for shape and inspiration for styling. Make it look like a studio product photo."
            />

            <div className="hintRow">
              <div className="muted">
                Required: <b>Accessory + Material</b>
              </div>
              <div className="muted">
                Selected:{" "}
                {[part1, part2, part3, part4].filter(Boolean).length}/4
              </div>
            </div>
          </div>

          {errorMsg ? <div className="error">{errorMsg}</div> : null}
        </div>

        <div className="right">
          <div className="card">
            <div className="resultHead">
              <div className="cardTitle">Result</div>
              <div className="resultActions">
                <button
                  type="button"
                  className="btn btnGhost"
                  disabled={!activeB64}
                  onClick={() => {
                    if (!activeB64) return;
                    downloadBase64Png(activeB64, "ai-shoe-design.png");
                  }}
                >
                  Download
                </button>
              </div>
            </div>

            {activeB64 ? (
              <a
                className="resultFrame"
                href= "_blank"
                rel="noreferrer"
                title="Open full size"
              >
                <img
                  className="resultImg"
                  src={`data:image/png;base64,${activeB64}`}
                  alt="Generated shoe"
                />
              </a >
            ) : (
              <div className="emptyResult">
                {loading ? "Generating…" : "Your generated image will appear here."}
              </div>
            )}
          </div>

          <div className="card">
            <div className="resultHead">
              <div className="cardTitle">History</div>
              <button
                type="button"
                className="btn btnGhost"
                disabled={history.length === 0}
                onClick={() => {
                  setHistory([]);
                  setSelectedId(null);
                }}
              >
                Clear
              </button>
            </div>

            {history.length === 0 ? (
              <div className="muted">No history yet. Generate once to start.</div>
            ) : (
              <div className="historyGrid">
                {history.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className={`histItem ${selectedId === h.id ? "active" : ""}`}
                    onClick={() => setSelectedId(h.id)}
                    title={h.prompt || "No prompt"}
                  >
                    <img
                      className="histThumb"
                      src={`data:image/png;base64,${h.imageBase64}`}
                      alt="History thumbnail"
                    />
                    <div className="histMeta">
                      <div className="histTime">
                        {new Date(h.createdAt).toLocaleString()}
                      </div>
                      <div className="histPrompt">
                        {(h.prompt || "No prompt").slice(0, 64)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}