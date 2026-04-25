import { useAgent } from "./hooks/useAgent"
import { DropZone } from "./components/DropZone"
import { StatusTimeline } from "./components/StatusTimeline"
import { ReviewForm } from "./components/ReviewForm"
import { useEffect, useState } from "react"
import { loadGoogleAPI, loadGoogleIdentity, authenticate, appendExpenseRow } from "./sheets/index.js"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function App() {
  const { state, preview, steps, extracted, error, processFile, reset, setExtracted } = useAgent()
  const [googleReady, setGoogleReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedUrl, setSavedUrl] = useState(null)

  useEffect(() => {
    Promise.all([loadGoogleAPI(), loadGoogleIdentity()]).then(() => setGoogleReady(true))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSavedUrl(null)
    try {
      await authenticate(GOOGLE_CLIENT_ID)
      const url = await appendExpenseRow(extracted)
      setSavedUrl(url)
    } catch (err) {
      alert("Failed to save: " + (err.message || JSON.stringify(err)))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Receipt Agent</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
        Stage 1 ✓ upload · Stage 2 ✓ extract · Stage 3 ✓ save to Sheets
      </p>

      {state !== "review" && (
        <DropZone onFile={processFile} disabled={state === "processing"} />
      )}

      {preview && state !== "review" && (
        <img
          src={preview}
          alt="Receipt preview"
          style={{ marginTop: 16, maxWidth: "100%", maxHeight: 300, borderRadius: 8, border: "1px solid #eee", objectFit: "contain" }}
        />
      )}

      <StatusTimeline steps={steps} state={state} error={error} />

      {state === "review" && extracted && (
        <>
          <ReviewForm
            data={extracted}
            onChange={setExtracted}
            onSave={handleSave}
            onReset={reset}
            saving={saving}
          />
          {savedUrl && (
            <div style={{ marginTop: 12, padding: "12px 16px", background: "#f0faf0", border: "1px solid #c3e6cb", borderRadius: 8, fontSize: 14 }}>
              ✅ Saved!{" "}
              <a href={savedUrl} target="_blank" rel="noreferrer" style={{ color: "#27ae60", fontWeight: 500 }}>
                Open in Google Sheets ↗
              </a>
            </div>
          )}
        </>
      )}

      {state === "error" && (
        <button
          onClick={reset}
          style={{ marginTop: 12, padding: "8px 18px", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
        >
          Try again
        </button>
      )}
    </div>
  )
}