import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { auth } from '../firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => { return onAuthStateChanged(auth, setUser) }, [])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position:'fixed', top:0, width:'100%', zIndex:900,
      padding: scrolled ? '13px 48px' : '20px 48px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      backdropFilter:'blur(24px)',
      background: scrolled ? 'rgba(5,3,16,0.95)' : 'rgba(5,3,16,0.6)',
      borderBottom:`1px solid ${scrolled?'rgba(0,229,255,0.15)':'transparent'}`,
      transition:'all 0.4s ease', direction:'rtl', fontFamily:'Heebo,sans-serif',
    }}>
      <style>{`
        @keyframes shimmer{to{background-position:200% center;}}
        .nav-link{color:rgba(255,255,255,0.65);text-decoration:none;font-size:15px;font-weight:500;transition:color 0.2s;position:relative;}
        .nav-link::after{content:'';position:absolute;bottom:-5px;right:0;width:0;height:2px;background:#00e5ff;box-shadow:0 0 8px #00e5ff;transition:width 0.3s;}
        .nav-link:hover{color:#fff;}
        .nav-link:hover::after{width:100%;}
        .nav-cta{background:transparent;color:#00e5ff;border:1.5px solid #00e5ff;cursor:pointer;padding:10px 24px;border-radius:100px;font-family:Heebo,sans-serif;font-size:15px;font-weight:600;transition:all 0.3s;box-shadow:0 0 16px rgba(0,229,255,0.35);text-shadow:0 0 8px rgba(0,229,255,0.5);}
        .nav-cta:hover{background:rgba(0,229,255,0.1);box-shadow:0 0 32px rgba(0,229,255,0.8);transform:translateY(-2px);}
        .nav-ghost{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);border-radius:10px;padding:8px 16px;font-family:Heebo,sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;text-decoration:none;display:inline-flex;align-items:center;gap:6px;}
        .nav-ghost:hover{background:rgba(0,229,255,0.1);border-color:rgba(0,229,255,0.3);color:#00e5ff;}
      `}</style>

      <Link to="/" style={{fontSize:24,fontWeight:900,letterSpacing:-1,background:'linear-gradient(90deg,#00e5ff,#b400ff,#ff2d9b)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 4s linear infinite',filter:'drop-shadow(0 0 8px rgba(0,229,255,0.4))',textDecoration:'none'}}>
        Memoriz
      </Link>

      <div style={{display:'flex',alignItems:'center',gap:28}}>
        {isHome && <>
          <a href="#how" className="nav-link">איך זה עובד</a>
          <a href="#pricing" className="nav-link">מחירים</a>
        </>}

        {user ? (
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <Link to="/dashboard" className="nav-ghost">📋 הדשבורד שלי</Link>
            <Link to="/create" className="nav-cta" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6,padding:'10px 22px',fontSize:14,borderRadius:100,border:'1.5px solid #00e5ff',color:'#00e5ff',fontWeight:700,boxShadow:'0 0 16px rgba(0,229,255,0.35)'}}>+ אירוע חדש</Link>
            <button className="nav-ghost" onClick={()=>signOut(auth).then(()=>navigate('/'))}>יציאה</button>
          </div>
        ) : (
          <div style={{display:'flex',gap:10}}>
            <Link to="/login" className="nav-ghost">כניסה</Link>
            <Link to="/login" className="nav-cta" style={{textDecoration:'none',display:'inline-flex',padding:'10px 22px',fontSize:15,borderRadius:100,border:'1.5px solid #00e5ff',color:'#00e5ff',fontWeight:700,boxShadow:'0 0 16px rgba(0,229,255,0.35)'}}>התחל חינם</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
