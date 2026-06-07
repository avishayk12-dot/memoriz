import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import {
  signInWithEmailLink, sendSignInLinkToEmail,
  isSignInWithEmailLink, onAuthStateChanged,
  GoogleAuthProvider, signInWithPopup,
  RecaptchaVerifier, signInWithPhoneNumber
} from 'firebase/auth'

export default function Login() {
  const [tab, setTab] = useState('email')
  const [emailStep, setEmailStep] = useState(1)
  const [phoneStep, setPhoneStep] = useState(1)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState('')
  const [confirmResult, setConfirmResult] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (u) navigate('/dashboard') })
    return unsub
  }, [])

  // Handle magic link return
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const saved = localStorage.getItem('emailForSignIn')
      if (saved) {
        signInWithEmailLink(auth, saved, window.location.href)
          .then(() => { localStorage.removeItem('emailForSignIn'); navigate('/dashboard') })
          .catch(e => setError('שגיאה בכניסה: ' + e.message))
      }
    }
  }, [])

  const startCountdown = () => {
    setCountdown(60); setCanResend(false)
    const t = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(t); setCanResend(true); return 0; } return p - 1; })
    }, 1000)
  }

  const handleEmail = async () => {
    if (!email || !email.includes('@')) { setError('נא להזין מייל תקין'); return }
    setLoading(true); setError('')
    try {
      await sendSignInLinkToEmail(auth, email, {
        url: window.location.origin + '/login',
        handleCodeInApp: true,
      })
      localStorage.setItem('emailForSignIn', email)
      setEmailStep(2)
    } catch (e) { setError('שגיאה: ' + e.message) }
    setLoading(false)
  }

  const handlePhone = async () => {
    if (!phone || phone.length < 9) { setError('נא להזין מספר תקין'); return }
    setLoading(true); setError('')
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
      }
      const formatted = '+972' + phone.replace(/^0/, '')
      const result = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier)
      setConfirmResult(result)
      setPhoneStep(2)
      startCountdown()
    } catch (e) { setError('שגיאה: ' + e.message) }
    setLoading(false)
  }

  const verifyOTP = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('נא להזין 6 ספרות'); return }
    if (!confirmResult) return
    setLoading(true); setError('')
    try {
      await confirmResult.confirm(code)
      navigate('/dashboard')
    } catch (e) { setError('קוד שגוי — נסה שוב') }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true); setError('')
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      navigate('/dashboard')
    } catch (e) { setError('שגיאה בכניסה עם Google') }
    setLoading(false)
  }

  const handleOtpInput = (val, i) => {
    const newOtp = [...otp]
    newOtp[i] = val.replace(/\D/g, '')
    setOtp(newOtp)
    if (val && i < 5) document.getElementById('otp' + (i+1))?.focus()
  }

  const handleOtpKey = (e, i) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      document.getElementById('otp' + (i-1))?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    const newOtp = [...otp]
    paste.split('').forEach((c, i) => { if (i < 6) newOtp[i] = c })
    setOtp(newOtp)
    document.getElementById('otp' + Math.min(paste.length, 5))?.focus()
  }

  return (
    <div style={s.page}>
      <style>{css}</style>
      <canvas id="loginBg" style={{position:'fixed',inset:0,zIndex:0,opacity:0.4,pointerEvents:'none'}} />
      <div style={s.orb1} /><div style={s.orb2} /><div style={s.orb3} />
      <div id="recaptcha-container" />

      <div style={s.wrap}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={s.logo}>Memoriz</div>
          <div style={s.logoSub}>כניסה לאזור המארגנים</div>
        </div>

        <div style={s.card}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#00e5ff,#b400ff,#ff2d9b,transparent)'}} />

          {/* Tabs */}
          <div style={s.tabs}>
            <button style={{...s.tab, ...(tab==='email'?s.tabActive:{})}} onClick={()=>setTab('email')}>✉️ מייל</button>
            <button style={{...s.tab, ...(tab==='phone'?s.tabActive:{})}} onClick={()=>setTab('phone')}>📱 טלפון</button>
          </div>

          {/* Error */}
          {error && <div style={s.error}>⚠️ {error}</div>}

          {/* EMAIL */}
          {tab==='email' && (
            emailStep===1 ? (
              <div>
                <div style={s.formTitle}>ברוכים הבאים 👋</div>
                <div style={s.formSub}>הזינו מייל ונשלח קישור כניסה</div>
                <div style={{marginBottom:18}}>
                  <label style={s.label}>כתובת מייל</label>
                  <div style={{position:'relative'}}>
                    <span style={s.inputIcon}>✉️</span>
                    <input style={s.input} type="email" placeholder="your@email.com" dir="ltr" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleEmail()} />
                  </div>
                </div>
                <button style={s.btnSubmit} onClick={handleEmail} disabled={loading}>
                  {loading ? <span style={s.spinner} /> : 'שלח קישור כניסה ←'}
                </button>
                <div style={s.divider}><span style={s.dividerText}>או</span></div>
                <GoogleBtn onClick={handleGoogle} loading={loading} />
              </div>
            ) : (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:56,marginBottom:14}}>📬</div>
                <div style={s.formTitle}>בדקו את המייל!</div>
                <div style={s.formSub}>שלחנו קישור ל<br/><strong style={{color:'#00e5ff'}}>{email}</strong></div>
                <button style={{...s.btnSubmit,marginTop:24}} onClick={()=>setEmailStep(1)}>← שלח שוב</button>
              </div>
            )
          )}

          {/* PHONE */}
          {tab==='phone' && (
            phoneStep===1 ? (
              <div>
                <div style={s.formTitle}>כניסה עם טלפון 📱</div>
                <div style={s.formSub}>נשלח קוד SMS לאימות</div>
                <div style={{marginBottom:18}}>
                  <label style={s.label}>מספר טלפון</label>
                  <div style={{display:'flex',gap:10}}>
                    <div style={s.prefix}>🇮🇱 +972</div>
                    <div style={{position:'relative',flex:1}}>
                      <span style={s.inputIcon}>📱</span>
                      <input style={s.input} type="tel" placeholder="05X-XXX-XXXX" dir="ltr" maxLength={10} value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handlePhone()} />
                    </div>
                  </div>
                </div>
                <button style={s.btnSubmit} onClick={handlePhone} disabled={loading}>
                  {loading ? <span style={s.spinner} /> : 'שלח קוד SMS ←'}
                </button>
                <div style={s.divider}><span style={s.dividerText}>או</span></div>
                <GoogleBtn onClick={handleGoogle} loading={loading} />
              </div>
            ) : phoneStep===2 ? (
              <div>
                <div style={s.formTitle}>הזינו את הקוד 🔐</div>
                <div style={s.formSub}>שלחנו קוד ל<strong style={{color:'#00e5ff'}}>+972{phone.replace(/^0/,'')}</strong></div>
                <div style={{display:'flex',gap:8,justifyContent:'center',direction:'ltr',margin:'24px 0 16px'}}>
                  {otp.map((v,i)=>(
                    <input key={i} id={'otp'+i} style={s.otpInput} type="text" maxLength={1} inputMode="numeric" value={v}
                      onChange={e=>handleOtpInput(e.target.value,i)}
                      onKeyDown={e=>handleOtpKey(e,i)}
                      onPaste={i===0?handleOtpPaste:undefined}
                    />
                  ))}
                </div>
                <div style={{textAlign:'center',fontSize:13,color:'rgba(255,255,255,0.4)',marginBottom:16}}>
                  {canResend ? <button style={{background:'none',border:'none',color:'#00e5ff',cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:700,textDecoration:'underline'}} onClick={()=>{setPhoneStep(1);setOtp(['','','','','','']);}}>שלח שוב</button>
                  : <span>שלח שוב בעוד <span style={{color:'#00e5ff',fontWeight:700}}>{countdown}</span> שניות</span>}
                </div>
                <button style={s.btnSubmit} onClick={verifyOTP} disabled={loading||otp.join('').length<6}>
                  {loading ? <span style={s.spinner} /> : 'אמת קוד ←'}
                </button>
                <button onClick={()=>{setPhoneStep(1);setOtp(['','','','','','']);}} style={{width:'100%',background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontFamily:'inherit',fontSize:13,marginTop:8}}>← חזרה</button>
              </div>
            ) : (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:56,marginBottom:14,animation:'popIn 0.5s ease'}}>🎉</div>
                <div style={s.formTitle}>כניסה הצליחה!</div>
                <div style={s.formSub}>מעביר אותך לדשבורד...</div>
              </div>
            )
          )}

        </div>

        <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'rgba(255,255,255,0.3)'}}>
          אין חשבון? <a href="/create" style={{color:'#00e5ff',textDecoration:'none',fontWeight:600}}>הירשם חינם</a>
          {' · '}
          <a href="/" style={{color:'rgba(255,255,255,0.3)',textDecoration:'none'}}>דף הבית</a>
        </div>
      </div>

      <BgCanvas />
    </div>
  )
}

