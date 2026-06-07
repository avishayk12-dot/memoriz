import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { QRCodeSVG } from 'qrcode.react'
import { ToastContainer, useToast } from '../components/Toast'

const C = { cyan:'#00e5ff', pink:'#ff2d9b', purple:'#b400ff' }
const EMOJIS = ['💍','🎉','🎂','💼','🎓','🎊','🏖️','⭐']

export default function CreateEvent() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [event, setEvent] = useState(null)
  const [form, setForm] = useState({ name:'', date:'', description:'' })
  const [emoji, setEmoji] = useState('💍')
  const { toasts, show } = useToast()
  const navigate = useNavigate()

  const handleCreate = async () => {
    if (!form.name.trim()) { show('נא להזין שם אירוע', 'error'); return }
    if (!form.date) { show('נא לבחור תאריך', 'error'); return }
    setLoading(true)
    try {
      if (!auth.currentUser) await signInAnonymously(auth)
      const docRef = await addDoc(collection(db,'events'), {
        name: emoji + ' ' + form.name.trim(),
        date: form.date,
        description: form.description.trim(),
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        photoCount: 0,
        active: true,
      })
      setEvent({ id: docRef.id, ...form, emoji, uploadUrl: `${window.location.origin}/upload/${docRef.id}` })
      setStep(2)
    } catch (e) { show('שגיאה: ' + e.message, 'error') }
    setLoading(false)
  }

  const copyLink = () => { navigator.clipboard.writeText(event.uploadUrl); show('הקישור הועתק! ✓', 'success') }
  const shareWA = () => { window.open('https://wa.me/?text='+encodeURIComponent(`היי! 📸 תעלו תמונות:\n${event.uploadUrl}`),'_blank') }

  return (
    <div style={{minHeight:'100vh',background:'#050310',direction:'rtl',fontFamily:'Heebo,sans-serif',position:'relative',overflow:'hidden'}}>
      <style>{`
        @keyframes shimmer{to{background-position:200% center;}}
        @keyframes orb{0%,100%{transform:translateY(0);}50%{transform:translateY(-20px);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
        @keyframes pop{from{transform:scale(0) rotate(-15deg);opacity:0;}to{transform:scale(1) rotate(0);opacity:1;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .inp:focus{border-color:#00e5ff!important;background:rgba(0,229,255,0.04)!important;box-shadow:0 0 18px rgba(0,229,255,0.12)!important;}
        .emj:hover{background:rgba(0,229,255,0.1)!important;border-color:rgba(0,229,255,0.3)!important;}
        .emj.sel{background:rgba(0,229,255,0.15)!important;border-color:#00e5ff!important;box-shadow:0 0 14px rgba(0,229,255,0.3)!important;}
      `}</style>
      <div style={{position:'fixed',width:500,height:500,borderRadius:'50%',filter:'blur(110px)',opacity:0.18,background:'radial-gradient(circle,#b400ff,transparent)',top:-150,right:-100,animation:'orb 10s ease-in-out infinite',pointerEvents:'none',zIndex:0}} />
      <div style={{position:'fixed',width:400,height:400,borderRadius:'50%',filter:'blur(110px)',opacity:0.18,background:'radial-gradient(circle,#00e5ff,transparent)',bottom:-100,left:-80,animation:'orb 10s ease-in-out infinite',animationDelay:'-4s',pointerEvents:'none',zIndex:0}} />
      <ToastContainer toasts={toasts} />

      <div style={{position:'relative',zIndex:2,maxWidth:580,margin:'0 auto',padding:'110px 20px 60px'}}>

        {/* Steps */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:0,marginBottom:48,animation:'fadeIn 0.5s ease both'}}>
          {[1,2].map((n,i)=>(
            <div key={n} style={{display:'flex',alignItems:'center'}}>
              <div>
                <div style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,margin:'0 auto',transition:'all 0.4s',...(step>n?{background:'linear-gradient(135deg,#00e5ff,#b400ff)',color:'#fff',boxShadow:'0 0 16px rgba(0,229,255,0.5)'}:step===n?{border:'2px solid #00e5ff',color:'#00e5ff',boxShadow:'0 0 14px rgba(0,229,255,0.4)'}:{border:'2px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.3)'})}}>
                  {step>n?'✓':n}
                </div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',textAlign:'center',marginTop:5}}>{n===1?'פרטי אירוע':'QR מוכן'}</div>
              </div>
              {i===0 && <div style={{width:60,height:2,margin:'0 8px',marginBottom:18,background:step>1?'linear-gradient(90deg,#00e5ff,#b400ff)':'rgba(255,255,255,0.08)',transition:'background 0.4s'}} />}
            </div>
          ))}
        </div>

        {step===1 && (
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(0,229,255,0.15)',borderRadius:24,padding:36,position:'relative',overflow:'hidden',animation:'fadeIn 0.5s ease both'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#00e5ff,#b400ff,#ff2d9b,transparent)'}} />
            <div style={{fontSize:24,fontWeight:900,marginBottom:6}}>✨ צור אלבום חדש</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.4)',marginBottom:28,lineHeight:1.6}}>מלא פרטים ותקבל QR ייחודי שהאורחים יסרקו</div>

            <div style={{marginBottom:20}}>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.55)',marginBottom:8}}>סוג האירוע</label>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {EMOJIS.map(e=>(
                  <button key={e} className={`emj${emoji===e?' sel':''}`} onClick={()=>setEmoji(e)} style={{width:48,height:48,borderRadius:14,background:'rgba(255,255,255,0.05)',border:'1.5px solid rgba(255,255,255,0.1)',fontSize:22,cursor:'pointer',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}}>{e}</button>
                ))}
              </div>
            </div>

            {[
              {label:'שם האירוע *', icon:'✏️', id:'name', placeholder:'לדוג׳: חתונת דנה ואורי', type:'text'},
              {label:'תאריך האירוע *', icon:'📅', id:'date', placeholder:'', type:'date'},
            ].map(f=>(
              <div key={f.id} style={{marginBottom:18}}>
                <label style={{display:'block',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.55)',marginBottom:8}}>{f.label}</label>
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute',right:16,top:'50%',transform:'translateY(-50%)',fontSize:18,pointerEvents:'none'}}>{f.icon}</span>
                  <input className="inp" type={f.type} placeholder={f.placeholder} value={form[f.id]} onChange={e=>setForm(p=>({...p,[f.id]:e.target.value}))} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1.5px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'14px 46px 14px 18px',color:'#fff',fontFamily:'inherit',fontSize:16,outline:'none',transition:'all 0.3s',colorScheme:'dark'}} onKeyDown={e=>e.key==='Enter'&&handleCreate()} />
                </div>
              </div>
            ))}

            <div style={{marginBottom:20}}>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.55)',marginBottom:8}}>תיאור קצר (אופציונלי)</label>
              <textarea className="inp" placeholder="הוסף הודעה קצרה לאורחים..." value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1.5px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'14px 18px',color:'#fff',fontFamily:'inherit',fontSize:16,outline:'none',resize:'vertical',transition:'all 0.3s'}} />
            </div>

            <button onClick={handleCreate} disabled={loading} style={{width:'100%',background:'transparent',color:'#00e5ff',border:'2px solid #00e5ff',borderRadius:100,padding:16,fontFamily:'inherit',fontSize:17,fontWeight:700,cursor:'pointer',transition:'all 0.3s',boxShadow:'0 0 22px rgba(0,229,255,0.4)',textShadow:'0 0 10px rgba(0,229,255,0.6)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}
              onMouseEnter={e=>{if(!loading){e.currentTarget.style.background='rgba(0,229,255,0.1)';e.currentTarget.style.boxShadow='0 0 40px rgba(0,229,255,0.8)';}}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.boxShadow='0 0 22px rgba(0,229,255,0.4)';}}>
              {loading ? <><span style={{width:20,height:20,border:'2px solid rgba(0,229,255,0.3)',borderTopColor:'#00e5ff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'}} /> יוצר...</> : '🎉 צור אלבום עכשיו'}
            </button>
          </div>
        )}

        {step===2 && event && (
          <div style={{animation:'fadeIn 0.5s ease both'}}>
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(0,229,255,0.15)',borderRadius:24,padding:36,position:'relative',overflow:'hidden',textAlign:'center',marginBottom:16}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#00e5ff,#b400ff,#ff2d9b,transparent)'}} />
              <div style={{fontSize:60,marginBottom:14,animation:'pop 0.5s ease'}}>🎉</div>
              <div style={{fontSize:26,fontWeight:900,marginBottom:8}}>האלבום מוכן!</div>
              <div style={{fontSize:15,color:'rgba(255,255,255,0.5)',marginBottom:28}}>שתף את ה-QR עם האורחים</div>
              <div style={{background:'#fff',borderRadius:18,padding:16,display:'inline-block',marginBottom:18,boxShadow:'0 0 28px rgba(0,229,255,0.3)'}}>
                <QRCodeSVG value={event.uploadUrl} size={180} fgColor="#050310" bgColor="#ffffff" level="H" />
              </div>
              <div style={{fontWeight:800,fontSize:18,marginBottom:4}}>{event.emoji} {event.name}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',marginBottom:20}}>📅 {event.date}</div>
            </div>

            <div style={{display:'flex',gap:10,alignItems:'center',background:'rgba(0,229,255,0.06)',border:'1px solid rgba(0,229,255,0.15)',borderRadius:14,padding:'12px 16px',marginBottom:14}}>
              <span style={{flex:1,fontSize:13,color:'rgba(255,255,255,0.5)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',direction:'ltr'}}>{event.uploadUrl}</span>
              <button onClick={copyLink} style={{background:'rgba(0,229,255,0.1)',border:'1px solid rgba(0,229,255,0.3)',color:'#00e5ff',borderRadius:8,padding:'6px 14px',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',flexShrink:0}}>📋 העתק</button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <button onClick={shareWA} style={{padding:14,borderRadius:14,fontFamily:'inherit',fontSize:15,fontWeight:700,cursor:'pointer',background:'transparent',border:'2px solid #25D366',color:'#4ade80',transition:'all 0.3s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(37,211,102,0.1)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                💬 שלח בוואטסאפ
              </button>
              <button onClick={()=>navigate(`/gallery/${event.id}`)} style={{padding:14,borderRadius:14,fontFamily:'inherit',fontSize:15,fontWeight:700,cursor:'pointer',background:'transparent',border:'2px solid #00e5ff',color:'#00e5ff',boxShadow:'0 0 14px rgba(0,229,255,0.3)',transition:'all 0.3s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,229,255,0.1)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                🖼 פתח גלריה
              </button>
            </div>
            <button onClick={()=>{setStep(1);setForm({name:'',date:'',description:''});setEvent(null);}} style={{width:'100%',background:'none',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.4)',borderRadius:14,padding:12,fontFamily:'inherit',fontSize:14,fontWeight:600,cursor:'pointer',transition:'all 0.3s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.2)';e.currentTarget.style.color='rgba(255,255,255,0.7)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='rgba(255,255,255,0.4)';}}>
              + צור אירוע נוסף
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
