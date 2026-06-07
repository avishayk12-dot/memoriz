import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { signOut } from 'firebase/auth'
import { ToastContainer, useToast } from '../components/Toast'

const C = { cyan:'#00e5ff', pink:'#ff2d9b', purple:'#b400ff', dark:'#050310', dark2:'#0a0618', dark3:'#120a28' }

export default function Dashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [filter, setFilter] = useState('all')
  const { toasts, show } = useToast()
  const navigate = useNavigate()

  useEffect(() => { return onAuthStateChanged(auth, u => { if(u) setUser(u); else navigate('/login') }) }, [])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db,'events'), where('createdBy','==',user.uid), orderBy('createdAt','desc'))
    const unsub = onSnapshot(q, snap => { setEvents(snap.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false) })
    return unsub
  }, [user])

  const toggleActive = async (id, cur) => {
    await updateDoc(doc(db,'events',id), { active: !cur })
    show(!cur ? 'האירוע הופעל' : 'האירוע הושבת', 'success')
  }

  const shareWA = (id, name) => {
    const url = encodeURIComponent(`היי! 📸 תעלו תמונות ל${name}:\n${window.location.origin}/upload/${id}`)
    window.open('https://wa.me/?text='+url,'_blank')
  }

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/upload/${id}`)
    show('הקישור הועתק! ✓', 'success')
  }

  const filtered = events.filter(e => filter==='all' || (filter==='active'&&e.active) || (filter==='ended'&&!e.active))
  const totalPhotos = events.reduce((a,e)=>a+(e.photoCount||0),0)

  return (
    <div style={{minHeight:'100vh',background:C.dark,direction:'rtl',fontFamily:'Heebo,sans-serif',position:'relative',overflow:'hidden'}}>
      <style>{`
        @keyframes shimmer{to{background-position:200% center;}}
        @keyframes pulse{0%,100%{box-shadow:0 0 6px #00e5ff;}50%{box-shadow:0 0 16px #00e5ff,0 0 28px #00e5ff;}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
        @keyframes orb{0%,100%{transform:translateY(0);}50%{transform:translateY(-20px);}}
        .ec:hover{border-color:rgba(0,229,255,0.35)!important;box-shadow:0 0 30px rgba(0,229,255,0.08)!important;}
        .ab:hover{background:rgba(0,229,255,0.1)!important;border-color:rgba(0,229,255,0.4)!important;color:#00e5ff!important;}
        .wa:hover{background:rgba(37,211,102,0.1)!important;border-color:rgba(37,211,102,0.4)!important;color:#4ade80!important;}
        .dk:hover{background:rgba(255,77,109,0.1)!important;border-color:rgba(255,77,109,0.4)!important;color:#ff4d6d!important;}
        .sc:hover{border-color:rgba(0,229,255,0.5)!important;transform:translateY(-4px)!important;box-shadow:0 0 30px rgba(0,229,255,0.1)!important;}
      `}</style>

      {/* Orbs */}
      <div style={{position:'fixed',width:500,height:500,borderRadius:'50%',filter:'blur(110px)',opacity:0.18,background:'radial-gradient(circle,#b400ff,transparent)',top:-150,right:-100,animation:'orb 12s ease-in-out infinite',pointerEvents:'none',zIndex:0}} />
      <div style={{position:'fixed',width:400,height:400,borderRadius:'50%',filter:'blur(110px)',opacity:0.18,background:'radial-gradient(circle,#00e5ff,transparent)',bottom:-100,left:-80,animation:'orb 12s ease-in-out infinite',animationDelay:'-5s',pointerEvents:'none',zIndex:0}} />

      <ToastContainer toasts={toasts} />

      <div style={{position:'relative',zIndex:2,maxWidth:1100,margin:'0 auto',padding:'100px 32px 60px'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:40,animation:'fadeIn 0.5s ease both'}}>
          <div>
            <h1 style={{fontSize:'clamp(26px,4vw,36px)',fontWeight:900,letterSpacing:-1.5,marginBottom:6}}>
              האירועים{' '}
              <span style={{background:'linear-gradient(90deg,#00e5ff,#b400ff,#ff2d9b)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 4s linear infinite'}}>שלי</span>
            </h1>
            <div style={{fontSize:15,color:'rgba(255,255,255,0.4)'}}>
              {events.length} אירועים · {totalPhotos.toLocaleString()} תמונות שנאספו
            </div>
          </div>
          <Link to="/create" style={{background:'transparent',color:C.cyan,border:`2px solid ${C.cyan}`,borderRadius:100,padding:'12px 28px',fontFamily:'inherit',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 0 20px rgba(0,229,255,0.35)',textShadow:'0 0 8px rgba(0,229,255,0.5)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,transition:'all 0.3s'}}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,229,255,0.1)';e.currentTarget.style.boxShadow='0 0 35px rgba(0,229,255,0.7)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.boxShadow='0 0 20px rgba(0,229,255,0.35)';}}>
            + אירוע חדש
          </Link>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:36,animation:'fadeIn 0.5s ease 0.1s both'}}>
          {[
            {icon:'🎪',num:events.length,label:'סה"כ אירועים'},
            {icon:'📸',num:totalPhotos.toLocaleString(),label:'תמונות שנאספו'},
            {icon:'✅',num:events.filter(e=>e.active).length,label:'אירועים פעילים'},
          ].map((s,i)=>(
            <div key={i} className="sc" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(0,229,255,0.15)',borderRadius:20,padding:'22px 24px',display:'flex',alignItems:'center',gap:16,transition:'all 0.3s',cursor:'default'}}>
              <div style={{fontSize:28}}>{s.icon}</div>
              <div>
                <div style={{fontSize:28,fontWeight:900,lineHeight:1,background:'linear-gradient(135deg,#00e5ff,#fff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{s.num}</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',marginTop:3}}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:16,fontWeight:700}}>
            <span style={{width:8,height:8,background:C.cyan,borderRadius:'50%',boxShadow:`0 0 8px ${C.cyan}`,animation:'pulse 2s infinite',display:'inline-block'}} />
            האירועים שלי
          </div>
          <div style={{display:'flex',gap:8}}>
            {[['all','הכל'],['active','פעיל'],['ended','הסתיים']].map(([k,l])=>(
              <button key={k} onClick={()=>setFilter(k)} style={{background:filter===k?'rgba(0,229,255,0.1)':'rgba(255,255,255,0.05)',border:`1px solid ${filter===k?'rgba(0,229,255,0.3)':'rgba(255,255,255,0.08)'}`,borderRadius:8,padding:'6px 14px',fontFamily:'inherit',fontSize:13,fontWeight:600,color:filter===k?C.cyan:'rgba(255,255,255,0.45)',cursor:'pointer',transition:'all 0.2s'}}>{l}</button>
            ))}
          </div>
        </div>

        {/* Events */}
        {loading ? (
          <div style={{textAlign:'center',padding:60}}><div style={{width:40,height:40,border:'2px solid rgba(0,229,255,0.3)',borderTopColor:C.cyan,borderRadius:'50%',animation:'spin 0.7s linear infinite',margin:'0 auto'}} /><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style></div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 24px'}}>
            <div style={{fontSize:72,marginBottom:20,opacity:0.35}}>🎪</div>
            <h3 style={{fontSize:22,fontWeight:700,color:'rgba(255,255,255,0.5)',marginBottom:8}}>אין אירועים עדיין</h3>
            <p style={{color:'rgba(255,255,255,0.3)',marginBottom:24}}>צור את האירוע הראשון שלך עכשיו</p>
            <Link to="/create" style={{background:'transparent',color:C.cyan,border:`2px solid ${C.cyan}`,borderRadius:100,padding:'12px 28px',fontFamily:'inherit',fontSize:15,fontWeight:700,textDecoration:'none',boxShadow:'0 0 18px rgba(0,229,255,0.35)'}}>🎉 צור אירוע ראשון</Link>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {filtered.map((event,i) => (
              <div key={event.id} className="ec" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(0,229,255,0.15)',borderRadius:20,padding:'22px 26px',display:'flex',alignItems:'center',gap:20,flexWrap:'wrap',transition:'all 0.3s',animation:`fadeIn 0.5s ease ${i*0.06}s both`}}>
                <div style={{width:52,height:52,background:'rgba(0,229,255,0.08)',border:'1px solid rgba(0,229,255,0.2)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>📸</div>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:5}}>
                    <span style={{fontWeight:800,fontSize:17}}>{event.name}</span>
                    <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:100,fontSize:11,fontWeight:700,...(event.active?{background:'rgba(0,229,255,0.12)',color:C.cyan,border:'1px solid rgba(0,229,255,0.3)'}:{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.3)',border:'1px solid rgba(255,255,255,0.08)'})}}>
                      {event.active && <span style={{width:5,height:5,background:C.cyan,borderRadius:'50%',boxShadow:`0 0 5px ${C.cyan}`,animation:'pulse 1.5s infinite'}} />}
                      {event.active ? 'פעיל' : 'מושבת'}
                    </span>
                  </div>
                  <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
                    {event.date && <span style={{fontSize:13,color:'rgba(255,255,255,0.4)'}}>📅 {event.date}</span>}
                    <span style={{fontSize:13,color:'rgba(255,255,255,0.4)'}}>📸 {event.photoCount||0} תמונות</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {[
                    {label:'📋 קישור', cls:'ab', fn:()=>copyLink(event.id)},
                    {label:'💬', cls:'wa', fn:()=>shareWA(event.id,event.name)},
                    {label:'🖼 גלריה', cls:'ab', fn:()=>navigate(`/gallery/${event.id}`)},
                    {label:event.active?'⏸':'▶', cls:'dk', fn:()=>toggleActive(event.id,event.active)},
                  ].map((b,bi)=>(
                    <button key={bi} className={b.cls} onClick={b.fn} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'8px 14px',fontFamily:'inherit',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)',cursor:'pointer',transition:'all 0.2s',display:'flex',alignItems:'center',gap:5,whiteSpace:'nowrap'}}>{b.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