function GoogleBtn({ onClick, loading }) {
  return (
    <button style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1.5px solid rgba(255,255,255,0.12)',borderRadius:100,padding:14,fontFamily:'inherit',fontSize:16,fontWeight:600,color:'rgba(255,255,255,0.85)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'all 0.3s'}} onClick={onClick} disabled={loading}
      onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.transform='translateY(-2px)';}}
      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.transform='none';}}>
      <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      המשך עם Google
    </button>
  )
}

function BgCanvas() {
  useEffect(() => {
    const c = document.getElementById('loginBg')
    if (!c) return
    const ctx = c.getContext('2d')
    function resize() { c.width = innerWidth; c.height = innerHeight; }
    resize(); window.addEventListener('resize', resize)
    const COLORS = ['#ff2d9b','#00e5ff','#b400ff']
    const lines = []
    function spawn() {
      const col = COLORS[Math.floor(Math.random()*COLORS.length)]
      const ang = [42,48,-42,-48][Math.floor(Math.random()*4)] * Math.PI/180
      const edge = Math.floor(Math.random()*2)
      let sx, sy
      if (edge===0) { sx=Math.random()*c.width; sy=-50 } else { sx=-50; sy=Math.random()*c.height }
      const sp = 1+Math.random()*1.2
      return { hx:sx, hy:sy, dx:Math.cos(ang)*sp, dy:Math.sin(ang)*sp, tail:[], len:100+Math.random()*150, col, w:0.6+Math.random()*0.7, op:0.3+Math.random()*0.25 }
    }
    for (let i=0;i<4;i++) { const s=spawn(); for(let j=0;j<60;j++){s.hx+=s.dx;s.hy+=s.dy;s.tail.unshift({x:s.hx,y:s.hy});} lines.push(s) }
    let f=0, raf
    function draw() {
      ctx.clearRect(0,0,c.width,c.height); f++
      if (f%90===0&&lines.length<7) lines.push(spawn())
      for (let i=lines.length-1;i>=0;i--) {
        const l=lines[i]; l.hx+=l.dx; l.hy+=l.dy; l.tail.unshift({x:l.hx,y:l.hy})
        const max=Math.ceil(l.len/Math.sqrt(l.dx*l.dx+l.dy*l.dy)); if(l.tail.length>max)l.tail.length=max
        if(l.hx>c.width+200||l.hy>c.height+200){lines.splice(i,1);continue}
        for(let j=1;j<l.tail.length;j++){
          const t=1-j/l.tail.length; const p0=l.tail[j-1],p1=l.tail[j]
          ctx.save(); ctx.globalAlpha=l.op*t*0.3; ctx.shadowBlur=12; ctx.shadowColor=l.col; ctx.strokeStyle=l.col; ctx.lineWidth=l.w*3; ctx.lineCap='round'
          ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.stroke()
          ctx.globalAlpha=l.op*t; ctx.shadowBlur=4; ctx.lineWidth=l.w; ctx.strokeStyle=j<3?'#fff':l.col
          ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.stroke(); ctx.restore()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return null
}

const s = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#050310', direction:'rtl', position:'relative', overflow:'hidden', padding:20 },
  orb1: { position:'fixed', width:500, height:500, borderRadius:'50%', filter:'blur(110px)', opacity:0.2, background:'radial-gradient(circle,#b400ff,transparent)', top:-150, right:-100, animation:'floatorb 10s ease-in-out infinite', pointerEvents:'none', zIndex:0 },
  orb2: { position:'fixed', width:400, height:400, borderRadius:'50%', filter:'blur(110px)', opacity:0.2, background:'radial-gradient(circle,#00e5ff,transparent)', bottom:-100, left:-80, animation:'floatorb 10s ease-in-out infinite', animationDelay:'-4s', pointerEvents:'none', zIndex:0 },
  orb3: { position:'fixed', width:300, height:300, borderRadius:'50%', filter:'blur(110px)', opacity:0.12, background:'radial-gradient(circle,#ff2d9b,transparent)', top:'40%', left:'45%', animation:'floatorb 8s ease-in-out infinite', animationDelay:'-7s', pointerEvents:'none', zIndex:0 },
  wrap: { position:'relative', zIndex:2, width:'100%', maxWidth:440 },
  logo: { fontSize:34, fontWeight:900, letterSpacing:-1, background:'linear-gradient(90deg,#00e5ff,#b400ff,#ff2d9b)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'shimmer 4s linear infinite', display:'inline-block', filter:'drop-shadow(0 0 12px rgba(0,229,255,0.5))' },
  logoSub: { fontSize:14, color:'rgba(255,255,255,0.35)', marginTop:6 },
  card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(0,229,255,0.18)', borderRadius:28, padding:'36px 32px', backdropFilter:'blur(24px)', boxShadow:'0 0 60px rgba(0,229,255,0.06), 0 40px 80px rgba(0,0,0,0.5)', position:'relative', overflow:'hidden' },
  tabs: { display:'flex', gap:0, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:4, marginBottom:28 },
  tab: { flex:1, padding:'10px 16px', borderRadius:10, fontFamily:'Heebo,sans-serif', fontSize:15, fontWeight:600, cursor:'pointer', border:'none', background:'transparent', color:'rgba(255,255,255,0.45)', transition:'all 0.3s' },
  tabActive: { background:'rgba(0,229,255,0.12)', color:'#00e5ff', border:'1px solid rgba(0,229,255,0.3)', boxShadow:'0 0 14px rgba(0,229,255,0.2)', textShadow:'0 0 8px rgba(0,229,255,0.5)' },
  formTitle: { fontSize:22, fontWeight:800, marginBottom:6 },
  formSub: { fontSize:14, color:'rgba(255,255,255,0.45)', marginBottom:24, lineHeight:1.6 },
  label: { display:'block', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.55)', marginBottom:8 },
  inputIcon: { position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontSize:18, pointerEvents:'none' },
  input: { width:'100%', background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:14, padding:'14px 46px 14px 18px', color:'#fff', fontFamily:'inherit', fontSize:16, outline:'none', transition:'all 0.3s', direction:'ltr' },
  prefix: { background:'rgba(0,229,255,0.08)', border:'1.5px solid rgba(0,229,255,0.25)', borderRadius:14, padding:'14px 16px', color:'#00e5ff', fontFamily:'inherit', fontSize:16, fontWeight:600, width:85, textAlign:'center', flexShrink:0, direction:'ltr' },
  btnSubmit: { width:'100%', background:'transparent', color:'#00e5ff', border:'2px solid #00e5ff', borderRadius:100, padding:15, fontFamily:'inherit', fontSize:17, fontWeight:700, cursor:'pointer', transition:'all 0.3s', boxShadow:'0 0 20px rgba(0,229,255,0.4)', textShadow:'0 0 10px rgba(0,229,255,0.6)', marginBottom:18, display:'flex', alignItems:'center', justifyContent:'center', gap:8 },
  divider: { display:'flex', alignItems:'center', gap:14, marginBottom:16, position:'relative' },
  dividerText: { fontSize:12, color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.04)', padding:'0 12px', position:'relative', zIndex:1 },
  otpInput: { width:46, height:56, background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:12, textAlign:'center', fontFamily:'inherit', fontSize:22, fontWeight:800, color:'#00e5ff', outline:'none', caretColor:'#00e5ff', direction:'ltr' },
  error: { background:'rgba(255,45,155,0.1)', border:'1px solid rgba(255,45,155,0.3)', borderRadius:12, padding:'10px 14px', fontSize:13, color:'#ff8fc8', marginBottom:16 },
  spinner: { width:20, height:20, border:'2px solid rgba(0,229,255,0.3)', borderTopColor:'#00e5ff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' },
}

const css = `
  @keyframes shimmer { to { background-position: 200% center; } }
  @keyframes floatorb { 0%,100%{transform:translateY(0);}50%{transform:translateY(-20px);} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes popIn { from{transform:scale(0) rotate(-15deg);opacity:0;}to{transform:scale(1) rotate(0);opacity:1;} }
  input:focus { border-color: #00e5ff !important; background: rgba(0,229,255,0.04) !important; box-shadow: 0 0 18px rgba(0,229,255,0.12) !important; }
  button:disabled { opacity: 0.4 !important; cursor: not-allowed !important; }
`
