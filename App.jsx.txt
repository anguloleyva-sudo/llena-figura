import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const barrilProf=(t,{r})=>r*.55+r*.45*Math.sin(Math.PI*t);
const copaProf=(t,{r})=>{
  if(t<.25)return r*.8-(r*.8-r*.18)*(t/.25);
  if(t<.55)return r*.18;
  return r*.18+(r-r*.18)*((t-.55)/.45);
};
const numVolAt=(pf,dims,h)=>{const N=300,dh=h/N;let v=0;for(let i=0;i<N;i++){const y=(i+.5)*dh,ri=pf(y/dims.h,dims);v+=Math.PI*ri*ri*dh;}return v;};
const numHAtV=(pf,dims,v)=>{let lo=0,hi=dims.h;for(let i=0;i<60;i++){const m=(lo+hi)/2;numVolAt(pf,dims,m)<v?lo=m:hi=m;}return(lo+hi)/2;};

const FIGS={
  cubo:{name:"Cubo",icon:"⬛",faces:6,edges:12,vertices:8,dims:[{key:"a",label:"Lado",unit:"cm",def:8}],vol:({a})=>a**3,formula:({a})=>`V=a³=${a}³=${(a**3).toFixed(1)} cm³`,hAtV:(v,{a})=>v/(a*a),maxH:({a})=>+a,shape:"rect"},
  prisma:{name:"Prisma",icon:"📦",faces:6,edges:12,vertices:8,dims:[{key:"l",label:"Largo",unit:"cm",def:10},{key:"w",label:"Ancho",unit:"cm",def:6},{key:"h",label:"Alto",unit:"cm",def:8}],vol:({l,w,h})=>l*w*h,formula:({l,w,h})=>`V=${l}×${w}×${h}=${(l*w*h).toFixed(1)} cm³`,hAtV:(v,{l,w})=>v/(l*w),maxH:({h})=>+h,shape:"rect"},
  cilindro:{name:"Cilindro",icon:"🥫",faces:3,edges:2,vertices:0,dims:[{key:"r",label:"Radio",unit:"cm",def:4},{key:"h",label:"Alto",unit:"cm",def:10}],vol:({r,h})=>Math.PI*r**2*h,formula:({r,h})=>`V=π·${r}²·${h}=${(Math.PI*r**2*h).toFixed(1)} cm³`,hAtV:(v,{r})=>v/(Math.PI*r**2),maxH:({h})=>+h,shape:"cyl"},
  cono:{name:"Cono",icon:"🍦",faces:2,edges:1,vertices:1,dims:[{key:"r",label:"Radio",unit:"cm",def:4},{key:"h",label:"Alto",unit:"cm",def:10}],vol:({r,h})=>(1/3)*Math.PI*r**2*h,formula:({r,h})=>`V=⅓π·${r}²·${h}=${((1/3)*Math.PI*r**2*h).toFixed(1)} cm³`,hAtV:(v,{r,h})=>h*(1-Math.cbrt(Math.max(0,1-3*v/(Math.PI*r**2*h)))),maxH:({h})=>+h,shape:"cone"},
  esfera:{name:"Esfera",icon:"🌐",faces:1,edges:0,vertices:0,dims:[{key:"r",label:"Radio",unit:"cm",def:5}],vol:({r})=>(4/3)*Math.PI*r**3,formula:({r})=>`V=(4/3)π·${r}³=${((4/3)*Math.PI*r**3).toFixed(1)} cm³`,hAtV:(v,{r})=>{let lo=0,hi=2*r;for(let i=0;i<60;i++){const m=(lo+hi)/2;Math.PI*m**2*(r-m/3)<v?lo=m:hi=m;}return(lo+hi)/2;},maxH:({r})=>2*+r,shape:"sphere"},
  piramide:{name:"Pirámide",icon:"🔺",faces:5,edges:8,vertices:5,dims:[{key:"b",label:"Base",unit:"cm",def:8},{key:"h",label:"Alto",unit:"cm",def:10}],vol:({b,h})=>(1/3)*b**2*h,formula:({b,h})=>`V=⅓·${b}²·${h}=${((1/3)*b**2*h).toFixed(1)} cm³`,hAtV:(v,{b,h})=>h*(1-Math.cbrt(Math.max(0,1-3*v/(b**2*h)))),maxH:({h})=>+h,shape:"pyr"},
  barril:{name:"Barril",icon:"🛢️",faces:3,edges:2,vertices:0,dims:[{key:"r",label:"Radio máx",unit:"cm",def:5},{key:"h",label:"Alto",unit:"cm",def:10}],vol:(d)=>numVolAt(barrilProf,d,d.h),formula:(d)=>`V≈${numVolAt(barrilProf,d,d.h).toFixed(1)} cm³`,hAtV:(v,d)=>numHAtV(barrilProf,d,v),maxH:({h})=>+h,shape:"lathe",profile:barrilProf,hint:"Panza ancha → sube lento al centro, rápido en extremos"},
  copa:{name:"Copa",icon:"🏆",faces:3,edges:2,vertices:0,dims:[{key:"r",label:"Radio copa",unit:"cm",def:5},{key:"h",label:"Alto",unit:"cm",def:12}],vol:(d)=>numVolAt(copaProf,d,d.h),formula:(d)=>`V≈${numVolAt(copaProf,d,d.h).toFixed(1)} cm³`,hAtV:(v,d)=>numHAtV(copaProf,d,v),maxH:({h})=>+h,shape:"lathe",profile:copaProf,hint:"Tallo angosto → altura se dispara al pasar por él"}
};

