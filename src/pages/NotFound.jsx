import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 8 }}>404</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 17, marginBottom: 28 }}>הדף לא נמצא</p>
        <Link to="/" className="btn-primary">חזרה לדף הבית</Link>
      </div>
    </div>
  )
}
