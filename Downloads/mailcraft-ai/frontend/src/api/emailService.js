/**
 * emailService.js
 * All communication with the FastAPI backend lives here.
 * The Vite proxy forwards /api/* → http://localhost:8000,
 * so no absolute URL is needed in development.
 */

const BASE = import.meta.env.VITE_API_URL ?? ''  // empty = same origin (proxied by Vite)

// ---------------------------------------------------------------------------
// Email generation (streaming)
// ---------------------------------------------------------------------------

/**
 * Stream an AI-generated email from the backend.
 *
 * @param {object}   opts
 * @param {string}   opts.prompt     - User's email request
 * @param {string}   opts.tone       - professional | friendly | formal | casual
 * @param {string}   opts.length     - Short | Medium | Long
 * @param {Function} opts.onChunk    - Called for each streamed text chunk
 * @param {Function} opts.onDone     - Called when streaming completes
 * @param {Function} opts.onError    - Called with an error message string
 * @param {AbortSignal} opts.signal  - AbortController signal to cancel
 */
export async function generateEmailStream({ prompt, tone, length, onChunk, onDone, onError, signal }) {
  let response
  try {
    response = await fetch(`${BASE}/api/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ prompt, tone, length }),
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') return
    onError?.('Network error — make sure the backend is running on port 8000.')
    return
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    onError?.(body.detail ?? `Server error ${response.status}`)
    return
  }

  const reader  = response.body.getReader()
  const decoder = new TextDecoder()
  let   buffer  = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''   // keep incomplete last line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (raw === '[DONE]') { onDone?.(); return }
        try {
          const event = JSON.parse(raw)
          if (event.type === 'text')  onChunk?.(event.text)
          if (event.type === 'error') onError?.(event.message)
        } catch { /* ignore malformed SSE */ }
      }
    }
    onDone?.()
  } catch (err) {
    if (err.name !== 'AbortError') onError?.(err.message)
  }
}

// ---------------------------------------------------------------------------
// History CRUD
// ---------------------------------------------------------------------------

export async function fetchHistory(limit = 20) {
  const res = await fetch(`${BASE}/api/history?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to load history')
  return res.json()
}

export async function saveHistoryItem({ prompt, tone, length, subject, body }) {
  const res = await fetch(`${BASE}/api/history`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ prompt, tone, length, subject, body }),
  })
  if (!res.ok) throw new Error('Failed to save email')
  return res.json()
}

export async function deleteHistoryItem(id) {
  const res = await fetch(`${BASE}/api/history/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete item')
  return res.json()
}

export async function clearAllHistory() {
  const res = await fetch(`${BASE}/api/history`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to clear history')
  return res.json()
}