const QUESTIONS={
  cubo:["¿Qué pasa con el volumen si duplicas el lado? ¿Y si lo triplicas?","¿Por qué la gráfica es siempre una línea recta?","¿Cuántos cubos de lado 4 caben en uno de lado 8?"],
  prisma:["¿Qué dimensión afecta más el volumen: largo, ancho o alto?","¿Por qué la gráfica es recta aunque el prisma no sea cubo?","¿Cómo cambiaría la gráfica si la base fuera cuadrada?"],
  cilindro:["Si doblas el radio, ¿cuánto se multiplica el volumen?","¿Por qué la gráfica es igual de recta que el cubo?","Compara con el prisma: ¿cuál contiene más volumen con las mismas medidas?"],
  cono:["¿Por qué el agua sube cada vez más rápido hacia la punta?","Compara el cono con el cilindro del mismo radio y alto. ¿Cuánto es su volumen relativo?","¿En qué altura la gráfica tiene mayor pendiente?"],
  esfera:["¿Por qué la gráfica tiene forma de 'S'?","¿Dónde sube más lento el agua y por qué?","¿A qué altura la sección transversal es máxima?"],
  piramide:["¿La gráfica de la pirámide se parece a la del cono? ¿Por qué sí o no?","¿Cuánto equivale su volumen al del prisma base equivalente?","¿Cómo cambia la gráfica si haces la base muy grande y el alto muy pequeño?"],
  barril:["¿En qué parte del barril sube el agua más lento? ¿Por qué?","Describe las tres fases de la gráfica (inicio, centro, final).","¿Cómo se relaciona la forma del barril con la pendiente de la curva?"],
  copa:["¿Puedes identificar en la gráfica cuándo el agua llega al tallo?","¿Por qué la altura sube tan rápido en un momento?","¿Podrías estimar el volumen del tallo solo mirando la gráfica?"]
};

const getVD=(fk,dims)=>{const vd={};FIGS[fk].dims.forEach(d=>{vd[d.key]=Math.max(parseFloat(dims[d.key])||1,.5);});return vd;};

const makeGeo=(fk,dims)=>{
  const fig=FIGS[fk],vd=getVD(fk,dims),mH=fig.maxH(vd),S=10/mH;
  switch(fig.shape){
    case"rect":{const h=mH*S,l=(vd.l||vd.a)*S,w=(vd.w||vd.a)*S;return{geo:new THREE.BoxGeometry(l,h,w),mHS:h};}
    case"cyl":{const r=vd.r*S,h=mH*S;return{geo:new THREE.CylinderGeometry(r,r,h,32),mHS:h};}
    case"cone":{const r=vd.r*S,h=mH*S;return{geo:new THREE.CylinderGeometry(0,r,h,32),mHS:h};}
    case"sphere":{const r=vd.r*S;return{geo:new THREE.SphereGeometry(r,32,32),mHS:2*r};}
    case"pyr":{const cr=vd.b*S*Math.SQRT2/2,h=mH*S;return{geo:new THREE.ConeGeometry(cr,h,4),mHS:h};}
    case"lathe":{
      const H=mH*S,pf=fig.profile,pp=[];
      for(let i=0;i<=48;i++){const t=i/48;pp.push(new THREE.Vector2(Math.max(pf(t,vd)*S,.05),t*H-H/2));}
      return{geo:new THREE.LatheGeometry(pp,36),mHS:H,profilePts:pp};
    }
    default:return{geo:new THREE.BoxGeometry(10,10,10),mHS:10};
  }
};

