"use client";

type UploadBoxProps = {
  label: string;
  description: string;
};

export default function UploadBox({ label, description }: UploadBoxProps) {
  return (
    <div
      style={{
        border: "1px dashed #ccc",
        borderRadius: 8,
        padding: 20,
        marginBottom: 16,
        background: "#fafafa",
      }}
    >
      <strong>{label}</strong>
      <p style={{ fontSize: 12, color: "#666" }}>{description}</p >

      <input type="file" />
    </div>
  );
}