"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
};

type SpeechRecognitionType = any;

export default function PromptWithMic({
  value,
  onChange,
  placeholder,
  rows = 6,
}: Props) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("");

  const recRef = useRef<SpeechRecognitionType | null>(null);

  // Detect Web Speech API (Chrome / Edge)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SR) {
      setSupported(false);
      return;
    }

    setSupported(true);

    const rec = new SR();
    rec.lang = "en-US"; // change to "en-IN" if you want
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
      setListening(true);
      setStatus("Listening…");
    };

    rec.onerror = (e: any) => {
      setStatus(e?.error ? `Mic error: ${e.error}` : "Mic error");
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
      setStatus("");
    };

    rec.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) finalText += chunk;
        else interimText += chunk;
      }

      if (finalText.trim()) {
        const prefix = value.trim().length ? value.trimEnd() + " " : "";
        onChange(prefix + finalText.trim());
      }

      if (interimText.trim()) {
        setStatus(`Listening… ${interimText}`);
      }
    };

    recRef.current = rec;

    return () => {
      rec.stop?.();
    };
  }, [onChange, value]);

  const toggleMic = () => {
    if (!recRef.current) return;

    if (listening) {
      recRef.current.stop();
    } else {
      setStatus("");
      recRef.current.start();
    }
  };

  return (
    <div style={styles.wrapper}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={styles.textarea}
      />

      <div style={styles.footer}>
        <div style={styles.status}>
          {supported ? status || "🎙️ You can dictate your prompt" : "🎤 Mic not supported"}
        </div>

        {supported && (
          <button
            type="button"
            onClick={toggleMic}
            style={{
              ...styles.micBtn,
              ...(listening ? styles.micBtnActive : {}),
            }}
          >
            {listening ? "Stop 🎤" : "Speak 🎙️"}
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  textarea: {
    width: "100%",
    minHeight: 110,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.92)",
    padding: 12,
    outline: "none",
    resize: "vertical",
    fontSize: 14,
    lineHeight: 1.5,
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  status: {
    fontSize: 12,
    opacity: 0.75,
  },

  micBtn: {
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: 13,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
  },

  micBtnActive: {
    background: "rgba(0,200,120,0.25)",
    border: "1px solid rgba(0,200,120,0.6)",
  },
};