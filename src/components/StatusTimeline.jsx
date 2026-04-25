/**
 * StatusTimeline renders the agent's "thinking" steps in real time.
 * This is one of the most important UX patterns in agentic apps —
 * users need to see WHAT the agent is doing, not just a spinner.
 */

const STEP_ICONS = {
  start: "⏳",
  llm_response: "🤖",
  tool_call: "🔧",
  tool_result: "✅",
  done: "🎉",
  error: "❌",
}

export function StatusTimeline({ steps, state, error }) {
  if (!steps.length && state === "idle") return null

  return (
    <div style={{ margin: "1.5rem 0" }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        Agent log
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13 }}>
            <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
              {STEP_ICONS[step.type] || "•"}
            </span>
            <div style={{ flex: 1 }}>
              <span style={{ color: "#333" }}>{step.message}</span>
              {step.type === "tool_call" && step.input && (
                <pre style={{
                  margin: "4px 0 0",
                  padding: "6px 10px",
                  background: "#f5f5f5",
                  borderRadius: 6,
                  fontSize: 11,
                  overflowX: "auto",
                  color: "#555",
                }}>
                  {JSON.stringify(step.input, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}

        {state === "processing" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
            <span style={{ color: "#888" }}>Processing...</span>
          </div>
        )}

        {state === "error" && error && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13 }}>
            <span>❌</span>
            <span style={{ color: "#c0392b" }}>{error}</span>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