function Fig3D({fk,dims,fillPct,wc=0x3b82f6}){
  const cRef=useRef();
  const stRef=useRef({renderer:null,scene:null,cam:null,group:null,cp:null,mHS:10,rot:{x:.4,y:.6},drag:{on:false,lx:0,ly:0}});
  const fpRef=useRef(fillPct);
  fpRef.current=fillPct;
  useEffect(()=>{
    const R=new THREE.WebGLRenderer({canvas:cRef.current,antialias:true,alpha:true});
    R.setSize(200,200,false);R.localClippingEnabled=true;
    const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1,.1,500);
    cam.position.z=28;sc.add(new THREE.AmbientLight(0xffffff,.85));
    const dl=new THREE.DirectionalLight(0xffffff,.5);dl.position.set(4,8,6);sc.add(dl);
    const st=stRef.current;st.renderer=R;st.scene=sc;st.cam=cam;
    let raf;
    const tick=()=>{raf=requestAnimationFrame(tick);if(st.group){st.group.rotation.x=st.rot.x;st.group.rotation.y=st.rot.y;}if(st.cp)st.cp.constant=fpRef.current*st.mHS-st.mHS/2;R.render(sc,cam);};
    tick();return()=>{cancelAnimationFrame(raf);R.dispose();};
  },[]);
  useEffect(()=>{
    const st=stRef.current;if(!st.renderer)return;
    if(st.group){st.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});st.scene.remove(st.group);}
    const{geo,mHS,profilePts}=makeGeo(fk,dims);st.mHS=mHS;
    const cp=new THREE.Plane(new THREE.Vector3(0,-1,0),-mHS/2);st.cp=cp;
    const g=new THREE.Group();g.rotation.x=st.rot.x;g.rotation.y=st.rot.y;
    g.add(new THREE.Mesh(geo,new THREE.MeshPhongMaterial({color:0xdbeafe,transparent:true,opacity:.18,side:THREE.DoubleSide})));
    if(profilePts){
      const rP=profilePts.map(p=>new THREE.Vector3(p.x,p.y,0));
      const lP=[...profilePts].reverse().map(p=>new THREE.Vector3(-p.x,p.y,0));
      const sg=new THREE.BufferGeometry().setFromPoints([...rP,...lP,rP[0]]);
      g.add(new THREE.Line(sg,new THREE.LineBasicMaterial({color:0x1e40af})));
    }else{
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0x1e40af})));
    }
    g.add(new THREE.Mesh(geo.clone(),new THREE.MeshPhongMaterial({color:wc,transparent:true,opacity:.75,clippingPlanes:[cp],side:THREE.DoubleSide})));
    st.group=g;st.scene.add(g);st.cam.position.z=mHS*2.9;st.cam.updateProjectionMatrix();
  },[fk,JSON.stringify(dims)]);
  const dn=(x,y)=>{const d=stRef.current.drag;d.on=true;d.lx=x;d.ly=y;};
  const mv=(x,y)=>{const st=stRef.current;if(!st.drag.on)return;st.rot.y+=(x-st.drag.lx)*.013;st.rot.x+=(y-st.drag.ly)*.013;st.drag.lx=x;st.drag.ly=y;};
  const up=()=>{stRef.current.drag.on=false;};
  return <canvas ref={cRef} width={200} height={200}
    style={{width:"100%",height:200,cursor:"grab",display:"block",touchAction:"none"}}
    onMouseDown={e=>dn(e.clientX,e.clientY)} onMouseMove={e=>mv(e.clientX,e.clientY)} onMouseUp={up} onMouseLeave={up}
    onTouchStart={e=>dn(e.touches[0].clientX,e.touches[0].clientY)}
    onTouchMove={e=>mv(e.touches[0].clientX,e.touches[0].clientY)} onTouchEnd={up}/>;
}

