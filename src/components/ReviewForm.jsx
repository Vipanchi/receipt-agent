const CATEGORIES = [
  "Food & dining",
  "Travel & transport",
  "Office & supplies",
  "Utilities & subscriptions",
  "Accommodation",
  "Entertainment",
  "Medical",
  "Other",
]

export function ReviewForm({ data, onChange, onSave, onReset, saving }) {
  const update = (field) => (e) =>
    onChange({ ...data, [field]: e.target.value })

  const confidence = data.confidence ?? 1
  const confColor = confidence > 0.8 ? "#27ae60" : confidence > 0.5 ? "#f39c12" : "#e74c3c"

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Review extraction</h2>
        <span style={{ fontSize: 12, color: confColor, fontWeight: 500 }}>
          {Math.round(confidence * 100)}% confidence
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={labelStyle}>
          Vendor
          <input style={inputStyle} value={data.vendor || ""} onChange={update("vendor")} />
        </label>
        <label style={labelStyle}>
          Date
          <input style={inputStyle} type="date" value={data.date || ""} onChange={update("date")} />
        </label>
        <label style={labelStyle}>
          Amount
          <input style={inputStyle} type="number" step="0.01" value={data.amount || ""} onChange={update("amount")} />
        </label>
        <label style={labelStyle}>
          Currency
          <input style={inputStyle} value={data.currency || ""} onChange={update("currency")} maxLength={3} />
        </label>
        <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
          Category
          <select style={inputStyle} value={data.category || ""} onChange={update("category")}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
          Notes
          <input style={inputStyle} value={data.notes || ""} onChange={update("notes")} />
        </label>
      </div>

      {data.line_items?.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            Line items
          </p>
          {data.line_items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}>
              <span>{item.name}</span>
              <span style={{ color: "#555" }}>{data.currency} {item.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button
          onClick={onSave}
          disabled={saving}
          style={{ flex: 1, height: 38, background: "#111", color: "#fff", border: "none", borderRadius: 8, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Saving..." : "Save to Google Sheets"}
        </button>
        <button
          onClick={onReset}
          style={{ height: 38, padding: "0 16px", background: "transparent", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}
        >
          Start over
        </button>
      </div>
    </div>
  )
}

const labelStyle = { display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#555" }
const inputStyle = { height: 34, padding: "0 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, fontFamily: "inherit", color: "#111", background: "#fafafa" }
