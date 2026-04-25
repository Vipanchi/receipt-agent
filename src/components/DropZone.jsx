import { useDropzone } from "react-dropzone"

const ACCEPTED = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
  "application/pdf": [],
}

export function DropZone({ onFile, disabled }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && onFile(files[0]),
    accept: ACCEPTED,
    multiple: false,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${isDragActive ? "#555" : "#ccc"}`,
        borderRadius: 12,
        padding: "3rem 2rem",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background: isDragActive ? "#f5f5f5" : "transparent",
        transition: "all 0.15s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input {...getInputProps()} />
      <div style={{ fontSize: 36, marginBottom: 12 }}>🧾</div>
      <p style={{ fontWeight: 500, margin: "0 0 4px" }}>
        {isDragActive ? "Drop it here" : "Drop a receipt or invoice"}
      </p>
      <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
        JPG, PNG, WebP, PDF · click to browse
      </p>
    </div>
  )
}