function InfoCard({fk,dims}){
  const fig=FIGS[fk],vd=getVD(fk,dims);
  return(
    <div style={{background:"white",borderRadius:13,padding:12,boxShadow:"0 1px 5px #0001"}}>
      <div style={{fontWeight:700,color:"#1e40af",fontSize:12,marginBottom:8}}>{fig.icon} {fig.name}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:8}}>
        {[{l:"Caras",v:fig.faces,bg:"#dbeafe"},{l:"Aristas",v:fig.edges,bg:"#dcfce7"},{l:"Vértices",v:fig.vertices,bg:"#fef9c3"}].map(x=>(
          <div key={x.l} style={{background:x.bg,borderRadius:8,padding:"5px 2px",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:800,color:"#1e40af"}}>{x.v}</div>
            <div style={{fontSize:9,color:"#64748b"}}>{x.l}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fef9c3",borderRadius:8,padding:"6px 8px",fontSize:10,color:"#78350f",lineHeight:1.5}}>🧮 {fig.formula(vd)}</div>
      {fig.hint&&<div style={{background:"#f0fdf4",borderRadius:8,padding:"5px 8px",fontSize:10,color:"#166534",lineHeight:1.5,marginTop:6}}>💡 {fig.hint}</div>}
    </div>
  );
}

function DimInputs({fk,dims,setDims,rst,accent}){
  return(
    <div style={{marginBottom:8}}>
      {FIGS[fk].dims.map(d=>(
        <div key={d.key} style={{marginBottom:5}}>
          <label style={{fontSize:10,color:"#475569",display:"block",marginBottom:2}}>{d.label} ({d.unit})</label>
          <input type="number" min="1" max="99" value={dims[d.key]??d.def}
            onChange={e=>{setDims(p=>({...p,[d.key]:e.target.value}));rst();}}
            style={{width:"100%",padding:"4px 6px",borderRadius:6,border:`1.5px solid ${accent}`,fontSize:12,boxSizing:"border-box"}}/>
        </div>
      ))}
    </div>
  );
}

function PredCanvas({maxT,maxH,onFinish,onClear}){
  const cRef=useRef();
  const ptsRef=useRef([]);
  const drag=useRef(false);
  const W=250,H=148;
  const LM=22,BM=18;

  const redraw=()=>{
    const c=cRef.current;if(!c)return;
    const ctx=c.getContext('2d');
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#f1f5f9';ctx.lineWidth=.8;
    for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(LM+i*(W-LM)/5,0);ctx.lineTo(LM+i*(W-LM)/5,H-BM);ctx.stroke();ctx.beginPath();ctx.moveTo(LM,i*(H-BM)/5);ctx.lineTo(W,i*(H-BM)/5);ctx.stroke();}
    ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(LM,4);ctx.lineTo(LM,H-BM);ctx.lineTo(W-2,H-BM);ctx.stroke();
    ctx.fillStyle='#94a3b8';ctx.font='8px sans-serif';
    ctx.fillText('h',2,10);ctx.fillText(maxH.toFixed(0),2,15);
    ctx.fillText('0',LM-8,H-BM);ctx.fillText('t',W-8,H-BM+10);
    ctx.fillText(`~${maxT.toFixed(0)}s`,W-33,H-BM-2);
    if(!ptsRef.current.length){
      ctx.fillStyle='#a5b4fc';ctx.font='10px sans-serif';ctx.textAlign='center';
      ctx.fillText('✏️ Dibuja tu predicción aquí',W/2+LM/2,(H-BM)/2-4);
      ctx.font='8px sans-serif';ctx.fillStyle='#c4b5fd';
      ctx.fillText('¿Cómo crees que subirá el agua?',W/2+LM/2,(H-BM)/2+11);
      ctx.textAlign='left';
    }
    if(ptsRef.current.length>1){
      ctx.strokeStyle='#f97316';ctx.lineWidth=2.5;ctx.setLineDash([5,3]);
      ctx.beginPath();
      ptsRef.current.forEach((p,i)=>{
        const x=LM+p.x*(W-LM-2),y=(H-BM)-p.y*(H-BM-5);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.stroke();ctx.setLineDash([]);
    }
  };

  useEffect(()=>{redraw();},[maxT,maxH]);

  const getP=(e,touch=false)=>{
    const c=cRef.current;if(!c)return null;
    const r=c.getBoundingClientRect();
    const src=touch?e.touches[0]:e;
    const px=(src.clientX-r.left)/r.width*W,py=(src.clientY-r.top)/r.height*H;
    return{x:Math.max(0,Math.min(1,(px-LM)/(W-LM-2))),y:Math.max(0,Math.min(1,((H-BM)-py)/(H-BM-5)))};
  };
  const onDn=(e,t=false)=>{drag.current=true;ptsRef.current=[];const p=getP(e,t);if(p)ptsRef.current.push(p);redraw();};
  const onMv=(e,t=false)=>{if(!drag.current)return;const p=getP(e,t);if(!p)return;const last=ptsRef.current[ptsRef.current.length-1];if(!last||Math.abs(p.x-last.x)>.007)ptsRef.current.push(p);redraw();};
  const onUp=()=>{drag.current=false;if(ptsRef.current.length>3)onFinish([...ptsRef.current]);};

  return(
    <div style={{background:"white",borderRadius:12,padding:10,boxShadow:"0 1px 5px #0001"}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
        <span style={{fontSize:11,fontWeight:700,color:'#7c3aed'}}>✏️ Predice la gráfica</span>
        <button onClick={()=>{ptsRef.current=[];redraw();onClear();}} style={{fontSize:9,padding:'2px 7px',borderRadius:6,border:'1px solid #e2e8f0',background:'#f8fafc',cursor:'pointer',color:'#64748b'}}>Borrar</button>
      </div>
      <canvas ref={cRef} width={W} height={H}
        style={{width:'100%',height:H,cursor:'crosshair',background:'#f8fafc',borderRadius:8,border:'1.5px dashed #a5b4fc',touchAction:'none',display:'block'}}
        onMouseDown={e=>onDn(e)} onMouseMove={e=>onMv(e)} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={e=>{e.preventDefault();onDn(e,true);}} onTouchMove={e=>{e.preventDefault();onMv(e,true);}} onTouchEnd={onUp}/>
      <div style={{fontSize:9,color:'#94a3b8',textAlign:'center',marginTop:3}}>Dibuja de izquierda→derecha, luego presiona ▶ Iniciar</div>
    </div>
  );
}

const genQuiz=()=>{
  const keys=Object.keys(FIGS);
  const fk=keys[Math.floor(Math.random()*keys.length)];
  const dims={};
  FIGS[fk].dims.forEach(d=>{
    const lo=Math.max(3,Math.round(d.def*.65)),hi=Math.round(d.def*1.4);
    dims[d.key]=String(lo+Math.floor(Math.random()*(hi-lo+1)));
  });
  return{fk,dims};
};

export default function App(){
  const [mode,setMode]=useState('normal');
  const [fk1,setFk1]=useState('cubo'),[dims1,setDims1]=useState({a:'8'});
  const [fk2,setFk2]=useState('cilindro'),[dims2,setDims2]=useState({r:'4',h:'10'});
  const [flow,setFlow]=useState(5);
  const [run,setRun]=useState(false);
  const [v1,setV1]=useState(0),[v2,setV2]=useState(0),[sT,setST]=useState(0);
  const [ch,setCh]=useState([{t:0,h1:0,h2:0}]);
  const [predPts,setPredPts]=useState([]);
  const [quiz,setQuiz]=useState(()=>genQuiz());
  const [quizGuess,setQuizGuess]=useState('');
  const [quizRevealed,setQuizRevealed]=useState(false);
  const [quizScore,setQuizScore]=useState({ok:0,tot:0});
  const [showQ,setShowQ]=useState(false);

  const v1R=useRef(0),v2R=useRef(0),tR=useRef(0),chR=useRef([{t:0,h1:0,h2:0}]);
  const flR=useRef(5),cmpR=useRef(false),d1R=useRef(null),d2R=useRef(null);
  flR.current=flow;cmpR.current=mode==='comparar';

  const isCmp=mode==='comparar',isQuiz=mode==='quiz',isPred=mode==='prediccion';
  const afk1=isQuiz?quiz.fk:fk1;
  const adims1=isQuiz?quiz.dims:dims1;
  const fig1=FIGS[afk1],vd1=getVD(afk1,adims1),tV1=fig1.vol(vd1),mH1=fig1.maxH(vd1);
  const pct1=Math.min(v1/tV1,1),hc1=Math.min(fig1.hAtV(Math.max(v1,0),vd1),mH1);
  const fig2=FIGS[fk2],vd2=getVD(fk2,dims2),tV2=fig2.vol(vd2),mH2=fig2.maxH(vd2);
  const pct2=Math.min(v2/tV2,1),hc2=Math.min(fig2.hAtV(Math.max(v2,0),vd2),mH2);
  d1R.current={tV:tV1,mH:mH1,fig:fig1,vd:vd1};
  d2R.current={tV:tV2,mH:mH2,fig:fig2,vd:vd2};

  const rst=()=>{setRun(false);v1R.current=v2R.current=tR.current=0;chR.current=[{t:0,h1:0,h2:0}];setV1(0);setV2(0);setST(0);setCh([{t:0,h1:0,h2:0}]);};
  const cf1=k=>{const dd={};FIGS[k].dims.forEach(d=>{dd[d.key]=String(d.def);});setFk1(k);setDims1(dd);rst();};
  const cf2=k=>{const dd={};FIGS[k].dims.forEach(d=>{dd[d.key]=String(d.def);});setFk2(k);setDims2(dd);rst();};
  const chgMode=m=>{setMode(m);rst();setPredPts([]);if(m==='quiz'){setQuiz(genQuiz());setQuizGuess('');setQuizRevealed(false);}};
  const newQuiz=()=>{setQuiz(genQuiz());setQuizGuess('');setQuizRevealed(false);rst();};
  const doGuess=k=>{setQuizGuess(k);setQuizRevealed(true);setQuizScore(s=>({ok:s.ok+(k===quiz.fk?1:0),tot:s.tot+1}));};

  useEffect(()=>{
    if(!run)return;
    let raf,lT=null;
    const loop=ts=>{
      if(!lT)lT=ts;const dt=Math.min((ts-lT)/1000,.1);lT=ts;
      const fl=flR.current,cm=cmpR.current,d1=d1R.current,d2=d2R.current;
      const nv1=Math.min(v1R.current+fl*dt,d1.tV);
      const nv2=cm?Math.min(v2R.current+fl*dt,d2.tV):0;
      v1R.current=nv1;if(cm)v2R.current=nv2;tR.current+=dt;
      const nh1=Math.min(d1.fig.hAtV(nv1,d1.vd),d1.mH);
      const nh2=cm?Math.min(d2.fig.hAtV(nv2,d2.vd),d2.mH):0;
      const lp=chR.current[chR.current.length-1];
      if(!lp||tR.current-lp.t>=.35){chR.current=[...chR.current,{t:+tR.current.toFixed(1),h1:+nh1.toFixed(2),h2:+nh2.toFixed(2)}];setCh([...chR.current]);}
      setV1(nv1);if(cm)setV2(nv2);setST(tR.current);
      if(nv1<d1.tV||(cm&&nv2<d2.tV))raf=requestAnimationFrame(loop);else setRun(false);
    };
    raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf);
  },[run]);

  const dhdtData=ch.slice(1).map((pt,i)=>{
    const prev=ch[i],dt=pt.t-prev.t;
    if(dt<=0)return null;
    return{t:pt.t,v1:+((pt.h1-prev.h1)/dt).toFixed(3),v2:+((pt.h2-prev.h2)/dt).toFixed(3)};
  }).filter(Boolean);

  const estT=flow>0?tV1/flow:60;
  const chartData=isPred&&predPts.length>2?ch.map(pt=>{
    const tx=pt.t/estT;
    let lo=null,hi=null;
    for(let i=0;i<predPts.length-1;i++){if(predPts[i].x<=tx&&predPts[i+1].x>=tx){lo=predPts[i];hi=predPts[i+1];break;}}
    let py=predPts[0].y;
    if(lo&&hi){const f=hi.x===lo.x?0:(tx-lo.x)/(hi.x-lo.x);py=lo.y+f*(hi.y-lo.y);}
    else if(tx>=predPts[predPts.length-1].x)py=predPts[predPts.length-1].y;
    return{...pt,pred:+(py*mH1).toFixed(2)};
  }):ch;

  const full=pct1>=1&&(!isCmp||pct2>=1);
  const bBg=run?'#f59e0b':full?'#10b981':'#2563eb';
  const bTx=run?'⏸ Pausa':full?'🔄 Reiniciar':'▶ Iniciar';

  const FigSel=(cur,onSel,skip)=>(
    <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
      {Object.entries(FIGS).filter(([k])=>k!==skip).map(([k,f])=>(
        <button key={k} onClick={()=>onSel(k)} style={{padding:'3px 7px',borderRadius:11,border:'1.5px solid',fontSize:10,fontWeight:600,cursor:'pointer',borderColor:cur===k?'#2563eb':'#cbd5e1',background:cur===k?'#2563eb':'white',color:cur===k?'white':'#334155'}}>{f.icon} {f.name}</button>
      ))}
    </div>
  );

  const ProgBar=(pct,col)=>(
    <div style={{background:'#e2e8f0',borderRadius:7,height:10,overflow:'hidden',marginTop:4}}>
      <div style={{width:`${pct*100}%`,height:'100%',borderRadius:7,background:pct>=1?'#10b981':col,transition:'width .08s'}}/>
    </div>
  );

  return(
    <div style={{fontFamily:'sans-serif',background:'#f0f9ff',minHeight:'100vh',padding:'12px 8px'}}>
      <div style={{maxWidth:990,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:10}}>
          <div style={{fontSize:20,fontWeight:800,color:'#1e40af'}}>💧 Llena la Figura — Volumen 3D</div>
          <div style={{color:'#64748b',fontSize:11,marginTop:2}}>Arrastra para rotar · Matemáticas Secundaria</div>
        </div>

        <div style={{display:'flex',justifyContent:'center',gap:5,marginBottom:12,flexWrap:'wrap'}}>
          {[['normal','🔵','Normal'],['prediccion','✏️','Predicción'],['quiz','🎯','Quiz'],['comparar','⚖️','Comparar']].map(([k,ic,lb])=>(
            <button key={k} onClick={()=>chgMode(k)} style={{padding:'6px 13px',borderRadius:16,border:'2px solid',cursor:'pointer',fontWeight:700,fontSize:11,borderColor:mode===k?'#2563eb':'#cbd5e1',background:mode===k?'#2563eb':'white',color:mode===k?'white':'#334155'}}>{ic} {lb}</button>
          ))}
        </div>

        {isPred&&(
          <div style={{textAlign:'center',marginBottom:8,background:'#f5f3ff',borderRadius:10,padding:'7px 12px',fontSize:11,color:'#7c3aed',maxWidth:600,margin:'0 auto 10px'}}>
            ✏️ <strong>Modo Predicción:</strong> Dibuja cómo crees que subirá el agua, luego presiona ▶ para comparar con la realidad.
          </div>
        )}
        {isQuiz&&(
          <div style={{textAlign:'center',marginBottom:8,background:'#fdf4ff',borderRadius:10,padding:'7px 12px',fontSize:11,color:'#7c3aed',maxWidth:600,margin:'0 auto 10px'}}>
            🎯 <strong>Modo Quiz:</strong> Observa el llenado y la gráfica. ¿Puedes adivinar qué figura es cuando termine?
          </div>
        )}

        <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center',alignItems:'flex-start'}}>

          {/* Figura 1 */}
          <div style={{background:'white',borderRadius:14,padding:13,width:213,boxShadow:'0 1px 6px #0001',flexShrink:0}}>
            <div style={{fontWeight:700,color:isQuiz?'#7c3aed':'#2563eb',fontSize:12,marginBottom:8}}>
              {isQuiz?'🎯 Figura Misteriosa':isCmp?'🔵 Figura 1':'🔵 Figura'}
            </div>
            {!isQuiz&&FigSel(fk1,cf1,isCmp?fk2:null)}
            {isQuiz&&<div style={{background:'#f5f3ff',borderRadius:10,padding:'10px',textAlign:'center',fontSize:28,marginBottom:8,letterSpacing:5}}>❓❓❓</div>}
            {!isQuiz&&<DimInputs fk={fk1} dims={dims1} setDims={setDims1} rst={rst} accent='#93c5fd'/>}
            <Fig3D fk={afk1} dims={adims1} fillPct={pct1} wc={0x3b82f6}/>
            {ProgBar(pct1,'#3b82f6')}
            <div style={{fontSize:10,color:'#475569',marginTop:5,lineHeight:1.8,textAlign:'center'}}>
              <div><strong>{v1.toFixed(1)}</strong>/<strong>{tV1.toFixed(1)}</strong> cm³ · <strong>{(pct1*100).toFixed(1)}%</strong></div>
              <div>h:<strong>{hc1.toFixed(2)}</strong>/<strong>{mH1.toFixed(1)}</strong>cm · <strong>{sT.toFixed(1)}</strong>s</div>
            </div>
          </div>

          {/* Figura 2 (comparar) */}
          {isCmp&&(
            <div style={{background:'white',borderRadius:14,padding:13,width:213,boxShadow:'0 1px 6px #0001',flexShrink:0}}>
              <div style={{fontWeight:700,color:'#ea580c',fontSize:12,marginBottom:8}}>🟠 Figura 2</div>
              {FigSel(fk2,cf2,fk1)}
              <DimInputs fk={fk2} dims={dims2} setDims={setDims2} rst={rst} accent='#fdba74'/>
              <Fig3D fk={fk2} dims={dims2} fillPct={pct2} wc={0xf97316}/>
              {ProgBar(pct2,'#f97316')}
              <div style={{fontSize:10,color:'#475569',marginTop:5,lineHeight:1.8,textAlign:'center'}}>
                <div><strong>{v2.toFixed(1)}</strong>/<strong>{tV2.toFixed(1)}</strong> cm³ · <strong>{(pct2*100).toFixed(1)}%</strong></div>
                <div>h:<strong>{hc2.toFixed(2)}</strong>/<strong>{mH2.toFixed(1)}</strong>cm</div>
              </div>
            </div>
          )}

          {/* Panel derecho */}
          <div style={{display:'flex',flexDirection:'column',gap:10,width:258,flexShrink:0}}>

            {/* Controles */}
            <div style={{background:'white',borderRadius:13,padding:12,boxShadow:'0 1px 5px #0001'}}>
              <div style={{fontWeight:700,color:'#1e40af',fontSize:12,marginBottom:7}}>🎛️ Controles</div>
              <div style={{fontSize:10,color:'#475569',fontWeight:600,marginBottom:2}}>💧 Flujo: <span style={{color:'#2563eb'}}>{flow} cm³/s</span></div>
              <input type="range" min=".5" max="30" step=".5" value={flow} onChange={e=>setFlow(parseFloat(e.target.value))} style={{width:'100%',accentColor:'#2563eb',marginBottom:2}}/>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#94a3b8',marginBottom:9}}><span>🐢 Lento</span><span>🚀 Rápido</span></div>
              <div style={{display:'flex',gap:7}}>
                <button onClick={()=>{if(full){rst();return;}setRun(r=>!r);}} style={{flex:1,padding:'8px 0',borderRadius:8,border:'none',background:bBg,color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>{bTx}</button>
                <button onClick={rst} style={{padding:'8px 11px',borderRadius:8,border:'none',background:'#e2e8f0',color:'#475569',fontWeight:700,cursor:'pointer'}}>🔄</button>
              </div>
            </div>

            {/* Info card */}
            {!isQuiz&&<InfoCard fk={afk1} dims={adims1}/>}
            {isCmp&&<InfoCard fk={fk2} dims={dims2}/>}

            {/* Quiz panel */}
            {isQuiz&&(
              <div style={{background:'white',borderRadius:13,padding:12,boxShadow:'0 1px 5px #0001'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontWeight:700,color:'#7c3aed',fontSize:12}}>🎯 Quiz</span>
                  <span style={{fontSize:11,background:'#f5f3ff',padding:'2px 9px',borderRadius:10,color:'#7c3aed',fontWeight:700}}>✅ {quizScore.ok}/{quizScore.tot}</span>
                </div>
                {!quizRevealed&&pct1<1&&(
                  <div style={{fontSize:11,color:'#64748b',textAlign:'center',padding:'10px 6px',background:'#f8fafc',borderRadius:9}}>
                    Observa el llenado y la gráfica...<br/>
                    <span style={{fontSize:10,color:'#94a3b8'}}>Adivina cuando termine el llenado</span>
                  </div>
                )}
                {!quizRevealed&&pct1>=1&&(
                  <div>
                    <div style={{fontSize:11,color:'#334155',fontWeight:700,marginBottom:7}}>¿Qué figura era?</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                      {Object.entries(FIGS).map(([k,f])=>(
                        <button key={k} onClick={()=>doGuess(k)} style={{padding:'5px 9px',borderRadius:9,border:'1.5px solid #e2e8f0',fontSize:10,background:'#f8fafc',cursor:'pointer',fontWeight:600,color:'#334155'}}>{f.icon} {f.name}</button>
                      ))}
                    </div>
                  </div>
                )}
                {quizRevealed&&(
                  <div>
                    <div style={{background:quizGuess===quiz.fk?'#dcfce7':'#fee2e2',borderRadius:10,padding:'8px 10px',fontSize:12,fontWeight:700,color:quizGuess===quiz.fk?'#166534':'#991b1b',marginBottom:8}}>
                      {quizGuess===quiz.fk?'✅ ¡Correcto!':'❌ Era: '+FIGS[quiz.fk].icon+' '+FIGS[quiz.fk].name}
                    </div>
                    <InfoCard fk={quiz.fk} dims={quiz.dims}/>
                    <button onClick={newQuiz} style={{width:'100%',marginTop:8,padding:'8px',borderRadius:8,border:'none',background:'#7c3aed',color:'white',fontWeight:700,fontSize:12,cursor:'pointer'}}>🎯 Siguiente figura</button>
                  </div>
                )}
              </div>
            )}

            {/* Predicción canvas */}
            {isPred&&!run&&pct1<1&&(
              <PredCanvas maxT={estT} maxH={mH1} onFinish={pts=>setPredPts(pts)} onClear={()=>setPredPts([])}/>
            )}
            {isPred&&predPts.length>0&&pct1<1&&!run&&(
              <div style={{background:'#f5f3ff',borderRadius:10,padding:'7px 10px',fontSize:10,color:'#7c3aed',textAlign:'center'}}>
                ✅ Predicción guardada · Presiona ▶ para ver si acertaste
              </div>
            )}

            {/* Gráfica h(t) */}
            <div style={{background:'white',borderRadius:13,padding:12,boxShadow:'0 1px 5px #0001'}}>
              <div style={{fontWeight:700,color:'#1e40af',fontSize:12,marginBottom:4}}>📈 Altura vs Tiempo</div>
              <ResponsiveContainer width="100%" height={148}>
                <LineChart data={chartData} margin={{top:4,right:6,bottom:20,left:-8}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="t" tick={{fontSize:9}} label={{value:'t (s)',position:'insideBottom',offset:-10,fontSize:9}}/>
                  <YAxis tick={{fontSize:9}} label={{value:'h (cm)',angle:-90,position:'insideLeft',offset:14,fontSize:9}}/>
                  <Tooltip formatter={(v,n)=>[`${v} cm`,n]} labelFormatter={l=>`t=${l}s`} contentStyle={{fontSize:10}}/>
                  {(isCmp||isPred)&&<Legend wrapperStyle={{fontSize:9,paddingTop:2}}/>}
                  <Line type="monotone" dataKey="h1" stroke="#3b82f6" dot={false} strokeWidth={2.5} name={isCmp?fig1.name:'Altura'} isAnimationActive={false}/>
                  {isCmp&&<Line type="monotone" dataKey="h2" stroke="#f97316" dot={false} strokeWidth={2.5} name={fig2.name} isAnimationActive={false}/>}
                  {isPred&&predPts.length>2&&<Line type="monotone" dataKey="pred" stroke="#f97316" dot={false} strokeWidth={2} strokeDasharray="6 3" name="Mi predicción" isAnimationActive={false}/>}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfica dh/dt */}
            <div style={{background:'white',borderRadius:13,padding:12,boxShadow:'0 1px 5px #0001'}}>
              <div style={{fontWeight:700,color:'#059669',fontSize:12,marginBottom:2}}>⚡ Velocidad de subida (dh/dt)</div>
              <div style={{fontSize:9,color:'#94a3b8',marginBottom:4}}>¿Qué tan rápido sube el nivel en cada instante?</div>
              <ResponsiveContainer width="100%" height={118}>
                <LineChart data={dhdtData} margin={{top:4,right:6,bottom:20,left:-5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="t" tick={{fontSize:9}} label={{value:'t (s)',position:'insideBottom',offset:-10,fontSize:9}}/>
                  <YAxis tick={{fontSize:9}} width={32} label={{value:'cm/s',angle:-90,position:'insideLeft',offset:14,fontSize:9}}/>
                  <Tooltip formatter={(v,n)=>[`${v} cm/s`,n]} labelFormatter={l=>`t=${l}s`} contentStyle={{fontSize:10}}/>
                  {isCmp&&<Legend wrapperStyle={{fontSize:9,paddingTop:2}}/>}
                  <Line type="monotone" dataKey="v1" stroke="#10b981" dot={false} strokeWidth={2} name={isCmp?fig1.name+' vel':'dh/dt'} isAnimationActive={false}/>
                  {isCmp&&<Line type="monotone" dataKey="v2" stroke="#f59e0b" dot={false} strokeWidth={2} name={fig2.name+' vel'} isAnimationActive={false}/>}
                </LineChart>
              </ResponsiveContainer>
              <div style={{fontSize:9,color:'#7c3aed',textAlign:'center',marginTop:2}}>
                💡 Cuando h(t) es empinada → aquí la velocidad es alta (y viceversa)
              </div>
            </div>

            {/* Preguntas guiadas */}
            {!isQuiz&&(
              <div style={{background:'white',borderRadius:13,padding:12,boxShadow:'0 1px 5px #0001'}}>
                <button onClick={()=>setShowQ(q=>!q)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',background:'none',border:'none',cursor:'pointer',padding:0}}>
                  <span style={{fontWeight:700,color:'#1e40af',fontSize:12}}>🧠 Preguntas guiadas</span>
                  <span style={{fontSize:12,color:'#94a3b8'}}>{showQ?'▲':'▼'}</span>
                </button>
                {showQ&&(
                  <div style={{marginTop:8}}>
                    {(QUESTIONS[afk1]||[]).map((q,i)=>(
                      <div key={i} style={{background:'#f8fafc',borderRadius:8,padding:'7px 9px',marginBottom:5,fontSize:11,color:'#334155',lineHeight:1.5}}>
                        <strong style={{color:'#7c3aed'}}>{i+1}.</strong> {q}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
