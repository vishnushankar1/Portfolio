/**
 * useEmailGenerator.js
 * Manages all state for one email generation session:
 * streaming text, parsed subject/body, status, and errors.
 */

import { useCallback, useRef, useState } from 'react'
import { generateEmailStream, saveHistoryItem } from '../api/emailService'

// ---------------------------------------------------------------------------
// Parse the raw streamed text into { subject, body }
// ---------------------------------------------------------------------------
function parseEmail(raw) {
  const subjectMatch = raw.match(/^Subject:\s*(.+)/m)
  if (!subjectMatch) return { subject: '', body: raw }

  const subject    = subjectMatch[1].trim()
  const afterSubj  = raw.slice(raw.indexOf(subjectMatch[0]) + subjectMatch[0].length)
  const body       = afterSubj.replace(/^\s+/, '')   // strip leading whitespace / blank lines
  return { subject, body }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * @returns {{
 *   status:   'idle'|'generating'|'done'|'error',
 *   subject:  string,
 *   body:     string,
 *   error:    string,
 *   generate: (params: { prompt, tone, length }) => void,
 *   stop:     () => void,
 *   reset:    () => void,
 *   loadEmail: (params: { subject, body }) => void,
 * }}
 */
export function useEmailGenerator() {
  const [status,  setStatus]  = useState('idle')
  const [subject, setSubject] = useState('')
  const [body,    setBody]    = useState('')
  const [error,   setError]   = useState('')

  const abortRef = useRef(null)

  // ---- generate --------------------------------------------------------
  const generate = useCallback(async ({ prompt, tone, length }) => {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('generating')
    setSubject('')
    setBody('')
    setError('')

    let accumulated = ''

    await generateEmailStream({
      prompt,
      tone,
      length,
      signal: controller.signal,

      onChunk(text) {
        accumulated += text
        const { subject: s, body: b } = parseEmail(accumulated)
        setSubject(s)
        setBody(b)
      },

      async onDone() {
        const { subject: s, body: b } = parseEmail(accumulated)
        setSubject(s)
        setBody(b)
        setStatus('done')

        // Persist to backend (fire-and-forget; errors are non-critical)
        try {
          await saveHistoryItem({ prompt, tone, length, subject: s, body: b })
        } catch (e) {
          console.warn('Could not save to history:', e.message)
        }
      },

      onError(message) {
        setError(message)
        setStatus('error')
      },
    })
  }, [])

  // ---- stop streaming --------------------------------------------------
  const stop = useCallback(() => {
    abortRef.current?.abort()
    setStatus('done')
  }, [])

  // ---- reset to idle ---------------------------------------------------
  const reset = useCallback(() => {
    abortRef.current?.abort()
    setStatus('idle')
    setSubject('')
    setBody('')
    setError('')
  }, [])

  // ---- load a saved email (e.g. from history) without re-generating ----
  const loadEmail = useCallback(({ subject: s, body: b }) => {
    abortRef.current?.abort()
    setSubject(s ?? '')
    setBody(b ?? '')
    setError('')
    setStatus('done')
  }, [])

  return { status, subject, body, error, generate, stop, reset, loadEmail }
}
