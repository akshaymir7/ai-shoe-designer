'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  label: string;
  required?: boolean;
  optional?: boolean;
  file: File | null;
  onChange: React.Dispatch<React.SetStateAction<File | null>>;
  accept?: string;
  hint?: string;
  disabled?: boolean;
};

export default function UploadBox({
  label,
  required,
  optional,
  file,
  onChange,
  accept = 'image/png,image/jpeg,image/webp',
  hint,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const badge = useMemo(() => {
    if (required) return { text: 'Required', cls: 'ub_badge ub_badgeReq' };
    if (optional) return { text: 'Optional', cls: 'ub_badge ub_badgeOpt' };
    return null;
  }, [required, optional]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pickFile() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function setFromFileList(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    onChange(f);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFromFileList(e.target.files);
    // allow selecting same file again
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    setFromFileList(e.dataTransfer.files);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function removeFile() {
    if (disabled) return;
    onChange(null);
  }

  return (
    <div className="ub_wrap">
      <div className="ub_top">
        <div className="ub_labelRow">
          <div className="ub_label">{label}</div>
          {badge && <div className={badge.cls}>{badge.text}</div>}
        </div>
        {hint ? <div className="ub_hint">{hint}</div> : null}
      </div>

      <div
        className={[
          'ub_drop',
          isDragOver ? 'ub_dropDrag' : '',
          disabled ? 'ub_dropDisabled' : '',
          file ? 'ub_dropHasFile' : '',
        ].join(' ')}
        role="button"
        tabIndex={0}
        onClick={pickFile}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? pickFile() : null)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="ub_input"
          onChange={onInputChange}
          disabled={disabled}
        />

        {!file ? (
          <div className="ub_empty">
            <div className="ub_emptyTitle">Click to upload</div>
            <div className="ub_emptySub">PNG / JPEG / WEBP</div>
            <div className="ub_emptySub2">or drag &amp; drop</div>
          </div>
        ) : (
          <div className="ub_filled">
            <div className="ub_thumbWrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              < img className="ub_thumb" src={previewUrl ?? ''} alt="preview" />
            </div>

            <div className="ub_fileMeta">
              <div className="ub_fileName" title={file.name}>
                {file.name}
              </div>
              <div className="ub_fileSize">{(file.size / 1024).toFixed(1)} KB</div>
            </div>

            <button className="ub_remove" onClick={(e) => (e.stopPropagation(), removeFile())} type="button">
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}