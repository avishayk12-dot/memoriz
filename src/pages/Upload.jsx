import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { db, storage } from '../firebase'
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { ToastContainer, useToast } from '../components/Toast'

export default function Upload() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()
  const { toasts, show } = useToast()

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db,'events',eventId))
        if (!snap.exists()||!snap.data().active) { setNotFound(true); return }
        setEvent({ id:snap.id,...snap.data() })
      } catch { setNotFound(true) }
      finally { setLoading(false) }
    }
    fetch()
  }, [eventId])

  const addFiles = (newFiles) => {
    const imgs = [...newFiles].filter(f=>f.type.startsWith('image/'))
    if (!imgs.length) { show('רק קבצי תמונה מותרים','error'); return }
    setFiles(prev=>[...prev,...imgs.map(f=>({file:f,preview:URL.createObjectURL(f),progress:0,status:'pending'}))])
  }

  const uploadAll = async () => {
    if (!files.length) return
    setUploading(true)
    const results = [...files]
    await Promise.all(files.map((item,i)=>new Promise(resolve=>{
      const ext = item.file.name.split('.').pop()
      const name = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const storageRef = ref(storage,`events/${eventId}/${name}`)
      const task = uploadBytesResumable(storageRef,item.file)
      task.on('state_changed',
        snap=>{results[i]={...results[i],progress:Math.round(snap.bytesTransferred/snap.totalBytes*100),status:'uploading'};setFiles([...results]);},
        ()=>{results[i]={...results[i],status:'error'};setFiles([...results]);resolve();},
        async()=>{
          const url = await getDownloadURL(task.snapshot.ref)
          await addDoc(collection(db,'events',eventId,'photos'),{url,fileName:name,uploadedAt:serverTimestamp(),size:item.file.size})
          await updateDoc(doc(db,'events',eventId),{photoCount:increment(1)})
          results[i]={...results[i],progress:100,status:'done',url};setFiles([...results]);resolve()
        }
      )
    })))
    setUploading(false); setDone(true)
    show(`✨ ${files.filter(f=>f.status==='done').length} תמונות הועלו!`,'success')
  }

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#050310',fontFamily:'Heebo,sans-serif'}}><div style={{textAlign:'center'}}><div style={{width:40,height:40,border:'2px solid rgba(0,229,255,0.3)',borderTopColor:'#00e5ff',borderRadius:'50%',animation:'spin 0.7s linear infinite',margin:'0 auto 16px'}} /><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style><div style={{color:'rgba(255,255,255,0.5)'}}>טוען...</div></div></div>
  if (notFound) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#050310',textAlign:'center',padding:24,fontFamily:'Heebo,sans-serif',direction:'rtl'}}><div><div style={{fontSize:64,marginBottom:16}}>🔍</div><h2 style={{fontSize:26,fontWeight:800,marginBottom:8}}>האירוע לא נמצא</h2><p style={{color:'rgba(255,255,255,0.4)'}}>הקישור שגוי או שהאירוע הסתיים</p></div></div>

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#050310,#0a0618)',direction:'rtl',fontFamily:'Heebo,sans-serif',position:'relative',overflow:'hidden'}}>
      <style>{`
        @keyframes orb{0%,100%{transform:translateY(0);}50%{transform:translateY(-20px);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
        @keyframes pop{from{transform:scale(0) rotate(-15deg);opacity:0;}to{transform:scale(1) rotate(0);opacity:1;}}
        @keyframes pulse{0%,100%{box-shadow:0 0 6px #00e5ff;}50%{box-shadow:0 0 14px #00e5ff,0 0 26px #00e5ff;}}
        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
      <div style={{position:'fixed',width:500,height:500,borderRadius:'50%',filter:'blur(110px)',opacity:0.2,background:'radial-gradient(circle,#b400ff,transparent)',top:-150,right:-100,animation:'orb 10s ease-in-out infinite',pointerEvents:'none',zIndex:0}} />
      <div style={{position:'fixed',width:400,height:400,borderRadius:'50%',filter:'blur(110px)',opacity:0.2,background:'radial-gradient(circle,#00e5ff,transparent)',bottom:-100,left:-80,animation:'orb 10s ease-in-out infinite',animationDelay:'-4s',pointerEvents:'none',zIndex:0}} />
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div style={{background:'rgba(0,229,255,0.06)',borderBottom:'1px solid rgba(0,229,255,0.15)',padding:'18px 24px',textAlign:'center',position:'relative',zIndex:2}}>
        <div style={{fontSize:22,fontWeight:900,background:'linear-gradient(90deg,#00e5ff,#b400ff,#ff2d9b)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmerNav 4s linear infinite',display:'inline-block',marginBottom:4}}>Memoriz</div>
        <style>{'@keyframes shimmerNav{to{background-position:200% center;}}'}</style>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.35)'}}>אלבום דיגיטלי לאירועים</div>
      </div>

      <div style={{maxWidth:520,margin:'0 auto',padding:'36px 20px 60px',position:'relative',zIndex:2}}>

        {/* Event card */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(0,229,255,0.2)',borderRadius:22,padding:26,textAlign:'center',marginBottom:24,position:'relative',overflow:'hidden',animation:'fadeIn 0.5s ease both'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#00e5ff,#b400ff,#ff2d9b,transparent)'}} />
          <div style={{fontSize:44,marginBottom:10}}>📷</div>
          <div style={{fontSize:22,fontWeight:900,letterSpacing:-0.5,marginBottom:6}}>{event.name}</div>
          {event.description && <div style={{fontSize:14,color:'rgba(255,255,255,0.5)',marginBottom:8,lineHeight:1.6}}>{event.description}</div>}
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginTop:12,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(0,229,255,0.1)',border:'1px solid rgba(0,229,255,0.25)',borderRadius:100,padding:'4px 12px',fontSize:12,fontWeight:700,color:'#00e5ff'}}>
              <span style={{width:6,height:6,background:'#00e5ff',borderRadius:'50%',animation:'pulse 1.5s infinite'}} /> אלבום פעיל
            </div>
            {event.date && <div style={{fontSize:13,color:'rgba(255,255,255,0.4)'}}>📅 {event.date}</div>}
          </div>
        </div>

        {done ? (
          <div style={{textAlign:'center',padding:'40px 20px',animation:'fadeIn 0.5s ease both'}}>
            <div style={{fontSize:72,marginBottom:16,animation:'pop 0.5s ease'}}>🎊</div>
            <div style={{fontSize:26,fontWeight:900,marginBottom:8}}>תודה!</div>
            <div style={{fontSize:15,color:'rgba(255,255,255,0.5)',lineHeight:1.7,marginBottom:28}}>
              {files.filter(f=>f.status==='done').length} תמונות הועלו בהצלחה!<br/>
              הן יופיעו עכשיו אצל בעלי האירוע 💜
            </div>
            <button onClick={()=>{setFiles([]);setDone(false);}} style={{background:'transparent',color:'#00e5ff',border:'2px solid #00e5ff',borderRadius:100,padding:'13px 32px',fontFamily:'inherit',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 0 18px rgba(0,229,255,0.35)'}}>+ העלה עוד תמונות</button>
          </div>
        ) : (
          <>
            {/* Dropzone */}
            <div
              onDragOver={e=>{e.preventDefault();setDragOver(true)}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);addFiles(e.dataTransfer.files)}}
              onClick={()=>!uploading&&fileRef.current.click()}
              style={{border:`2px dashed ${dragOver?'#00e5ff':'rgba(0,229,255,0.25)'}`,borderRadius:20,padding:'48px 24px',textAlign:'center',cursor:uploading?'not-allowed':'pointer',background:dragOver?'rgba(0,229,255,0.06)':'rgba(0,229,255,0.02)',transition:'all 0.3s',marginBottom:18,boxShadow:dragOver?'0 0 30px rgba(0,229,255,0.15)':'none',animation:'fadeIn 0.5s ease 0.1s both'}}>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>addFiles(e.target.files)} />
              <div style={{fontSize:48,marginBottom:14,animation:'float 3s ease-in-out infinite'}}>📷</div>
              <div style={{fontSize:19,fontWeight:800,marginBottom:6}}>לחץ לבחירת תמונות</div>
              <div style={{fontSize:14,color:'rgba(255,255,255,0.4)'}}>או גרור לכאן · מספר תמונות בבת אחת</div>
            </div>

            {files.length > 0 && (
              <>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.5)'}}>{files.length} תמונות נבחרו</div>
                  {!uploading && <button onClick={()=>setFiles([])} style={{background:'none',border:'none',color:'rgba(255,45,155,0.6)',fontFamily:'inherit',fontSize:13,cursor:'pointer',fontWeight:600}}>נקה הכל</button>}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(76px,1fr))',gap:8,marginBottom:18}}>
                  {files.map((item,i)=>(
                    <div key={i} style={{position:'relative',borderRadius:10,overflow:'hidden',aspectRatio:1}}>
                      <img src={item.preview} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      {item.status==='uploading' && <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:4}}><div style={{fontSize:11,fontWeight:700}}>{item.progress}%</div><div style={{width:'80%',height:3,background:'rgba(255,255,255,0.2)',borderRadius:2}}><div style={{width:`${item.progress}%`,height:'100%',background:'#00e5ff',borderRadius:2,transition:'width 0.2s',boxShadow:'0 0 6px #00e5ff'}} /></div></div>}
                      {item.status==='done' && <div style={{position:'absolute',inset:0,background:'rgba(0,229,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:22,color:'#fff'}}>✓</span></div>}
                      {item.status==='pending'&&!uploading && <button onClick={e=>{e.stopPropagation();setFiles(p=>p.filter((_,j)=>j!==i));}} style={{position:'absolute',top:4,left:4,background:'rgba(0,0,0,0.7)',border:'none',color:'#fff',width:22,height:22,borderRadius:'50%',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>}
                    </div>
                  ))}
                </div>
                <button onClick={uploadAll} disabled={uploading} style={{width:'100%',background:'transparent',color:'#00e5ff',border:'2px solid #00e5ff',borderRadius:100,padding:16,fontFamily:'inherit',fontSize:17,fontWeight:700,cursor:'pointer',transition:'all 0.3s',boxShadow:'0 0 22px rgba(0,229,255,0.4)',textShadow:'0 0 10px rgba(0,229,255,0.6)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10}}
                  onMouseEnter={e=>{if(!uploading)e.currentTarget.style.background='rgba(0,229,255,0.1)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                  {uploading?<><span style={{width:20,height:20,border:'2px solid rgba(0,229,255,0.3)',borderTopColor:'#00e5ff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'}} />מעלה תמונות...</>:`📤 העלה ${files.length} תמונות`}
                </button>
              </>
            )}
            <div style={{textAlign:'center',fontSize:12,color:'rgba(255,255,255,0.2)',marginTop:8}}>ללא הרשמה · ללא אפליקציה · חינם לגמרי</div>
          </>
        )}

        <div style={{textAlign:'center',marginTop:32,fontSize:12,color:'rgba(255,255,255,0.2)'}}>מופעל על ידי Memoriz</div>
      </div>
    </div>
  )
}
