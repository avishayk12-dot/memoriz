import { useState, useCallback } from 'react'

let showToastFn = null

export function useToast() {
  const [toasts, setToasts] = useState([])

  const show = useCallback((msg, type = 'success', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  return { toasts, show }
}

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' ? '✓' : '✕'} {t.msg}
        </div>
      ))}
    </div>
  )
}
