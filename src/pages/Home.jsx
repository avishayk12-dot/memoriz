import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const frameRef = useRef()
  const heroRef = useRef()

  useEffect(() => {
    // ── STARFIELD ──
    const starCanvas = document.getElementById('starfield')
    const starCtx = starCanvas?.getContext('2d')
    let stars = [], scrollY = 0
    function resizeStar() {
      if(!starCanvas) return
      starCanvas.width = innerWidth; starCanvas.height = innerHeight
      const count = Math.floor((starCanvas.width * starCanvas.height) / 8000)
      stars = []
      for (let i=0;i<count;i++) stars.push({x:Math.random()*starCanvas.width,y:Math.random()*starCanvas.height,z:Math.random(),r:Math.random()*1.5+0.3,color:['#00e5ff','#ff2d9b','#b400ff','#ffffff'][Math.floor(Math.random()*4)],tw:Math.random()*Math.PI*2})
    }
    window.addEventListener('scroll', ()=>scrollY=window.scrollY)
    resizeStar(); window.addEventListener('resize', resizeStar)
    let starRaf
    function drawStar() {
      if(!starCtx||!starCanvas) return
      starCtx.clearRect(0,0,starCanvas.width,starCanvas.height)
      for (const s of stars) {
        s.tw += 0.02; const tw=(Math.sin(s.tw)*0.4+0.6)
        const y=(s.y-scrollY*s.z*0.3)%starCanvas.height; const yy=y<0?y+starCanvas.height:y
        starCtx.globalAlpha=tw*(0.3+s.z*0.5); starCtx.fillStyle=s.color
        starCtx.shadowBlur=6; starCtx.shadowColor=s.color
        starCtx.beginPath(); starCtx.arc(s.x,yy,s.r*(0.5+s.z),0,Math.PI*2); starCtx.fill()
      }
      starCtx.globalAlpha=1; starCtx.shadowBlur=0
      starRaf=requestAnimationFrame(drawStar)
    }
    drawStar()

    // ── NEON LINES (bg) ──
    const nlCanvas = document.getElementById('neonLines')
    const nlCtx = nlCanvas?.getContext('2d')
    function resizeNL() { if(nlCanvas){nlCanvas.width=innerWidth;nlCanvas.height=innerHeight;} }
    resizeNL(); window.addEventListener('resize',resizeNL)
    const NLC=['#ff2d9b','#00e5ff','#b400ff']
    const nlLines=[]
    function spawnNL(){const col=NLC[Math.floor(Math.random()*NLC.length)];const ang=[42,48,-42,-48][Math.floor(Math.random()*4)]*Math.PI/180;const edge=Math.floor(Math.random()*2);let sx,sy;if(edge===0){sx=Math.random()*(nlCanvas?.width||1000);sy=-50;}else{sx=-50;sy=Math.random()*(nlCanvas?.height||800);}const sp=1.5+Math.random()*2;return{hx:sx,hy:sy,dx:Math.cos(ang)*sp,dy:Math.sin(ang)*sp,tail:[],len:150+Math.random()*200,col,w:0.8+Math.random()*0.8,op:0.4+Math.random()*0.3};}
    for(let i=0;i<5;i++){const s=spawnNL();for(let j=0;j<60;j++){s.hx+=s.dx;s.hy+=s.dy;s.tail.unshift({x:s.hx,y:s.hy});}nlLines.push(s);}
    let nlF=0, nlRaf
    function drawNL(){
      if(!nlCtx||!nlCanvas) return
      nlCtx.clearRect(0,0,nlCanvas.width,nlCanvas.height); nlF++
      if(nlF%70===0&&nlLines.length<9)nlLines.push(spawnNL())
      for(let i=nlLines.length-1;i>=0;i--){
        const l=nlLines[i];l.hx+=l.dx;l.hy+=l.dy;l.tail.unshift({x:l.hx,y:l.hy})
        const max=Math.ceil(l.len/Math.sqrt(l.dx*l.dx+l.dy*l.dy));if(l.tail.length>max)l.tail.length=max
        if(l.hx>nlCanvas.width+200||l.hy>nlCanvas.height+200){nlLines.splice(i,1);continue}
        for(let j=1;j<l.tail.length;j++){
          const t=1-j/l.tail.length;const p0=l.tail[j-1],p1=l.tail[j]
          nlCtx.save();nlCtx.globalAlpha=l.op*t*0.4;nlCtx.shadowBlur=14;nlCtx.shadowColor=l.col;nlCtx.strokeStyle=l.col;nlCtx.lineWidth=l.w*3;nlCtx.lineCap='round'
          nlCtx.beginPath();nlCtx.moveTo(p0.x,p0.y);nlCtx.lineTo(p1.x,p1.y);nlCtx.stroke()
          nlCtx.globalAlpha=l.op*t;nlCtx.shadowBlur=4;nlCtx.lineWidth=l.w;nlCtx.strokeStyle=j<3?'#fff':l.col
          nlCtx.beginPath();nlCtx.moveTo(p0.x,p0.y);nlCtx.lineTo(p1.x,p1.y);nlCtx.stroke();nlCtx.restore()
        }
      }
      nlRaf=requestAnimationFrame(drawNL)
    }
    drawNL()

    // ── HOLOGRAM (hero) ──
    const hCanvas = document.getElementById('hologramCanvas')
    const hCtx = hCanvas?.getContext('2d')
    function resizeH(){if(hCanvas&&heroRef.current){hCanvas.width=heroRef.current.offsetWidth;hCanvas.height=heroRef.current.offsetHeight;}}
    resizeH(); window.addEventListener('resize',resizeH)
    const HC=[{l:'#ff2d9b'},{l:'#00e5ff'},{l:'#b400ff'},{l:'#00e5ff'},{l:'#ff2d9b'}]
    const hSegs=[]
    function spawnH(){const col=HC[Math.floor(Math.random()*HC.length)];const diag=[42,48,-42,-48,38,52][Math.floor(Math.random()*6)]*Math.PI/180;const edge=Math.floor(Math.random()*4);let sx,sy;const m=60,w=hCanvas?.width||800,h=hCanvas?.height||600;if(edge===0){sx=Math.random()*(w+m*2)-m;sy=-m;}else if(edge===1){sx=w+m;sy=Math.random()*h;}else if(edge===2){sx=Math.random()*(w+m*2)-m;sy=h+m;}else{sx=-m;sy=Math.random()*h;}const sp=1.8+Math.random()*2;return{sx,sy,hx:sx,hy:sy,dx:Math.cos(diag)*sp,dy:Math.sin(diag)*sp,tail:[],len:130+Math.random()*200,col,w:0.9+Math.random(),op:0.5+Math.random()*0.3};}
    for(let i=0;i<7;i++){const s=spawnH();const t=Math.random()*100;for(let j=0;j<t;j++){s.hx+=s.dx;s.hy+=s.dy;s.tail.unshift({x:s.hx,y:s.hy});}hSegs.push(s);}
    let hF=0, hRaf
    function drawH(){
      if(!hCtx||!hCanvas) return
      hCtx.clearRect(0,0,hCanvas.width,hCanvas.height); hF++
      if(hF%55===0&&hSegs.length<14)hSegs.push(spawnH())
      for(let i=hSegs.length-1;i>=0;i--){
        const s=hSegs[i];s.hx+=s.dx;s.hy+=s.dy;s.tail.unshift({x:s.hx,y:s.hy})
        const max=Math.ceil(s.len/Math.sqrt(s.dx*s.dx+s.dy*s.dy));if(s.tail.length>max)s.tail.length=max
        const pad=200;if((s.hx<-pad||s.hx>hCanvas.width+pad||s.hy<-pad||s.hy>hCanvas.height+pad)&&s.tail.length<=1){hSegs.splice(i,1);continue}
        for(let j=1;j<s.tail.length;j++){
          const t=1-j/s.tail.length;const p0=s.tail[j-1],p1=s.tail[j]
          hCtx.save();hCtx.globalAlpha=s.op*t*0.2;hCtx.shadowBlur=18;hCtx.shadowColor=s.col.l;hCtx.strokeStyle=s.col.l;hCtx.lineWidth=s.w*4;hCtx.lineCap='round';hCtx.beginPath();hCtx.moveTo(p0.x,p0.y);hCtx.lineTo(p1.x,p1.y);hCtx.stroke()
          hCtx.globalAlpha=s.op*t*0.5;hCtx.shadowBlur=8;hCtx.lineWidth=s.w*2;hCtx.beginPath();hCtx.moveTo(p0.x,p0.y);hCtx.lineTo(p1.x,p1.y);hCtx.stroke()
          hCtx.globalAlpha=s.op*t*0.95;hCtx.shadowBlur=4;hCtx.lineWidth=s.w;hCtx.strokeStyle=j<4?'#fff':s.col.l;hCtx.beginPath();hCtx.moveTo(p0.x,p0.y);hCtx.lineTo(p1.x,p1.y);hCtx.stroke();hCtx.restore()
        }
        if(s.tail.length>0){const h2=s.tail[0];hCtx.save();hCtx.globalAlpha=s.op;hCtx.shadowBlur=22;hCtx.shadowColor=s.col.l;hCtx.fillStyle='#fff';hCtx.beginPath();hCtx.arc(h2.x,h2.y,s.w*2.2,0,Math.PI*2);hCtx.fill();hCtx.restore()}
      }
      hRaf=requestAnimationFrame(drawH)
    }
    drawH()

    // ── CURSOR GLOW ──
    const glow = document.getElementById('cursorGlow')
    let gx=innerWidth/2,gy=200,tx=gx,ty=gy
    const onMouseMove = e=>{tx=e.clientX;ty=e.clientY}
    document.addEventListener('mousemove',onMouseMove)
    let glowRaf
    function glowLoop(){gx+=(tx-gx)*0.1;gy+=(ty-gy)*0.1;if(glow){glow.style.left=gx+'px';glow.style.top=gy+'px';}glowRaf=requestAnimationFrame(glowLoop)}
    glowLoop()

    // ── NAV SCROLL ──
    const nav = document.getElementById('homeNav')
    const onScroll = ()=>{ if(nav) nav.classList.toggle('scrolled', window.scrollY>40) }
    window.addEventListener('scroll', onScroll)

    // ── PHONE TILT ──
    const frame = frameRef.current
    const hero = heroRef.current
    let tiltOn = false
    const tiltTimer = setTimeout(()=>tiltOn=true, 3400)
    const onHeroMove = e=>{
      if(!tiltOn||!frame) return
      const r=hero.getBoundingClientRect()
      const px=(e.clientX-r.left)/r.width-0.5; const py=(e.clientY-r.top)/r.height-0.5
      frame.style.animation='none'
      frame.style.transform=`rotateY(${px*22}deg) rotateX(${-py*14}deg) translateY(${-py*8}px)`
    }
    const onHeroLeave = ()=>{ if(tiltOn&&frame) frame.style.animation='phoneFloat 6s ease-in-out infinite' }
    if(hero){ hero.addEventListener('mousemove',onHeroMove); hero.addEventListener('mouseleave',onHeroLeave) }

    // ── PHOTO GRID ──
    const grid = document.getElementById('photoGrid')
    if(grid){
      const g=['#00e5ff,#b400ff','#ff2d9b,#b400ff','#00e5ff,#2979ff','#b400ff,#ff2d9b','#2979ff,#00e5ff','#ff2d9b,#00e5ff','#b400ff,#2979ff','#00e5ff,#ff2d9b','#2979ff,#b400ff']
      g.forEach((gr,i)=>{const d=document.createElement('div');d.className='photo-item';d.style.background=`linear-gradient(135deg,${gr})`;d.style.animationDelay=(0.7+i*0.12)+'s';grid.appendChild(d);})
    }

    // ── CAMERA FLASHES ──
    const stage = document.getElementById('phoneStage')
    const hf = document.getElementById('heroFlash')
    const cn = document.getElementById('counter')
    function fireFlash(big){
      if(!stage) return
      const w=stage.offsetWidth,h=stage.offsetHeight
      const wrap=document.createElement('div');wrap.style.cssText='position:absolute;pointer-events:none;z-index:6;opacity:0;border-radius:50%;'
      const size=big?(140+Math.random()*70):(70+Math.random()*60)
      const side=Math.floor(Math.random()*5);let x,y
      if(side===0){x=Math.random()*w*0.9+w*0.05;y=h*0.1}else if(side===1){x=w*0.88;y=h*(0.15+Math.random()*0.5)}else if(side===2){x=w*0.12;y=h*(0.15+Math.random()*0.5)}else if(side===3){x=Math.random()*w*0.9+w*0.05;y=h*0.78}else{x=w*(0.2+Math.random()*0.6);y=h*(0.2+Math.random()*0.4)}
      wrap.style.left=(x-size/2)+'px';wrap.style.top=(y-size/2)+'px';wrap.style.width=size+'px';wrap.style.height=size+'px'
      wrap.style.background='radial-gradient(circle,rgba(255,255,255,1) 0%,rgba(220,240,255,0.85) 18%,rgba(180,200,255,0.3) 45%,transparent 70%)'
      wrap.style.animation=`proFlash ${big?0.75:0.55}s cubic-bezier(.1,.7,.3,1) forwards`
      if(big){
        const st=document.createElement('div');st.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);'
        const hh=document.createElement('div');hh.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:160px;height:2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent);'
        const vv=document.createElement('div');vv.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:2px;height:160px;background:linear-gradient(180deg,transparent,rgba(255,255,255,0.9),transparent);'
        st.appendChild(hh);st.appendChild(vv);wrap.appendChild(st)
        if(hf){hf.style.transition='none';hf.style.opacity='1';requestAnimationFrame(()=>{hf.style.transition='opacity 0.5s ease';hf.style.opacity='0';})}
        if(cn){cn.textContent=parseInt(cn.textContent)+1;cn.style.transform='scale(1.3)';setTimeout(()=>cn.style.transform='scale(1)',200)}
      }
      stage.appendChild(wrap);setTimeout(()=>wrap.remove(),850)
    }
    let flashTO
    function scheduleFlash(){const big=Math.random()>0.62;fireFlash(big);if(big&&Math.random()>0.6)setTimeout(()=>fireFlash(false),130);flashTO=setTimeout(scheduleFlash,big?(900+Math.random()*700):(500+Math.random()*500));}
    const flashKick=setTimeout(scheduleFlash,3200)

    // ── QR ──
    if(window.QRCode && document.getElementById('qrcode') && !document.getElementById('qrcode').children.length){
      try{new window.QRCode(document.getElementById('qrcode'),{text:window.location.origin+'/upload/demo',width:182,height:182,colorDark:'#050310',colorLight:'#ffffff',correctLevel:2})}catch(e){}
    }

    // ── SCROLL REVEAL ──
    const obs = new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),{threshold:0.12,rootMargin:'0px 0px -50px 0px'})
    document.querySelectorAll('.reveal').forEach(el=>obs.observe(el))
    document.querySelectorAll('.features-wrapper .feature-card').forEach((el,i)=>el.style.transitionDelay=(i*0.07)+'s')
    document.querySelectorAll('.usecase-card').forEach((el,i)=>el.style.transitionDelay=(i*0.09)+'s')
    document.querySelectorAll('.pricing-card').forEach((el,i)=>el.style.transitionDelay=(i*0.1)+'s')

    // ── STEPS ──
    const stepsEl=document.getElementById('steps');const sf=document.getElementById('stepsFill');const st=[...document.querySelectorAll('.step')]
    function updateSteps(){if(!stepsEl)return;const r=stepsEl.getBoundingClientRect();const vh=innerHeight;let p=(vh*0.8-r.top)/(vh*0.55+r.height*0.4);p=Math.max(0,Math.min(1,p));if(sf)sf.style.height=(p*100)+'%';const ac=Math.round(p*st.length);st.forEach((s,i)=>s.classList.toggle('done',i<ac));}
    window.addEventListener('scroll',updateSteps);updateSteps()

    // ── COUNTERS ──
    function animCount(el){const t=parseInt(el.dataset.target);const suf=el.dataset.suffix||'';let c=0;const s=t/(1600/16);const tm=setInterval(()=>{c+=s;if(c>=t){c=t;clearInterval(tm);}el.textContent=Math.floor(c).toLocaleString()+suf;},16);}
    const cObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&e.target.dataset.target){animCount(e.target);cObs.unobserve(e.target);}}),{threshold:0.5})
    document.querySelectorAll('.stat-num[data-target]').forEach(el=>cObs.observe(el))

    // ── FEATURE CARD GLOW ──
    document.querySelectorAll('.feature-card').forEach(card=>card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');}))

    // ── SVG NEON TEXT SIZE ──
    function fitNeonSVG(){const svg=document.getElementById('neonSVG');if(!svg)return;const h1=svg.closest('h1');const fs=h1?parseFloat(getComputedStyle(h1).fontSize):90;const chars='מהאירוע שלכם'.length;const w=fs*chars*0.6;const h=fs*1.25;svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.querySelectorAll('text').forEach(t=>{t.setAttribute('font-size',fs+'px');t.setAttribute('y',h*0.78);});}
    if(document.fonts)document.fonts.ready.then(fitNeonSVG);window.addEventListener('resize',fitNeonSVG);setTimeout(fitNeonSVG,200);setTimeout(fitNeonSVG,700)

    // inject proFlash keyframe
    if(!document.getElementById('pfStyle')){const s=document.createElement('style');s.id='pfStyle';s.textContent='@keyframes proFlash{0%{opacity:0;transform:scale(0.3);}8%{opacity:1;transform:scale(1);}22%{opacity:0.85;transform:scale(1.05);}100%{opacity:0;transform:scale(1.35);}}';document.head.appendChild(s);}

    return ()=>{
      cancelAnimationFrame(starRaf);cancelAnimationFrame(nlRaf);cancelAnimationFrame(hRaf);cancelAnimationFrame(glowRaf)
      clearTimeout(tiltTimer);clearTimeout(flashKick);clearTimeout(flashTO)
      document.removeEventListener('mousemove',onMouseMove)
      window.removeEventListener('scroll',onScroll);window.removeEventListener('scroll',updateSteps)
      window.removeEventListener('resize',resizeStar);window.removeEventListener('resize',resizeNL);window.removeEventListener('resize',resizeH);window.removeEventListener('resize',fitNeonSVG)
      if(hero){hero.removeEventListener('mousemove',onHeroMove);hero.removeEventListener('mouseleave',onHeroLeave)}
      obs.disconnect();cObs.disconnect()
    }
  }, [])

  return (
    <div style={{overflowX:'hidden',background:'#050310'}}>
      <style>{`
        @keyframes phoneSpin{0%{transform:rotateY(-220deg) rotateX(12deg) scale(0.75);}65%{transform:rotateY(14deg) rotateX(3deg) scale(1.02);}100%{transform:rotateY(0deg) rotateX(0deg) scale(1);}}
        @keyframes phoneFloat{0%,100%{transform:rotateY(0deg) rotateX(0deg) translateY(0);}50%{transform:rotateY(0deg) rotateX(0deg) translateY(-18px);}}
        @keyframes dotpulse{0%,100%{box-shadow:0 0 0 0 rgba(0,229,255,0.5);}50%{box-shadow:0 0 0 7px rgba(0,229,255,0);}}
        @keyframes shimmer{to{background-position:200% center;}}
        @keyframes gridpan{from{background-position:0 0;}to{background-position:64px 64px;}}
        @keyframes heroIn{from{opacity:0;transform:translateY(34px);}to{opacity:1;transform:none;}}
        @keyframes float{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-36px) scale(1.06);}}
        @keyframes photoPop{to{opacity:1;transform:scale(1);}}
        @keyframes badgefloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
        @keyframes writeOn{0%{stroke-dashoffset:2400;opacity:1;}50%{stroke-dashoffset:0;opacity:1;}70%{stroke-dashoffset:0;opacity:0.6;}100%{stroke-dashoffset:0;opacity:0;}}
        @keyframes logoShimmer{to{background-position:200% center;}}
        @keyframes neonpulse{0%,100%{box-shadow:0 0 6px #00e5ff;}50%{box-shadow:0 0 18px #00e5ff,0 0 30px #00e5ff;}}
        .reveal{opacity:0;transform:translateY(46px);transition:all 0.9s cubic-bezier(.16,1,.3,1);}
        .reveal.visible{opacity:1;transform:none;}
        .orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:0.4;animation:float 9s ease-in-out infinite;}
        .hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,229,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.07) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse 75% 75% at 50% 45%,black 15%,transparent 100%);animation:gridpan 30s linear infinite;pointer-events:none;}
        .phone-rotor{transform-style:preserve-3d;animation:phoneSpin 2.4s cubic-bezier(.5,0,.2,1) 0.6s both;}
        .phone-frame{width:300px;height:620px;border-radius:54px;margin:0 auto;position:relative;transform-style:preserve-3d;background:linear-gradient(135deg,#6b6b73 0%,#2b2b30 18%,#4a4a52 40%,#1c1c20 60%,#55555d 82%,#2b2b30 100%);padding:5px;box-shadow:0 0 0 2px rgba(0,229,255,0.5),0 0 40px rgba(0,229,255,0.4),0 0 80px rgba(180,0,255,0.25),0 60px 140px rgba(0,0,0,0.8);animation:phoneFloat 6s ease-in-out infinite 3.3s;}
        .phone-frame::before{content:'';position:absolute;left:-3px;top:130px;width:3px;height:58px;background:linear-gradient(90deg,#1c1c20,#55555d);border-radius:3px 0 0 3px;}
        .phone-frame::after{content:'';position:absolute;right:-3px;top:100px;width:3px;height:34px;background:linear-gradient(270deg,#1c1c20,#55555d);border-radius:0 3px 3px 0;box-shadow:0 50px 0 #2b2b30,0 95px 0 #2b2b30;}
        .phone-bezel{position:absolute;inset:5px;border-radius:49px;background:#000;padding:9px;overflow:hidden;}
        .phone-inner-screen{width:100%;height:100%;border-radius:41px;overflow:hidden;position:relative;background:linear-gradient(165deg,#0a0618,#120a28);}
        .phone-island{position:absolute;top:13px;left:50%;transform:translateX(-50%);width:92px;height:26px;background:#000;border-radius:16px;z-index:8;}
        .phone-island::after{content:'';position:absolute;right:10px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#00e5ff,#050310);box-shadow:0 0 6px rgba(0,229,255,0.8);}
        .phone-glare{position:absolute;inset:0;z-index:7;pointer-events:none;background:linear-gradient(125deg,rgba(255,255,255,0.18) 0%,transparent 30%,transparent 70%,rgba(0,229,255,0.08) 100%);mix-blend-mode:screen;}
        .phone-screen-content{padding:48px 16px 16px;position:relative;height:100%;color:#fff;display:flex;flex-direction:column;}
        .photo-item{aspect-ratio:1;border-radius:8px;position:relative;overflow:hidden;opacity:0;transform:scale(0.5);animation:photoPop 0.6s cubic-bezier(.16,1.4,.4,1) forwards;}
        .photo-item::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.3),transparent 50%);}
        .photo-grid-ph{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;}
        .float-badge{position:absolute;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.13);backdrop-filter:blur(20px);border-radius:16px;padding:11px 18px;font-size:13px;font-weight:600;white-space:nowrap;box-shadow:0 12px 40px rgba(0,0,0,0.3);}
        .fb1{top:12%;right:-150px;color:#00e5ff;animation:badgefloat 3.5s ease-in-out infinite;}
        .fb2{top:46%;left:-140px;color:#c4b5fd;animation:badgefloat 3.5s ease-in-out infinite;animation-delay:-1.2s;}
        .fb3{bottom:14%;right:-130px;color:#86efac;animation:badgefloat 3.5s ease-in-out infinite;animation-delay:-2.4s;}
        .gradient-text{background:linear-gradient(90deg,#00e5ff 0%,#00bfff 12%,#7b5cf6 35%,#b400ff 52%,#d400cc 68%,#ff2d9b 82%,#00e5ff 100%);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 6s linear infinite;}
        .glow-word{background:linear-gradient(90deg,#00e5ff,#b400ff,#ff2d9b,#00e5ff);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:logoShimmer 4s linear infinite;}
        .neon-text-svg{display:inline-block;overflow:visible;vertical-align:middle;}
        .neon-text-svg text{font-family:'Heebo',sans-serif;font-weight:900;}
        .txt-fill{fill:rgba(0,229,255,0.18);}
        .txt-stroke{fill:none;stroke-width:1.6px;stroke-dasharray:2400;stroke-dashoffset:2400;}
        .txt-stroke-c{stroke:#00e5ff;filter:drop-shadow(0 0 4px #00e5ff) drop-shadow(0 0 10px #00e5ff);animation:writeOn 4s ease-in-out infinite;}
        .txt-stroke-p{stroke:#b400ff;filter:drop-shadow(0 0 4px #b400ff) drop-shadow(0 0 10px #b400ff);animation:writeOn 4s ease-in-out 2s infinite;}
        .section-tag{display:inline-block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#00e5ff;margin-bottom:16px;text-shadow:0 0 10px rgba(0,229,255,0.5);}
        .hero-flash{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(255,255,255,0.08),transparent 60%);opacity:0;pointer-events:none;z-index:2;}
        .feature-card{background:rgba(0,229,255,0.02);border:1px solid rgba(0,229,255,0.15);border-radius:24px;padding:36px;transition:all 0.4s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;}
        .feature-card::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--mx,50%) var(--my,0%),rgba(0,229,255,0.12),transparent 60%);opacity:0;transition:opacity 0.4s;}
        .feature-card:hover{border-color:rgba(0,229,255,0.5);box-shadow:0 0 30px rgba(0,229,255,0.15),0 30px 70px rgba(0,229,255,0.1);}
        .feature-card:hover::before{opacity:1;}
        .feature-icon{width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:25px;margin-bottom:20px;transition:transform 0.4s;}
        .feature-card:hover .feature-icon{transform:scale(1.15) rotate(-8deg);}
        .usecase-card{border-radius:24px;padding:36px 28px;position:relative;overflow:hidden;cursor:pointer;transition:all 0.4s cubic-bezier(.16,1,.3,1);min-height:220px;display:flex;flex-direction:column;justify-content:flex-end;}
        .usecase-card::before{content:'';position:absolute;inset:0;background:inherit;filter:brightness(0.62);transition:filter 0.4s;z-index:0;}
        .usecase-card:hover::before{filter:brightness(0.95);}
        .usecase-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 30px 70px rgba(0,0,0,0.5),0 0 30px rgba(0,229,255,0.2);}
        .usecase-card:hover .uc-emoji{transform:scale(1.2) translateY(-4px);}
        .uc-emoji{font-size:42px;margin-bottom:16px;position:relative;z-index:1;transition:transform 0.4s;}
        .steps-line{position:absolute;right:21px;top:30px;bottom:30px;width:2px;background:rgba(255,255,255,0.08);}
        .steps-line-fill{position:absolute;top:0;right:0;width:100%;height:0%;background:linear-gradient(180deg,#00e5ff,#b400ff,#ff2d9b);box-shadow:0 0 10px #00e5ff;transition:height 0.2s ease;}
        .step{display:flex;gap:24px;align-items:flex-start;padding:26px 0;position:relative;}
        .step-num{width:44px;height:44px;border-radius:50%;background:#120a28;border:2px solid rgba(0,229,255,0.4);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:#00e5ff;flex-shrink:0;z-index:2;transition:all 0.4s cubic-bezier(.16,1.4,.4,1);position:relative;}
        .step.done .step-num{background:linear-gradient(135deg,#00e5ff,#b400ff);border-color:transparent;color:white;transform:scale(1.1);box-shadow:0 0 24px rgba(0,229,255,0.7);}
        .step-num .num{transition:opacity 0.3s;}
        .step-num .check{position:absolute;opacity:0;transform:scale(0);transition:all 0.4s cubic-bezier(.16,1.6,.4,1);font-size:22px;}
        .step.done .step-num .num{opacity:0;}
        .step.done .step-num .check{opacity:1;transform:scale(1);}
        .step.done .step-content h3{color:#00e5ff;text-shadow:0 0 8px rgba(0,229,255,0.4);}
        .qr-card{background:linear-gradient(160deg,#120a28,#0a0618);border:1px solid rgba(0,229,255,0.18);border-radius:32px;padding:48px;text-align:center;position:relative;overflow:hidden;box-shadow:0 40px 90px rgba(0,0,0,0.5),0 0 40px rgba(0,229,255,0.1);}
        .qr-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#00e5ff,#b400ff,#ff2d9b,transparent);}
        .qr-wrap{width:210px;height:210px;margin:0 auto 26px;background:white;border-radius:20px;padding:14px;position:relative;box-shadow:0 20px 50px rgba(0,229,255,0.3),0 0 30px rgba(0,229,255,0.4);}
        .qr-scan{position:absolute;left:14px;right:14px;height:3px;background:linear-gradient(90deg,transparent,#00e5ff,transparent);border-radius:2px;box-shadow:0 0 16px #00e5ff;animation:qrscan 2.6s ease-in-out infinite;}
        @keyframes qrscan{0%,100%{top:14px;}50%{top:calc(100% - 17px);}}
        .qr-corner{position:absolute;width:26px;height:26px;border:3px solid #00e5ff;filter:drop-shadow(0 0 4px #00e5ff);}
        .pricing-card{background:rgba(0,229,255,0.02);border:1px solid rgba(0,229,255,0.15);border-radius:28px;padding:40px 36px;position:relative;overflow:hidden;transition:all 0.4s cubic-bezier(.16,1,.3,1);}
        .pricing-card:hover{transform:translateY(-6px);border-color:rgba(0,229,255,0.3);}
        .pricing-card.popular{background:linear-gradient(160deg,rgba(0,229,255,0.06),rgba(180,0,255,0.06));border-color:rgba(0,229,255,0.5);transform:scale(1.05);box-shadow:0 0 30px rgba(0,229,255,0.2),0 40px 90px rgba(0,229,255,0.15);}
        .pricing-card.popular:hover{transform:scale(1.05) translateY(-6px);}
        .pricing-btn{width:100%;padding:14px;border-radius:100px;font-family:'Heebo',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.3s;border:1.5px solid rgba(0,229,255,0.3);background:transparent;color:white;}
        .pricing-btn:hover{background:rgba(0,229,255,0.1);border-color:#00e5ff;}
        .popular .pricing-btn{background:transparent;border:2px solid #00e5ff;color:#00e5ff;box-shadow:0 0 16px rgba(0,229,255,0.5);}
        .popular .pricing-btn:hover{box-shadow:0 0 30px rgba(0,229,255,0.9);transform:translateY(-2px);}
        .stat-item:hover{transform:translateY(-4px);}
        @media(max-width:900px){.fb1,.fb2,.fb3{display:none;}.hiw-grid{grid-template-columns:1fr!important;}.features-grid{grid-template-columns:1fr!important;}.usecase-grid{grid-template-columns:1fr 1fr!important;}.pricing-grid{grid-template-columns:1fr!important;}.pricing-card.popular{transform:none!important;}.stats-bar{flex-wrap:wrap;}.stat-item{min-width:50%;border-bottom:1px solid rgba(255,255,255,0.06)!important;}}
      `}</style>

      {/* Fixed bg canvases */}
      <canvas id="starfield" style={{position:'fixed',inset:0,zIndex:0,opacity:0.6,pointerEvents:'none'}} />
      <canvas id="neonLines" style={{position:'fixed',inset:0,zIndex:0,opacity:0.5,pointerEvents:'none'}} />
      <div id="cursorGlow" style={{position:'fixed',width:600,height:600,borderRadius:'50%',pointerEvents:'none',zIndex:1,background:'radial-gradient(circle,rgba(0,229,255,0.06),rgba(180,0,255,0.03) 40%,transparent 70%)',transform:'translate(-50%,-50%)',willChange:'transform',mixBlendMode:'screen'}} />

      {/* ── HERO ── */}
      <section ref={heroRef} style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'150px 40px 100px',position:'relative',overflow:'hidden',perspective:1600,zIndex:2}}>
        <div className="orb" style={{width:680,height:680,background:'radial-gradient(circle,#b400ff,transparent)',top:-260,right:-140}} />
        <div className="orb" style={{width:580,height:580,background:'radial-gradient(circle,#00e5ff,transparent)',bottom:-180,left:-140,animationDelay:'-3s'}} />
        <div className="orb" style={{width:400,height:400,background:'radial-gradient(circle,#ff2d9b,transparent)',top:'30%',left:'35%',opacity:0.18,animationDelay:'-6s'}} />
        <div className="hero-grid" />
        <canvas id="hologramCanvas" style={{position:'absolute',inset:0,zIndex:1,pointerEvents:'none',opacity:0.8}} />

        <div style={{position:'relative',zIndex:3,display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:9,background:'rgba(0,229,255,0.08)',border:'1px solid rgba(0,229,255,0.3)',borderRadius:100,padding:'9px 20px',fontSize:13,fontWeight:600,color:'#00e5ff',marginBottom:30,animation:'heroIn 0.7s ease both',backdropFilter:'blur(10px)',boxShadow:'0 0 20px rgba(0,229,255,0.15)'}}>
            <span style={{width:7,height:7,background:'#00e5ff',borderRadius:'50%',boxShadow:'0 0 10px #00e5ff',animation:'neonpulse 1.5s infinite',display:'inline-block'}} />
            אלבום QR חכם לאירועים
          </div>

          <h1 style={{fontSize:'clamp(56px,8vw,110px)',fontWeight:900,lineHeight:1.0,letterSpacing:-4,marginBottom:28,fontFamily:'Heebo,sans-serif'}}>
            <span style={{display:'block',animation:'heroIn 0.9s ease 0.05s both'}}>כל התמונות</span>
            <span style={{display:'block',animation:'heroIn 0.9s ease 0.18s both'}}>
              <svg className="neon-text-svg" id="neonSVG" xmlns="http://www.w3.org/2000/svg" width="560" height="120" viewBox="0 0 560 120">
                <text className="txt-fill" x="50%" y="88" textAnchor="middle" fontSize="96">מהאירוע שלכם</text>
                <text className="txt-stroke txt-stroke-c" x="50%" y="88" textAnchor="middle" fontSize="96">מהאירוע שלכם</text>
                <text className="txt-stroke txt-stroke-p" x="50%" y="88" textAnchor="middle" fontSize="96">מהאירוע שלכם</text>
              </svg>
            </span>
            <span style={{display:'block',animation:'heroIn 0.9s ease 0.3s both'}}>במקום אחד</span>
          </h1>

          <p style={{fontSize:'clamp(18px,2.5vw,23px)',color:'rgba(255,255,255,0.62)',maxWidth:620,lineHeight:1.7,marginBottom:52,fontWeight:300,animation:'heroIn 0.9s ease 0.4s both',fontFamily:'Heebo,sans-serif'}}>
            האורחים מצלמים. אתם נהנים.<br/>אלבום דיגיטלי שנבנה בזמן אמת — ללא אפליקציה, ללא הרשמה.
          </p>

          <div style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center',animation:'heroIn 0.9s ease 0.5s both'}}>
            <Link to="/create" style={{background:'transparent',color:'#00e5ff',border:'2px solid #00e5ff',cursor:'pointer',padding:'17px 40px',borderRadius:100,fontFamily:'Heebo,sans-serif',fontSize:17,fontWeight:700,transition:'all 0.3s',boxShadow:'0 0 24px rgba(0,229,255,0.5)',textShadow:'0 0 10px rgba(0,229,255,0.7)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,229,255,0.1)';e.currentTarget.style.boxShadow='0 0 45px rgba(0,229,255,0.9)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.boxShadow='0 0 24px rgba(0,229,255,0.5)';}}>
              🎉 צור אלבום חינם
            </Link>
            <a href="#how" style={{background:'rgba(255,255,255,0.03)',color:'#d580ff',border:'1.5px solid rgba(180,0,255,0.5)',cursor:'pointer',padding:'17px 40px',borderRadius:100,fontFamily:'Heebo,sans-serif',fontSize:17,fontWeight:600,transition:'all 0.3s',backdropFilter:'blur(10px)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(180,0,255,0.1)';e.currentTarget.style.borderColor='#b400ff';e.currentTarget.style.boxShadow='0 0 25px rgba(180,0,255,0.5)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.borderColor='rgba(180,0,255,0.5)';e.currentTarget.style.boxShadow='none';}}>
              ראה איך זה עובד ←
            </a>
          </div>

          {/* 3D PHONE */}
          <div id="phoneStage" style={{marginTop:100,position:'relative',transformStyle:'preserve-3d',animation:'heroIn 1s ease 0.6s both'}}>
            <div id="heroFlash" className="hero-flash" />
            <div className="float-badge fb1">📸 247 תמונות נוספו</div>
            <div className="float-badge fb2">⚡ זמן אמת</div>
            <div className="float-badge fb3">✅ ללא אפליקציה</div>
            <div className="phone-rotor">
              <div className="phone-frame" ref={frameRef}>
                <div className="phone-bezel">
                  <div className="phone-inner-screen">
                    <div className="phone-island" />
                    <div className="phone-glare" />
                    <div className="phone-screen-content">
                      <div style={{textAlign:'center',fontSize:13,fontWeight:700,color:'#00e5ff',marginBottom:4,textShadow:'0 0 8px rgba(0,229,255,0.5)'}}>📷 האירוע שלכם</div>
                      <div style={{textAlign:'center',fontSize:17,marginBottom:10}}>💜</div>
                      <div style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:700,color:'#00e5ff',background:'rgba(0,229,255,0.1)',padding:'3px 10px',borderRadius:100,margin:'0 auto 10px'}}>
                        <span style={{width:6,height:6,background:'#00e5ff',borderRadius:'50%',boxShadow:'0 0 6px #00e5ff',animation:'neonpulse 1.5s infinite'}} /> שידור חי
                      </div>
                      <div className="photo-grid-ph" id="photoGrid" />
                      <div style={{marginTop:'auto',marginBottom:6,background:'linear-gradient(135deg,rgba(0,229,255,0.15),rgba(180,0,255,0.15))',border:'1px solid rgba(0,229,255,0.4)',borderRadius:18,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:12,color:'white',boxShadow:'0 0 16px rgba(0,229,255,0.3)'}}>
                        <span>תמונות באלבום</span>
                        <span id="counter" style={{fontWeight:900,fontSize:22,color:'#00e5ff',textShadow:'0 0 10px #00e5ff',transition:'transform 0.2s'}}>247</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="reveal" style={{display:'flex',marginTop:100,borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:60,width:'100%',maxWidth:820}}>
            {[['12000','+','אירועים שנוצרו'],['850','K+','תמונות שנאספו'],['4.9★','','דירוג ממוצע'],["3 שנ'","","פעילים בשוק"]].map(([num,suf,label],i)=>(
              <div key={i} className="stat-item" style={{flex:1,textAlign:'center',padding:'20px 12px',borderLeft:i<3?'1px solid rgba(255,255,255,0.06)':'none',transition:'all 0.3s'}}>
                <div className="stat-num" data-target={num} data-suffix={suf} style={{fontSize:40,fontWeight:900,lineHeight:1,marginBottom:8,background:'linear-gradient(135deg,#00e5ff,rgba(255,255,255,0.65))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textShadow:'0 0 20px rgba(0,229,255,0.4)'}}>{isNaN(num)?num:'0'+suf}</div>
                <div style={{fontSize:14,color:'rgba(255,255,255,0.42)'}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div style={{background:'#0a0618',borderTop:'1px solid rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.04)',position:'relative',zIndex:2}}>
        <section id="how" style={{padding:'130px 60px',maxWidth:1200,margin:'0 auto'}}>
          <div className="hiw-grid" style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:80,alignItems:'center'}}>
            <div>
              <span className="section-tag reveal">איך זה עובד</span>
              <h2 className="reveal" style={{fontSize:'clamp(38px,5vw,62px)',fontWeight:900,letterSpacing:-2,lineHeight:1.08,margin:'16px 0 12px',fontFamily:'Heebo,sans-serif'}}>שלושה צעדים.<br/><span className="glow-word">אלבום מושלם.</span></h2>
              <p className="reveal" style={{fontSize:18,color:'rgba(255,255,255,0.5)',fontWeight:300,lineHeight:1.7,marginBottom:48}}>בלי אפליקציות. בלי הסברים לאורחים. בלי לחץ.</p>
              <div id="steps" style={{display:'flex',flexDirection:'column',position:'relative'}}>
                <div className="steps-line"><div className="steps-line-fill" id="stepsFill"></div></div>
                {[['1','צור אלבום לאירוע שלך','הגדר שם, תאריך ופרטי האירוע. קבל QR ייחודי תוך שניות.'],
                  ['2','שתף את ה-QR עם האורחים','הדפס על שולחנות, שלח בוואטסאפ, או הצג על מסך.'],
                  ['3','צפה בזמן אמת ותהנה','האלבום מתמלא חי. בסוף — הורד הכל בלחיצה אחת.']].map(([num,title,desc])=>(
                  <div key={num} className="step reveal" style={{borderBottom:num!=='3'?'1px solid rgba(255,255,255,0.06)':'none'}}>
                    <div className="step-num"><span className="num">{num}</span><span className="check">✓</span></div>
                    <div className="step-content"><h3 style={{fontSize:18,fontWeight:700,marginBottom:6}}>{title}</h3><p style={{fontSize:15,color:'rgba(255,255,255,0.5)',lineHeight:1.6}}>{desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal">
              <div className="qr-card">
                <div className="qr-wrap">
                  <div className="qr-corner" style={{top:6,right:6,borderBottom:'none',borderLeft:'none',borderRadius:'0 8px 0 0'}} />
                  <div className="qr-corner" style={{top:6,left:6,borderBottom:'none',borderRight:'none',borderRadius:'8px 0 0 0'}} />
                  <div className="qr-corner" style={{bottom:6,right:6,borderTop:'none',borderLeft:'none',borderRadius:'0 0 8px 0'}} />
                  <div className="qr-corner" style={{bottom:6,left:6,borderTop:'none',borderRight:'none',borderRadius:'0 0 0 8px'}} />
                  <div id="qrcode" />
                  <div className="qr-scan" />
                </div>
                <div style={{fontSize:22,fontWeight:800,marginBottom:8}}>האירוע שלכם 💍</div>
                <div style={{fontSize:14,color:'rgba(255,255,255,0.42)'}}>סרוק להעלאת תמונות · ללא הרשמה</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FEATURES */}
      <section id="features" style={{padding:'130px 60px',maxWidth:1200,margin:'0 auto',position:'relative',zIndex:2}}>
        <div style={{textAlign:'center',marginBottom:60}}>
          <span className="section-tag reveal">למה Memoriz</span>
          <h2 className="reveal" style={{fontSize:'clamp(38px,5vw,62px)',fontWeight:900,letterSpacing:-2,lineHeight:1.08,margin:'16px 0 0',fontFamily:'Heebo,sans-serif'}}>כל מה שצריך.<br/><span className="glow-word">ללא כאבי ראש.</span></h2>
        </div>
        <div className="features-grid features-wrapper" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
          {[['⚡','זמן אמת','כל תמונה שמועלית מופיעה מיד באלבום שלכם.','rgba(0,229,255,0.15)'],
            ['📱','ללא אפליקציה','אורחים מעלים ישירות מהדפדפן. אפס חיכוך.','rgba(180,0,255,0.15)'],
            ['🔒','פרטיות מלאה','רק מי שיש לו את הקישור יכול לצפות.','rgba(255,45,155,0.15)'],
            ['📦','הורדת ZIP','הורד הכל בלחיצה אחת. רזולוציה מלאה.','rgba(41,121,255,0.15)'],
            ['🌍','כל מכשיר','iPhone, Android, כל תמונה. עובד על הכל.','rgba(0,229,255,0.15)'],
            ['💌','שיתוף בוואטסאפ','שלח לאורחים בוואטסאפ בקליק אחד.','rgba(255,45,155,0.15)']].map(([icon,title,desc,bg],i)=>(
            <div key={i} className="feature-card reveal">
              <div className="feature-icon" style={{background:bg}}>{icon}</div>
              <h3 style={{fontSize:18,fontWeight:700,marginBottom:10}}>{title}</h3>
              <p style={{fontSize:14,color:'rgba(255,255,255,0.5)',lineHeight:1.7}}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <div style={{background:'#0a0618',borderTop:'1px solid rgba(255,255,255,0.04)',position:'relative',zIndex:2}}>
        <section id="usecases" style={{padding:'130px 60px',maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:60}}>
            <span className="section-tag reveal">שימושים</span>
            <h2 className="reveal" style={{fontSize:'clamp(38px,5vw,62px)',fontWeight:900,letterSpacing:-2,fontFamily:'Heebo,sans-serif'}}>מושלם <span className="glow-word">לכל אירוע</span></h2>
          </div>
          <div className="usecase-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
            {[['💍','חתונות','אלפי תמונות מכל הטלפונים בזמן אמת','linear-gradient(135deg,#0c4a6e,#00e5ff)'],
              ['🎉','בר / בת מצווה','כל רגע מתועד, מכל זווית','linear-gradient(135deg,#2e1065,#b400ff)'],
              ['💼','אירועים עסקיים','כנסים והשקות בלי צלם','linear-gradient(135deg,#4a044e,#ff2d9b)'],
              ['🎂','ימי הולדת','רגעים ספונטניים מכולם','linear-gradient(135deg,#0c4a6e,#2979ff)']].map(([emoji,title,desc,bg],i)=>(
              <div key={i} className="usecase-card reveal" style={{background:bg}}>
                <div style={{position:'absolute',inset:0,background:bg,filter:'brightness(0.62)',zIndex:0}} />
                <div className="uc-emoji">{emoji}</div>
                <h3 style={{fontSize:20,fontWeight:800,position:'relative',zIndex:1,marginBottom:6}}>{title}</h3>
                <p style={{fontSize:13,color:'rgba(255,255,255,0.75)',position:'relative',zIndex:1}}>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* PRICING */}
      <section id="pricing" style={{padding:'130px 60px',maxWidth:1200,margin:'0 auto',position:'relative',zIndex:2}}>
        <div style={{textAlign:'center',marginBottom:60}}>
          <span className="section-tag reveal">מחירים</span>
          <h2 className="reveal" style={{fontSize:'clamp(38px,5vw,62px)',fontWeight:900,letterSpacing:-2,margin:'16px 0 12px',fontFamily:'Heebo,sans-serif'}}>פשוט. שקוף. <span className="glow-word">הוגן.</span></h2>
          <p className="reveal" style={{color:'rgba(255,255,255,0.5)',fontSize:17}}>אין מנוי חודשי. משלמים פר אירוע.</p>
        </div>
        <div className="pricing-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24,alignItems:'start'}}>
          {[
            {name:'בסיסי',price:'₪0',per:'/אירוע',desc:'מושלם לאירועים קטנים',features:['עד 100 תמונות','QR ייחודי','פעיל 7 ימים','הורדת ZIP'],popular:false},
            {name:'פרמיום',price:'₪149',per:'/אירוע',desc:'לחתונות ואירועים גדולים',features:['תמונות ללא הגבלה','QR + לינק מותאם','פעיל 90 ימים','גלריה ציבורית','שיתוף בוואטסאפ','תמיכה עדיפות'],popular:true},
            {name:'עסקי',price:'₪349',per:'/חודש',desc:'לצלמים ומארגני אירועים',features:['אירועים ללא הגבלה','לוגו מותאם','דשבורד מתקדם','תמיכה 24/7'],popular:false},
          ].map((plan,i)=>(
            <div key={i} className={`pricing-card reveal ${plan.popular?'popular':''}`} style={{position:'relative'}}>
              {plan.popular && <div style={{position:'absolute',top:20,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#00e5ff,#b400ff)',color:'white',fontSize:12,fontWeight:700,padding:'5px 18px',borderRadius:100,whiteSpace:'nowrap',boxShadow:'0 0 16px rgba(0,229,255,0.5)'}}>⭐ הכי פופולרי</div>}
              <div style={{fontSize:14,color:'rgba(255,255,255,0.5)',marginBottom:8,marginTop:plan.popular?28:0}}>{plan.name}</div>
              <div style={{fontSize:52,fontWeight:900,letterSpacing:-2,lineHeight:1,marginBottom:4}}>{plan.price} <span style={{fontSize:22,color:'rgba(255,255,255,0.55)',fontWeight:400}}>{plan.per}</span></div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',marginBottom:24}}>{plan.desc}</div>
              <ul style={{listStyle:'none',marginBottom:32}}>
                {plan.features.map((f,fi)=>(
                  <li key={fi} style={{display:'flex',alignItems:'center',gap:10,fontSize:14,color:'rgba(255,255,255,0.75)',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <span style={{width:20,height:20,background:'rgba(0,229,255,0.15)',color:'#00e5ff',borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,flexShrink:0,boxShadow:'0 0 8px rgba(0,229,255,0.2)'}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link to="/create"><button className="pricing-btn">{plan.price==='₪0'?'התחל חינם':'הזמן עכשיו'}</button></Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{background:'linear-gradient(135deg,#0a0318,#050310,#1a0418)',borderTop:'1px solid rgba(0,229,255,0.2)',padding:'130px 60px',textAlign:'center',position:'relative',overflow:'hidden',zIndex:2}}>
        <div className="orb" style={{width:400,height:400,background:'radial-gradient(circle,rgba(0,229,255,0.25),transparent)',top:-100,right:'10%'}} />
        <div className="orb" style={{width:300,height:300,background:'radial-gradient(circle,rgba(180,0,255,0.2),transparent)',bottom:-80,left:'10%',animationDelay:'-3s'}} />
        <h2 className="reveal" style={{fontSize:'clamp(40px,5.5vw,80px)',fontWeight:900,letterSpacing:-2,lineHeight:1.1,marginBottom:20,position:'relative',zIndex:1,fontFamily:'Heebo,sans-serif'}}>
          מוכנים ליצור<br/><span className="glow-word">אלבום בלתי נשכח?</span>
        </h2>
        <p className="reveal" style={{fontSize:18,color:'rgba(255,255,255,0.55)',maxWidth:500,margin:'0 auto 48px',lineHeight:1.7,position:'relative',zIndex:1}}>הצטרפו ל-12,000+ מארגני אירועים שכבר סומכים על Memoriz.</p>
        <div className="reveal" style={{position:'relative',zIndex:1}}>
          <Link to="/create" style={{background:'transparent',color:'#00e5ff',border:'2px solid #00e5ff',borderRadius:100,padding:'18px 48px',fontFamily:'Heebo,sans-serif',fontSize:18,fontWeight:700,textDecoration:'none',display:'inline-flex',boxShadow:'0 0 24px rgba(0,229,255,0.5)',textShadow:'0 0 10px rgba(0,229,255,0.7)',transition:'all 0.3s'}}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,229,255,0.1)';e.currentTarget.style.boxShadow='0 0 45px rgba(0,229,255,0.9)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.boxShadow='0 0 24px rgba(0,229,255,0.5)';}}>
            🎉 צור אלבום חינם
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{background:'#050310',borderTop:'1px solid rgba(255,255,255,0.06)',padding:'56px 60px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:24,position:'relative',zIndex:2,fontFamily:'Heebo,sans-serif'}}>
        <div style={{fontSize:22,fontWeight:900,background:'linear-gradient(90deg,#00e5ff,#b400ff,#ff2d9b)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'logoShimmer 4s linear infinite'}}>Memoriz</div>
        <div style={{display:'flex',gap:28}}>
          {['אודות','תנאי שימוש','פרטיות','צור קשר'].map(l=>(
            <a key={l} href="#" style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:14,transition:'color 0.2s'}}
              onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.4)'}>{l}</a>
          ))}
        </div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.25)'}}>© 2024 Memoriz. כל הזכויות שמורות.</div>
      </footer>
    </div>
  )
}
