'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
  helper?: string;
};

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export default function UploadBox({
  label,
  file,
  onChange,
  required = false,
  helper,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) return '';
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function pickFile() {
    inputRef.current?.click();
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    onChange(f);
  }

  return (
    <div className="ubx">
      <div className="ubxHead">
        <div className="ubxTitle">{label}</div>
        <span className={`ubxPill ${required ? 'req' : 'opt'}`}>
          {required ? 'REQUIRED' : 'OPTIONAL'}
        </span>
      </div>

      <div
        className={`ubxDrop ${dragOver ? 'over' : ''} ${file ? 'hasFile' : ''}`}
        onClick={pickFile}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') pickFile();
        }}
      >
        <input
          ref={inputRef}
          className="ubxInput"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {!file ? (
          <div className="ubxEmpty">
            <div className="ubxCta">Click to upload</div>
            <div className="ubxMeta">PNG / JPG / WEBP</div>
            <div className="ubxMeta">or drag & drop</div>
            {helper ? <div className="ubxHelp">{helper}</div> : null}
          </div>
        ) : (
          <div className="ubxFileRow">
            <div className="ubxThumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              < img src={previewUrl} alt={`${label} preview`} />
            </div>
            <div className="ubxFileInfo">
              <div className="ubxName">{file.name}</div>
              <div className="ubxSize">{formatBytes(file.size)}</div>
            </div>
            <button
              type="button"
              className="ubxRemove"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .ubx {
          width: 100%;
          margin: 0 0 14px 0;
        }

        .ubxHead {
          display: flex;
          align-items: Center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .ubxTitle {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.01em;
          opacity: 0.95;
        }

        .ubxPill {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.18);
          color: rgba(255, 255, 255, 0.85);
        }
        .ubxPill.req {
          border-color: rgba(255, 255, 255, 0.22);
        }
        .ubxPill.opt {
          opacity: 0.9;
        }

        .ubxDrop {
          cursor: pointer;
          border-radius: 16px;
          padding: 16px;
          border: 1px dashed rgba(255, 255, 255, 0.18);
          background: rgba(0, 0, 0, 0.18);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
          transition: border-color 160ms ease, background 160ms ease,
            transform 160ms ease;
        }

        .ubxDrop.over {
          border-color: rgba(255, 255, 255, 0.35);
          background: rgba(0, 0, 0, 0.25);
          transform: translateY(-1px);
        }

        .ubxDrop.hasFile {
          border-style: solid;
        }

        .ubxInput {
          display: none;
        }

        .ubxEmpty {
          display: grid;
          gap: 6px;
          text-align: left;
        }

        .ubxCta {
          font-size: 13px;
          font-weight: 700;
          opacity: 0.95;
        }

        .ubxMeta {
          font-size: 12px;
          opacity: 0.75;
        }

        .ubxHelp {
          margin-top: 6px;
          font-size: 12px;
          opacity: 0.7;
          line-height: 1.35;
        }

        .ubxFileRow {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ubxThumb {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          flex: 0 0 auto;
        }

        .ubxThumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ubxFileInfo {
          min-width: 0;
          flex: 1;
        }

        .ubxName {
          font-size: 13px;
          font-weight: 700;
          opacity: 0.95;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ubxSize {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 2px;
        }

        .ubxRemove {
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.18);
          color: rgba(255, 255, 255, 0.9);
          padding: 10px 14px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 120ms ease, background 120ms ease,
            border-color 120ms ease;
        }

        .ubxRemove:hover {
          background: rgba(0, 0, 0, 0.28);
          border-color: rgba(255, 255, 255, 0.24);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}