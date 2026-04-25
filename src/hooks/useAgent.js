import { useState, useCallback } from "react"
import { runExtractionAgent } from "../agent/index.js"

/**
 * State machine for the agent workflow.
 *
 * States: idle → processing → review → saving → saved | error
 *
 * This hook is the bridge between the UI and the agent.
 * It owns: the file, the timeline of agent steps, and the extracted data.
 */
export function useAgent() {
  const [state, setState] = useState("idle") // idle | processing | review | saving | saved | error
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [steps, setSteps] = useState([])   // agent timeline steps
  const [extracted, setExtracted] = useState(null)
  const [error, setError] = useState(null)

  const addStep = useCallback((step) => {
    setSteps((prev) => [...prev, { ...step, ts: Date.now() }])
  }, [])

  const processFile = useCallback(async (acceptedFile) => {
    setFile(acceptedFile)
    setSteps([])
    setExtracted(null)
    setError(null)
    setState("processing")

    // Generate preview URL
    if (acceptedFile.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(acceptedFile))
    } else {
      setPreview(null) // PDF — no preview for now
    }

    // Convert file to base64
    const base64 = await new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result.split(",")[1])
      reader.onerror = rej
      reader.readAsDataURL(acceptedFile)
    })

    try {
      const result = await runExtractionAgent(base64, acceptedFile.type, addStep)

      if (result.success) {
        setExtracted(result.data)
        setState("review")
      } else {
        setError(result.error || "Extraction failed")
        setState("error")
      }
    } catch (err) {
      setError(err.message)
      setState("error")
    }
  }, [addStep])

  const reset = useCallback(() => {
    setFile(null)
    setPreview(null)
    setSteps([])
    setExtracted(null)
    setError(null)
    setState("idle")
  }, [])

  return { state, file, preview, steps, extracted, error, processFile, reset, setExtracted }
}
