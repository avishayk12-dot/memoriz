import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { QRCodeSVG } from 'qrcode.react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { ToastContainer, useToast } from '../components/Toast'

export default function EventGallery() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const { toasts, show } = useToast()
  const uploadUrl = `${window.location.origin}/upload/${eventId}`

  useEffect(() => {
    getDoc(doc(db,'events',eventId)).then(snap => { if(snap.exists())setEvent({id:snap.id,...snap.data()}); setLoading(false) })
  }, [eventId])

  useEffect(() => {
    const q = query(collection(db,'events',eventId,'photos'),orderBy('uploadedAt','desc'))
    return onSnapshot(q, snap => setPhotos(snap.docs.map(d=>({id:d.id,...d.data()}))))
  }, [eventId])

  const copyLink = () => { navigator.clipboard.writeText(uploadUrl); show('הקישור הועתק!','success') }
  const shareWA = () => { window.open('https://wa.me/?text='+encodeURIComponent(`היי! 📸 תעלו תמונות:\n${uploadUrl}`),'_blank') }

  const downloadAll = async () => {
    if (!photos.length) { show('אין תמונות','error'); return }
    setDownloading(true); show('מכין ZIP...','success')
    try {
      const zip = new JSZip(); const folder = zip.folder(event?.name||'memoriz')
      await Promise.all(photos.map(async(p,i)=>{const res=await fetch(p.url);const blob=await res.blob();const ext=p.fileName?.split('.').pop()||'jpg';folder.file(`photo_${String(i+1).padStart(3,'0')}.${ext}`,blob);}))
      const content = await zip.generateAsync({type:'blob'}); saveAs(content,`${event?.name||'memoriz'}.zip`); show('הורדה הושלמה! ✓','success')
    } catch { show('שגיאה בהורדה','error') }
    setDownloading(false)
  }

  const lbIdx = lightbox ? photos.findIndex(p=>p.id===lightbox.id) : 0
  const lbNav = dir => { const i=(lbIdx+dir+photos.length)%photos.length; setLightbox(photos[i]) }

  useEffect(() => {
    const fn = e => { if(e.key==='Escape')setLightbox(null); if(e.key==='ArrowRight')lbNav(-1); if(e.key==='ArrowLeft')lbNav(1) }
    window.addEventListener('keydown',fn); return ()=>window.removeEventListener('keydown',fn)
  }, [lightbox,photos])

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#050310'}}><div style={{width:40,height:40,border:'2px solid rgba(0,229,255,0.3)',borderTopColor:'#00e5ff',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} /><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style></div>

  return (
    <div style={{minHeight:'100vh',background:'#050310',direction:'rtl',fontFamily:'Heebo,sans-serif',position:'relative',overflow:'hidden'}}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
        @keyframes pulse{0%,100%{box-shadow:0 0 6px #00e5ff;}50%{box-shadow:0 0 16px #00e5ff;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes orb{0%,100%{transform:translateY(0);}50%{transform:translateY(-20px);}}
        .ph:hover{transform:scale(1.02)!important;box-shadow:0 0 20px rgba(0,229,255,0.2)!important;}
        .nb:hover{background:rgba(0,229,255,0.1)!important;border-color:rgba(0,229,255,0.4)!important;color:#00e5ff!important;}
        .wa:hover{background:rgba(37,211,102,0.1)!important;border-color:rgba(37,211,102,0.4)!important;color:#4ade80!important;}
      `}</style>
      <div style={{position:'fixed',width:400,height:400,borderRadius:'50%',filter:'blur(110px)',opacity:0.15,background:'radial-gradient(circle,#b400ff,transparent)',top:-100,right:-80,animation:'orb 12s ease-in-out infinite',pointerEvents:'none',zIndex:0}} />
      <div style={{position:'fixed',width:350,height:350,borderRadius:'50%',filter:'blur(110px)',opacity:0.15,background:'radial-gradient(circle,#00e5ff,transparent)',bottom:-80,left:-60,animation:'orb 12s ease-in-out infinite',animationDelay:'-5s',pointerEvents:'none',zIndex:0}} />

      <ToastContainer toasts={toasts} />

      {/* Lightbox */}
      {lightbox && (
        <div onClick={()=>setLightbox(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.94)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(10px)'}}>
          <button onClick={()=>setLightbox(null)} style={{position:'absolute',top:20,left:20,background:'rgba(255,255,255,0.1)',border:'none',color:'#fff',width:40,height:40,borderRadius:'50%',cursor:'pointer',fontSize:18}}>✕</button>
          <button onClick={e=>{e.stopPropagation();lbNav(-1);}} style={{position:'absolute',right:20,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.1)',border:'none',color:'#fff',width:48,height:48,borderRadius:'50%',cursor:'pointer',fontSize:22,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,229,255,0.2)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}>‹</button>
          <img src={lightbox.url} alt="" onClick={e=>e.stopPropagation()} style={{maxWidth:'90vw',maxHeight:'85vh',objectFit:'contain',borderRadius:12,boxShadow:'0 0 60px rgba(0,229,255,0.15)'}} />
          <button onClick={e=>{e.stopPropagation();lbNav(1);}} style={{position:'absolute',left:20,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.1)',border:'none',color:'#fff',width:48,height:48,borderRadius:'50%',cursor:'pointer',fontSize:22,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,229,255,0.2)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}>›</button>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div onClick={()=>setShowQR(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:9998,display:'flex',alignItems:'center',justifyContent:'center',padding:24,backdropFilter:'blur(8px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#120a28',border:'1px solid rgba(0,229,255,0.2)',borderRadius:24,padding:36,maxWidth:340,width:'100%',textAlign:'center',position:'relative',boxShadow:'0 0 50px rgba(0,229,255,0.12)'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#00e5ff,#b400ff,#ff2d9b,transparent)'}} />
            <button onClick={()=>setShowQR(false)} style={{position:'absolute',top:14,left:14,background:'rgba(255,255,255,0.08)',border:'none',color:'rgba(255,255,255,0.5)',width:30,height:30,borderRadius:'50%',cursor:'pointer',fontSize:14}}>✕</button>
            <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>QR לשיתוף</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',marginBottom:18}}>סרוק להעלאת תמונות · ללא הרשמה</div>
            <div style={{background:'#fff',borderRadius:14,padding:12,display:'inline-block',marginBottom:16,boxShadow:'0 0 24px rgba(0,229,255,0.3)'}}>
              <QRCodeSVG value={uploadUrl} size={150} fgColor="#050310" bgColor="#ffffff" level="H" />
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={shareWA} style={{flex:1,padding:11,borderRadius:12,fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',background:'transparent',border:'2px solid #25D366',color:'#4ade80',transition:'all 0.3s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(37,211,102,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>💬 וואטסאפ</button>
              <button onClick={()=>window.print()} style={{flex:1,padding:11,borderRadius:12,fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',background:'transparent',border:'2px solid #00e5ff',color:'#00e5ff',boxShadow:'0 0 12px rgba(0,229,255,0.3)',transition:'all 0.3s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,229,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>🖨 הדפס</button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{position:'relative',zIndex:2,maxWidth:1100,margin:'0 auto',padding:'95px 28px 60px'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:20,marginBottom:28,animation:'fadeIn 0.5s ease both'}}>
          <div>
            <Link to="/dashboard" style={{display:'flex',alignItems:'center',gap:6,color:'rgba(255,255,255,0.4)',fontSize:13,fontWeight:600,marginBottom:10,textDecoration:'none',transition:'color 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color='#00e5ff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>← חזרה לדשבורד</Link>
            <h1 style={{fontSize:'clamp(24px,4vw,36px)',fontWeight:900,letterSpacing:-1,marginBottom:10}}>{event?.name}</h1>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(0,229,255,0.12)',color:'#00e5ff',border:'1px solid rgba(0,229,255,0.3)',borderRadius:100,padding:'4px 12px',fontSize:12,fontWeight:700}}>
                <span style={{width:6,height:6,background:'#00e5ff',borderRadius:'50%',animation:'pulse 1.5s infinite'}} /> פעיל
              </span>
              <span style={{background:'rgba(180,0,255,0.12)',color:'#d580ff',border:'1px solid rgba(180,0,255,0.25)',borderRadius:100,padding:'4px 12px',fontSize:12,fontWeight:700}}>📸 {photos.length} תמונות</span>
              {event?.date && <span style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:100,padding:'4px 12px',fontSize:12,fontWeight:700}}>📅 {event.date}</span>}
            </div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[
              {label:'📋 קישור',cls:'nb',fn:copyLink},
              {label:'📱 QR',cls:'nb',fn:()=>setShowQR(true)},
              {label:'💬 וואטסאפ',cls:'wa',fn:shareWA},
            ].map((b,i)=>(
              <button key={i} className={b.cls} onClick={b.fn} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'8px 16px',fontFamily:'inherit',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)',cursor:'pointer',transition:'all 0.2s'}}>{b.label}</button>
            ))}
            <button onClick={downloadAll} disabled={downloading||!photos.length} style={{background:'transparent',color:'#00e5ff',border:'2px solid #00e5ff',borderRadius:10,padding:'8px 16px',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 0 14px rgba(0,229,255,0.3)',transition:'all 0.3s'}}
              onMouseEnter={e=>{if(!downloading)e.currentTarget.style.background='rgba(0,229,255,0.1)';}}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              {downloading?<><span style={{width:14,height:14,border:'2px solid rgba(0,229,255,0.3)',borderTopColor:'#00e5ff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block',marginLeft:4}} />מוריד...</>:`📦 ZIP (${photos.length})`}
            </button>
          </div>
        </div>

        {/* Link bar */}
        <div style={{display:'flex',gap:10,alignItems:'center',background:'rgba(0,229,255,0.06)',border:'1px solid rgba(0,229,255,0.15)',borderRadius:14,padding:'11px 16px',marginBottom:28,animation:'fadeIn 0.5s ease 0.1s both'}}>
          <span style={{fontSize:13,color:'rgba(255,255,255,0.4)'}}>קישור:</span>
          <span style={{flex:1,fontSize:13,color:'rgba(255,255,255,0.65)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',direction:'ltr'}}>{uploadUrl}</span>
          <button onClick={copyLink} style={{background:'rgba(0,229,255,0.1)',border:'1px solid rgba(0,229,255,0.25)',color:'#00e5ff',borderRadius:8,padding:'5px 12px',fontFamily:'inherit',fontSize:12,fontWeight:700,cursor:'pointer',flexShrink:0}}>העתק</button>
        </div>

        {/* Gallery */}
        {photos.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 24px',animation:'fadeIn 0.5s ease both'}}>
            <div style={{fontSize:64,marginBottom:16,opacity:0.35}}>📷</div>
            <h3 style={{fontSize:22,fontWeight:700,color:'rgba(255,255,255,0.5)',marginBottom:8}}>ממתין לתמונות...</h3>
            <p style={{color:'rgba(255,255,255,0.3)',marginBottom:24}}>שתף את ה-QR עם האורחים</p>
            <button onClick={()=>setShowQR(true)} style={{background:'transparent',color:'#00e5ff',border:'2px solid #00e5ff',borderRadius:100,padding:'12px 28px',fontFamily:'inherit',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 0 18px rgba(0,229,255,0.35)'}}>📱 הצג QR</button>
          </div>
        ) : (
          <div style={{columns:'auto 200px',gap:12}}>
            {photos.map((photo,i)=>(
              <div key={photo.id} className="ph" onClick={()=>setLightbox(photo)} style={{breakInside:'avoid',marginBottom:12,borderRadius:14,overflow:'hidden',cursor:'pointer',position:'relative',transition:'all 0.3s',animation:`fadeIn 0.4s ease ${Math.min(i*0.02,0.3)}s both`}}>
                <img src={photo.url} alt="" style={{width:'100%',display:'block'}} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
