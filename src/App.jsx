import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from "recharts";

const barrilProf=(t,{r})=>r*.55+r*.45*Math.sin(Math.PI*t);
const copaProf=(t,{r})=>{if(t<.25)return r*.8-(r*.8-r*.18)*(t/.25);if(t<.55)return r*.18;return r*.18+(r-r*.18)*((t-.55)/.45);};
const numVolAt=(pf,dims,h)=>{const N=300,dh=h/N;let v=0;for(let i=0;i<N;i++){const y=(i+.5)*dh,ri=pf(y/dims.h,dims);v+=Math.PI*ri*ri*dh;}return v;};
const numHAtV=(pf,dims,v)=>{let lo=0,hi=dims.h;for(let i=0;i<60;i++){const m=(lo+hi)/2;numVolAt(pf,dims,m)<v?lo=m:hi=m;}return(lo+hi)/2;};
const interpCP=(cps,t)=>{
  if(t<=cps[0][0])return cps[0][1];if(t>=cps[cps.length-1][0])return cps[cps.length-1][1];
  for(let i=0;i<cps.length-1;i++){if(t>=cps[i][0]&&t<=cps[i+1][0]){const f=(t-cps[i][0])/(cps[i+1][0]-cps[i][0]);return cps[i][1]+f*(cps[i+1][1]-cps[i][1]);}}
  return cps[cps.length-1][1];
};
const volCps=(H,cps,h=H)=>{const N=500,dh=h/N;let v=0;for(let i=0;i<N;i++){const y=(i+.5)*dh,r=interpCP(cps,y/H);v+=Math.PI*r*r*dh;}return v;};
const fitRcp=(H,cps,ml,extra={})=>{const s=Math.sqrt(ml/volCps(H,cps,H));return{H,ml,cps:cps.map(([t,r])=>[t,+(r*s).toFixed(3)]),...extra};};
const RCP={
  r_barril:fitRcp(10.8,[[0,3.15],[0.03,4.45],[0.08,5.15],[0.16,5.45],[0.23,4.85],[0.28,2.75],[0.33,4.65],[0.42,5.35],[0.50,5.55],[0.57,2.78],[0.62,4.70],[0.71,5.38],[0.80,5.12],[0.86,3.15],[0.92,2.95],[1,3.35]],458,{marks:[.28,.57,.86],visual:{glass:0x16a34a,edge:0x166534,water:0x22c55e,rings:[.03,.09,.25,.28,.34,.53,.57,.63,.83,.89,.97],cap:{hF:.06,rScale:1.22,color:0xbbf7d0,opacity:.85}}}),
  r_cupcake:fitRcp(13.4,[[0,2.75],[0.04,3.55],[0.16,3.90],[0.30,4.25],[0.43,4.55],[0.50,5.35],[0.55,5.75],[0.60,5.35],[0.67,4.35],[0.75,3.05],[0.82,1.85],[0.89,1.18],[0.97,1.18],[1,1.42]],500,{marks:[.50,.60,.82,.89],visual:{glass:0x06b6d4,edge:0x0e7490,water:0x22d3ee,rings:[.06,.18,.30,.42,.50,.56,.62,.72,.82,.90],ribs:{from:.03,to:.50,count:18,opacity:.36},waves:[{t:.55,amp:.11,lobes:10},{t:.61,amp:.09,lobes:9},{t:.68,amp:.07,lobes:8}],cap:{hF:.10,rScale:1.65,color:0xc0c0c0,opacity:.9}}}),
  r_mancuerna:fitRcp(25.8,[[0,2.35],[0.03,3.85],[0.08,4.45],[0.18,4.52],[0.26,4.10],[0.30,1.55],[0.37,1.15],[0.52,1.15],[0.58,1.55],[0.63,3.70],[0.70,4.62],[0.82,4.66],[0.88,3.35],[0.92,1.35],[0.97,1.25],[1,1.05]],1000,{marks:[.29,.58,.90],visual:{glass:0xf472b6,edge:0xbe185d,water:0xec4899,rings:[.04,.10,.24,.30,.52,.58,.66,.84,.91,.96],ribs:{from:.63,to:.86,count:20,opacity:.20},bands:[{from:.05,to:.25,color:0xdb2777,opacity:.18},{from:.64,to:.86,color:0xdb2777,opacity:.18}],cap:{hF:.09,rScale:1.20,color:0x93c5fd,opacity:.75}}}),
  r_escalonado:fitRcp(13.6,[[0,2.80],[0.04,3.35],[0.34,3.35],[0.38,3.50],[0.41,4.35],[0.93,4.35],[0.98,4.45],[1,4.42]],490,{marks:[.39],visual:{glass:0xdbeafe,edge:0x64748b,water:0x60a5fa,rings:[.03,.07,.34,.39,.93,.98],ribs:{from:.05,to:.36,count:24,opacity:.14}}}),
  r_pilsner:fitRcp(20.4,[[0,1.80],[0.03,2.70],[0.07,2.95],[0.12,2.15],[0.25,2.05],[0.38,2.40],[0.58,3.25],[0.77,4.10],[0.92,4.58],[1,4.72]],500,{marks:[.12,.38,.77],visual:{glass:0xdbeafe,edge:0x64748b,water:0x38bdf8,rings:[.03,.07,.12,.38,.77,.95,1],ribs:{from:.15,to:.92,count:16,opacity:.16}}})
};
const recVolAt=(key,h)=>{const{H,cps}=RCP[key],N=300,dh=h/N;let v=0;for(let i=0;i<N;i++){const y=(i+.5)*dh,r=interpCP(cps,y/H);v+=Math.PI*r*r*dh;}return v;};
const recHAtV=(key,v)=>{const H=RCP[key].H;let lo=0,hi=H;for(let i=0;i<60;i++){const m=(lo+hi)/2;recVolAt(key,m)<v?lo=m:hi=m;}return(lo+hi)/2;};
const recConstrictions=(key)=>{const{H,cps,marks}=RCP[key];if(marks?.length)return marks.map(t=>+(t*H).toFixed(2));return cps.filter(([,r],i)=>i>0&&i<cps.length-1&&r<cps[i-1][1]&&r<cps[i+1][1]).map(([t])=>+(t*H).toFixed(2));};

const FIGS={
  cubo:{name:"Cubo",icon:"⬛",faces:6,edges:12,vertices:8,dims:[{key:"a",label:"Lado",unit:"cm",def:8}],vol:({a})=>a**3,formula:({a})=>`V = a³ = ${a}³ = ${(a**3).toFixed(1)} cm³`,hAtV:(v,{a})=>v/(a*a),maxH:({a})=>+a,shape:"rect"},
  prisma:{name:"Prisma",icon:"📦",faces:6,edges:12,vertices:8,dims:[{key:"l",label:"Largo",unit:"cm",def:10},{key:"w",label:"Ancho",unit:"cm",def:6},{key:"h",label:"Alto",unit:"cm",def:8}],vol:({l,w,h})=>l*w*h,formula:({l,w,h})=>`V = ${l}×${w}×${h} = ${(l*w*h).toFixed(1)} cm³`,hAtV:(v,{l,w})=>v/(l*w),maxH:({h})=>+h,shape:"rect"},
  cilindro:{name:"Cilindro",icon:"🥫",faces:3,edges:2,vertices:0,dims:[{key:"r",label:"Radio",unit:"cm",def:4},{key:"h",label:"Alto",unit:"cm",def:10}],vol:({r,h})=>Math.PI*r**2*h,formula:({r,h})=>`V = π·${r}²·${h} = ${(Math.PI*r**2*h).toFixed(1)} cm³`,hAtV:(v,{r})=>v/(Math.PI*r**2),maxH:({h})=>+h,shape:"cyl"},
  cono:{name:"Cono",icon:"🍦",faces:2,edges:1,vertices:1,dims:[{key:"r",label:"Radio",unit:"cm",def:4},{key:"h",label:"Alto",unit:"cm",def:10}],vol:({r,h})=>(1/3)*Math.PI*r**2*h,formula:({r,h})=>`V = ⅓π·${r}²·${h} = ${((1/3)*Math.PI*r**2*h).toFixed(1)} cm³`,hAtV:(v,{r,h})=>h*(1-Math.cbrt(Math.max(0,1-3*v/(Math.PI*r**2*h)))),maxH:({h})=>+h,shape:"cone"},
  esfera:{name:"Esfera",icon:"🌐",faces:1,edges:0,vertices:0,dims:[{key:"r",label:"Radio",unit:"cm",def:5}],vol:({r})=>(4/3)*Math.PI*r**3,formula:({r})=>`V = (4/3)π·${r}³ = ${((4/3)*Math.PI*r**3).toFixed(1)} cm³`,hAtV:(v,{r})=>{let lo=0,hi=2*r;for(let i=0;i<60;i++){const m=(lo+hi)/2;Math.PI*m**2*(r-m/3)<v?lo=m:hi=m;}return(lo+hi)/2;},maxH:({r})=>2*+r,shape:"sphere"},
  piramide:{name:"Pirámide",icon:"🔺",faces:5,edges:8,vertices:5,dims:[{key:"b",label:"Base",unit:"cm",def:8},{key:"h",label:"Alto",unit:"cm",def:10}],vol:({b,h})=>(1/3)*b**2*h,formula:({b,h})=>`V = ⅓·${b}²·${h} = ${((1/3)*b**2*h).toFixed(1)} cm³`,hAtV:(v,{b,h})=>h*(1-Math.cbrt(Math.max(0,1-3*v/(b**2*h)))),maxH:({h})=>+h,shape:"pyr"},
  barril:{name:"Barril",icon:"🛢️",faces:3,edges:2,vertices:0,dims:[{key:"r",label:"Radio máx",unit:"cm",def:5},{key:"h",label:"Alto",unit:"cm",def:10}],vol:(d)=>numVolAt(barrilProf,d,d.h),formula:(d)=>`V ≈ ${numVolAt(barrilProf,d,d.h).toFixed(1)} cm³`,hAtV:(v,d)=>numHAtV(barrilProf,d,v),maxH:({h})=>+h,shape:"lathe",profile:barrilProf,hint:"Panza ancha → sube lento al centro, rápido en extremos"},
  copa:{name:"Copa",icon:"🏆",faces:3,edges:2,vertices:0,dims:[{key:"r",label:"Radio copa",unit:"cm",def:5},{key:"h",label:"Alto",unit:"cm",def:12}],vol:(d)=>numVolAt(copaProf,d,d.h),formula:(d)=>`V ≈ ${numVolAt(copaProf,d,d.h).toFixed(1)} cm³`,hAtV:(v,d)=>numHAtV(copaProf,d,v),maxH:({h})=>+h,shape:"lathe",profile:copaProf,hint:"Tallo angosto → altura se dispara al pasar por él"},
  r_barril:{name:"Vaso Barril",icon:"🫙",isRec:true,ml:458,dims:[],vol:()=>recVolAt('r_barril',RCP.r_barril.H),formula:()=>`V ≈ ${recVolAt('r_barril',RCP.r_barril.H).toFixed(0)} ml`,hAtV:(v)=>recHAtV('r_barril',v),maxH:()=>RCP.r_barril.H,shape:"lathe",profile:(t)=>interpCP(RCP.r_barril.cps,t),desc:"3 burbujas muy anchas con constricciones pronunciadas y boca casi plana",hint:"Oscila 3 veces: rápido (constricción) → lento (burbuja) → rápido..."},
  r_cupcake:{name:"Vaso Cupcake",icon:"🧁",isRec:true,ml:500,dims:[],vol:()=>recVolAt('r_cupcake',RCP.r_cupcake.H),formula:()=>`V ≈ ${recVolAt('r_cupcake',RCP.r_cupcake.H).toFixed(0)} ml`,hAtV:(v)=>recHAtV('r_cupcake',v),maxH:()=>RCP.r_cupcake.H,shape:"lathe",profile:(t)=>interpCP(RCP.r_cupcake.cps,t),desc:"Molde que se abre gradualmente → pan ancho → cúpula → cuello muy angosto",hint:"Línea decreciente (molde) → suave (cúpula) → casi vertical (cuello)"},
  r_mancuerna:{name:"Botella Mancuerna",icon:"🏋️",isRec:true,ml:1000,dims:[],vol:()=>recVolAt('r_mancuerna',RCP.r_mancuerna.H),formula:()=>`V ≈ ${recVolAt('r_mancuerna',RCP.r_mancuerna.H).toFixed(0)} ml`,hAtV:(v)=>recHAtV('r_mancuerna',v),maxH:()=>RCP.r_mancuerna.H,shape:"lathe",profile:(t)=>interpCP(RCP.r_mancuerna.cps,t),desc:"Dos esferas iguales arriba y abajo, tubo muy angosto en el centro",hint:"Dos S-curves simétricas separadas por dos picos casi verticales"},
  r_escalonado:{name:"Vaso Escalonado",icon:"🥃",isRec:true,ml:490,dims:[],vol:()=>recVolAt('r_escalonado',RCP.r_escalonado.H),formula:()=>`V ≈ ${recVolAt('r_escalonado',RCP.r_escalonado.H).toFixed(0)} ml`,hAtV:(v)=>recHAtV('r_escalonado',v),maxH:()=>RCP.r_escalonado.H,shape:"lathe",profile:(t)=>interpCP(RCP.r_escalonado.cps,t),desc:"Cilindro inferior + escalón → cilindro superior más ancho",hint:"Dos tramos casi rectos con un pequeño salto de pendiente"},
  r_pilsner:{name:"Copa Pilsner",icon:"🍺",isRec:true,ml:500,dims:[],vol:()=>recVolAt('r_pilsner',RCP.r_pilsner.H),formula:()=>`V ≈ ${recVolAt('r_pilsner',RCP.r_pilsner.H).toFixed(0)} ml`,hAtV:(v)=>recHAtV('r_pilsner',v),maxH:()=>RCP.r_pilsner.H,shape:"lathe",profile:(t)=>interpCP(RCP.r_pilsner.cps,t),desc:"Pie muy estrecho, cuerpo troncocónico creciente",hint:"Empieza muy empinada y se aplana cada vez más al subir"}
};

[
  ["r_barril","Vaso barril triple","B3","Tres barriles anchos con dos cinturas marcadas y tapa verde plana","Cintura = sube rapido; panza ancha = sube lento. Deben aparecer tres tramos lentos."],
  ["r_cupcake","Vaso cupcake","CC","Base acanalada que se abre, domo ondulado y cuello/corona muy angostos","La grafica se aplana en la parte ancha y se vuelve muy inclinada en el cuello."],
  ["r_mancuerna","Botella Gym Water","GY","Dos depositos rosas unidos por un tubo central largo y angosto","En los depositos la altura cambia lento; en el tubo central cambia muy rapido."],
  ["r_escalonado","Vaso escalonado 490","490","Cilindro inferior mas angosto, escalon central y cilindro superior mas ancho","La grafica cambia de pendiente casi de golpe en el escalon."],
  ["r_pilsner","Copa pilsner","PL","Base gruesa, cintura angosta y cuerpo que se abre hacia la boca","Al inicio sube rapido; al abrirse la copa la curva se aplana cada vez mas."]
].forEach(([key,name,icon,desc,hint])=>Object.assign(FIGS[key],{name,icon,desc,hint,ml:RCP[key].ml,water:RCP[key].visual.water,visual:RCP[key].visual,formula:()=>`V ~= ${recVolAt(key,RCP[key].H).toFixed(0)} ml`}));

const QUESTIONS={
  cubo:["¿Qué pasa con el volumen si duplicas el lado?","¿Por qué la gráfica es siempre una línea recta?","¿Cuántos cubos de lado 4 caben en uno de lado 8?"],
  prisma:["¿Qué dimensión afecta más el volumen?","¿Por qué la gráfica es recta aunque no sea cubo?","¿Cómo cambiaría si la base fuera cuadrada?"],
  cilindro:["Si doblas el radio, ¿cuánto se multiplica el volumen?","¿Por qué la gráfica es igual de recta que el cubo?","Compara con el prisma: ¿cuál contiene más volumen?"],
  cono:["¿Por qué el agua sube cada vez más rápido?","Compara con el cilindro igual. ¿Cuánto es su volumen?","¿En qué altura la gráfica tiene mayor pendiente?"],
  esfera:["¿Por qué la gráfica tiene forma de S?","¿Dónde sube más lento el agua y por qué?","¿A qué altura la sección transversal es máxima?"],
  piramide:["¿La gráfica se parece a la del cono?","¿Cuánto equivale su volumen al del prisma base?","¿Cómo cambia si la base es muy grande y el alto pequeño?"],
  barril:["¿En qué parte sube el agua más lento?","Describe las tres fases de la gráfica.","¿Cómo se relaciona la forma con la pendiente?"],
  copa:["¿Cuándo la gráfica se vuelve casi vertical?","¿Por qué sube tan rápido en un momento?","¿Podrías estimar el volumen del tallo mirando la gráfica?"],
  r_barril:["¿Cuántos cambios de velocidad ves en la gráfica? ¿A qué partes corresponden?","¿Por qué la gráfica alterna rápido-lento-rápido?","¿Tu predicción coincidió con la realidad? ¿Qué te sorprendió?"],
  r_cupcake:["¿En qué parte de la gráfica se nota que la base se va abriendo gradualmente?","¿Por qué al llegar al cuello la gráfica se vuelve casi vertical?","¿Tu predicción capturó bien el cambio de pendiente en el cuello?"],
  r_mancuerna:["¿Puedes identificar las 5 fases de la gráfica? (esfera1↑, tubo, esfera1↓, tubo, esfera2)","Las dos esferas son iguales, ¿las dos partes de la gráfica se ven iguales?","¿Tu predicción capturó los dos 'saltos' verticales del tubo?"],
  r_escalonado:["¿En qué segundo aproximado ocurre el escalón en la gráfica?","¿Por qué hay exactamente dos pendientes distintas?","¿Tu predicción identificó correctamente el escalón?"],
  r_pilsner:["¿Cómo se compara esta gráfica con la de un cono?","¿Por qué la curva se aplana cada vez más conforme sube?","¿Tu predicción fue una curva o una recta? ¿Por qué?"]
};

const getVD=(fk,dims)=>{const vd={};(FIGS[fk].dims||[]).forEach(d=>{vd[d.key]=Math.max(parseFloat(dims[d.key])||1,.5);});return vd;};
const makeGeo=(fk,dims)=>{
  const fig=FIGS[fk],vd=getVD(fk,dims),mH=fig.maxH(vd),S=10/mH;
  switch(fig.shape){
    case"rect":{const h=mH*S,l=(vd.l||vd.a)*S,w=(vd.w||vd.a)*S;return{geo:new THREE.BoxGeometry(l,h,w),mHS:h};}
    case"cyl":{const r=vd.r*S,h=mH*S;return{geo:new THREE.CylinderGeometry(r,r,h,48),mHS:h};}
    case"cone":{const r=vd.r*S,h=mH*S;return{geo:new THREE.CylinderGeometry(0,r,h,48),mHS:h};}
    case"sphere":{const r=vd.r*S;return{geo:new THREE.SphereGeometry(r,48,48),mHS:2*r};}
    case"pyr":{const cr=vd.b*S*Math.SQRT2/2,h=mH*S;return{geo:new THREE.ConeGeometry(cr,h,4),mHS:h};}
    case"lathe":{const H=mH*S,pf=fig.profile,pp=[];for(let i=0;i<=64;i++){const t=i/64;pp.push(new THREE.Vector2(Math.max(pf(t,vd)*S,.05),t*H-H/2));}return{geo:new THREE.LatheGeometry(pp,48),mHS:H};}
    default:return{geo:new THREE.BoxGeometry(10,10,10),mHS:10};
  }
};

const ringGeom=(r,y,z=0,amp=0,lobes=0,phase=0)=>{
  const pts=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,rr=r*(1+(lobes?amp*Math.sin(lobes*a+phase):0));pts.push(new THREE.Vector3(Math.cos(a)*rr,y,z+Math.sin(a)*rr));}
  return new THREE.BufferGeometry().setFromPoints(pts);
};
const addRing=(g,r,y,color,opacity=.55,amp=0,lobes=0,phase=0)=>g.add(new THREE.Line(ringGeom(r,y,0,amp,lobes,phase),new THREE.LineBasicMaterial({color,transparent:true,opacity})));
const addLatheBand=(g,pf,vd,S,mHS,band)=>{
  const pp=[];for(let i=0;i<=18;i++){const t=band.from+(band.to-band.from)*i/18;pp.push(new THREE.Vector2(Math.max(pf(t,vd)*S*1.012,.05),t*mHS-mHS/2));}
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pp,64),new THREE.MeshBasicMaterial({color:band.color,transparent:true,opacity:band.opacity??.16,side:THREE.FrontSide,depthWrite:false})));
};
const addLatheRibs=(g,pf,vd,S,mHS,ribs,color)=>{
  for(let i=0;i<ribs.count;i++){const a=i/ribs.count*Math.PI*2,pts=[];for(let j=0;j<=28;j++){const t=ribs.from+(ribs.to-ribs.from)*j/28,r=pf(t,vd)*S*1.018;pts.push(new THREE.Vector3(Math.cos(a)*r,t*mHS-mHS/2,Math.sin(a)*r));}g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:true,opacity:ribs.opacity??.24})));}  
};
const hexColor=(n,fb="#1e40af")=>typeof n==="number"?`#${n.toString(16).padStart(6,"0")}`:fb;

function buildScene(fk,dims,wc,st){
  if(st.group){st.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});st.scene.remove(st.group);}
  const fig=FIGS[fk],visual=fig.visual||{},edgeCol=visual.edge||0x1e40af,glassCol=visual.glass||0xbfdbfe;
  const{geo,mHS}=makeGeo(fk,dims);st.mHS=mHS;
  geo.computeBoundingSphere();
  const outerR=Math.max(geo.boundingSphere?.radius||mHS*.55,mHS*.55);
  const cp=new THREE.Plane(new THREE.Vector3(0,-1,0),-mHS/2);st.cp=cp;
  const g=new THREE.Group();g.rotation.x=st.rot.x;g.rotation.y=st.rot.y;
  const sh=FIGS[fk].shape;

  // 1. Agua (cara interna) — renderizar primero para profundidad
  const waterBack=new THREE.Mesh(geo.clone(),new THREE.MeshPhongMaterial({
    color:wc,shininess:60,transparent:true,opacity:.65,clippingPlanes:[cp],side:THREE.BackSide,depthWrite:false,renderOrder:1
  }));
  g.add(waterBack);

  // 2. Shell exterior (vidrio/cristal)
  g.add(new THREE.Mesh(geo,new THREE.MeshPhongMaterial({
    color:glassCol,specular:0xffffff,shininess:95,transparent:true,opacity:visual.glassOpacity??.16,side:THREE.FrontSide,depthWrite:false,renderOrder:2
  })));
  g.add(new THREE.Mesh(geo.clone(),new THREE.MeshPhongMaterial({
    color:glassCol,transparent:true,opacity:.07,side:THREE.BackSide,depthWrite:false,renderOrder:2
  })));

  // 3. Estructura (aristas o perfiles)
  if(sh==='rect'||sh==='pyr'){
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:edgeCol})));
  }else if(sh==='cyl'||sh==='cone'){
    const vd=getVD(fk,dims),S=10/FIGS[fk].maxH(vd),rBot=(vd.r||0)*S,rTop=sh==='cone'?0:rBot;
    const mkRing=(r,y)=>{const pts=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r));}return new THREE.BufferGeometry().setFromPoints(pts);};
    if(rTop>0)g.add(new THREE.Line(mkRing(rTop,mHS/2),new THREE.LineBasicMaterial({color:edgeCol})));
    g.add(new THREE.Line(mkRing(rBot,-mHS/2),new THREE.LineBasicMaterial({color:edgeCol})));
    const nL=sh==='cone'?1:4;
    for(let i=0;i<nL;i++){const a=i/nL*Math.PI*2;const vg=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a)*rTop,mHS/2,Math.sin(a)*rTop),new THREE.Vector3(Math.cos(a)*rBot,-mHS/2,Math.sin(a)*rBot)]);g.add(new THREE.Line(vg,new THREE.LineBasicMaterial({color:edgeCol})));}
  }else if(sh==='sphere'){
    const vd=getVD(fk,dims),r=vd.r*(10/(2*vd.r));
    [0,.5,-.5].forEach(yf=>{const yr=yf*mHS*.8,cr=Math.sqrt(Math.max(0,r*r-yr*yr));const pts=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*cr,yr,Math.sin(a)*cr));}g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:edgeCol,transparent:true,opacity:.5})));});
  }else if(sh==='lathe'){
    g.add(new THREE.Mesh(geo.clone(),new THREE.MeshBasicMaterial({color:edgeCol,wireframe:true,transparent:true,opacity:.04})));
    const vd2=getVD(fk,dims),S2=10/FIGS[fk].maxH(vd2),pf=FIGS[fk].profile;
    [0,1].forEach(t=>{const r=pf(t,vd2)*S2;const pts=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r,t*mHS-mHS/2,Math.sin(a)*r));}g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:edgeCol})));});
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2;const pts2=[];for(let j=0;j<=32;j++){const t=j/32,r=pf(t,vd2)*S2;pts2.push(new THREE.Vector3(Math.cos(a)*r,t*mHS-mHS/2,Math.sin(a)*r));}g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts2),new THREE.LineBasicMaterial({color:edgeCol,transparent:true,opacity:.6})));}
    visual.bands?.forEach(b=>addLatheBand(g,pf,vd2,S2,mHS,b));
    visual.rings?.forEach((t,i)=>addRing(g,pf(t,vd2)*S2*1.01,t*mHS-mHS/2,edgeCol,.42+(i%2)*.18));
    if(visual.ribs)addLatheRibs(g,pf,vd2,S2,mHS,visual.ribs,edgeCol);
    visual.waves?.forEach((w,i)=>addRing(g,pf(w.t,vd2)*S2*1.015,w.t*mHS-mHS/2,edgeCol,.64,w.amp,w.lobes,i*.9));
    if(visual.cap){
      const topR=pf(1,vd2)*S2*(visual.cap.rScale||1),capH=mHS*(visual.cap.hF||.06);
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(topR,topR,capH,64),new THREE.MeshPhongMaterial({color:visual.cap.color,specular:0xffffff,shininess:120,transparent:true,opacity:visual.cap.opacity??.78,depthWrite:false}));
      cap.position.y=mHS/2+capH/2;cap.renderOrder=6;g.add(cap);
      addRing(g,topR,mHS/2,edgeCol,.45);addRing(g,topR,mHS/2+capH,edgeCol,.45);
    }
  }

  // 4. Agua cara frontal (principal)
  g.add(new THREE.Mesh(geo.clone(),new THREE.MeshPhongMaterial({
    color:wc,specular:0x93c5fd,shininess:120,transparent:true,opacity:.90,clippingPlanes:[cp],side:THREE.FrontSide,depthWrite:false,renderOrder:3
  })));

  // 5. Superficie del agua (disco)
  const cap=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshPhongMaterial({
    color:wc,specular:0xffffff,shininess:200,transparent:true,opacity:.82,side:THREE.DoubleSide,depthWrite:false,renderOrder:4
  }));
  cap.rotation.x=-Math.PI/2;cap.visible=false;g.add(cap);
  st.cap=cap;st.capShape=sh;st.capVd=getVD(fk,dims);st.capS=10/FIGS[fk].maxH(st.capVd);st.capFig=FIGS[fk];

  // 6. Regla y guia de nivel: hacen visible el cambio de altura en el 3D.
  const rulerX=outerR*.72, rulerZ=outerR*.72;
  const rulerMat=new THREE.LineBasicMaterial({color:0x0f172a,transparent:true,opacity:.38});
  const tickMat=new THREE.LineBasicMaterial({color:0x2563eb,transparent:true,opacity:.34});
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(rulerX,-mHS/2,rulerZ),
    new THREE.Vector3(rulerX,mHS/2,rulerZ)
  ]),rulerMat));
  for(let i=0;i<=4;i++){
    const y=-mHS/2+i*mHS/4, len=(i===0||i===4)?.75:.45;
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(rulerX-len,y,rulerZ),
      new THREE.Vector3(rulerX+len,y,rulerZ)
    ]),tickMat));
  }
  const levelGuide=new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-outerR*.64,0,rulerZ),
    new THREE.Vector3(outerR*.82,0,rulerZ)
  ]),new THREE.LineBasicMaterial({color:wc,transparent:true,opacity:.8}));
  levelGuide.position.y=-mHS/2;
  levelGuide.renderOrder=5;g.add(levelGuide);st.levelGuide=levelGuide;st.levelGuideR=outerR;

  st.group=g;st.scene.add(g);st.cam.position.z=mHS*3.0;st.cam.updateProjectionMatrix();
}

function capRadius(sh,vd,S,y,mHS,fig){
  const hF=Math.min(Math.max((y+mHS/2)/mHS,0),1);
  switch(sh){
    case'rect':return null;case'cyl':return vd.r*S;
    case'cone':return vd.r*S*(1-hF);case'sphere':{const r=vd.r*S;return Math.sqrt(Math.max(0,r*r-y*y));}
    case'pyr':return vd.b*S*Math.SQRT2/2*(1-hF);
    case'lathe':return fig?.profile?Math.max(fig.profile(hF,vd)*S,.01):null;
    default:return null;
  }
}

function Fig3D({fk,dims,fillPct,wc=0x3b82f6}){
  const cRef=useRef();
  const stRef=useRef({renderer:null,scene:null,cam:null,group:null,cp:null,cap:null,mHS:10,rot:{x:.38,y:.6},drag:{on:false,lx:0,ly:0}});
  const fpRef=useRef(fillPct);fpRef.current=fillPct;
  useEffect(()=>{
    const R=new THREE.WebGLRenderer({canvas:cRef.current,antialias:true,alpha:true});
    R.setSize(200,200,false);R.localClippingEnabled=true;
    const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(42,1,.1,500);cam.position.z=28;
    sc.add(new THREE.AmbientLight(0xffffff,.75));
    const dl1=new THREE.DirectionalLight(0xffffff,.7);dl1.position.set(5,10,8);sc.add(dl1);
    const dl2=new THREE.DirectionalLight(0xffffff,.3);dl2.position.set(-5,-4,-6);sc.add(dl2);
    const st=stRef.current;st.renderer=R;st.scene=sc;st.cam=cam;
    let raf;
    const tick=()=>{
      raf=requestAnimationFrame(tick);const fp=fpRef.current,s=stRef.current;
      if(s.group){s.group.rotation.x=s.rot.x;s.group.rotation.y=s.rot.y;}
      if(s.cp){
        const wY=fp*s.mHS-s.mHS/2;s.cp.constant=wY;
        if(s.levelGuide){
          s.levelGuide.position.y=wY;
        }
        if(s.cap){
          if(fp>.005){const r=capRadius(s.capShape,s.capVd,s.capS,wY,s.mHS,s.capFig);if(r&&r>.05){s.cap.scale.set(r,r,r);s.cap.position.y=wY;s.cap.visible=true;}else s.cap.visible=false;}
          else s.cap.visible=false;
        }
      }
      R.render(sc,cam);
    };
    tick();return()=>{cancelAnimationFrame(raf);R.dispose();};
  },[]);
  useEffect(()=>{const st=stRef.current;if(!st.renderer)return;buildScene(fk,dims,wc,st);},[fk,JSON.stringify(dims)]);
  const dn=(x,y)=>{const d=stRef.current.drag;d.on=true;d.lx=x;d.ly=y;};
  const mv=(x,y)=>{const st=stRef.current;if(!st.drag.on)return;st.rot.y+=(x-st.drag.lx)*.013;st.rot.x+=(y-st.drag.ly)*.013;st.drag.lx=x;st.drag.ly=y;};
  const up=()=>{stRef.current.drag.on=false;};
  return <canvas ref={cRef} width={200} height={200} style={{width:"100%",height:200,cursor:"grab",display:"block",touchAction:"none"}} onMouseDown={e=>dn(e.clientX,e.clientY)} onMouseMove={e=>mv(e.clientX,e.clientY)} onMouseUp={up} onMouseLeave={up} onTouchStart={e=>dn(e.touches[0].clientX,e.touches[0].clientY)} onTouchMove={e=>mv(e.touches[0].clientX,e.touches[0].clientY)} onTouchEnd={up}/>;
}

function FillReadout({pct,h,maxH,vol,total,color="#2563eb",unit="cm3"}){
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,margin:"7px 0 3px"}}>
      <div style={{background:"#eff6ff",borderRadius:8,padding:"5px 6px",border:`1px solid ${color}22`}}>
        <div style={{fontSize:8,color:"#64748b",fontWeight:700,textTransform:"uppercase"}}>Nivel</div>
        <div style={{fontSize:13,color,fontWeight:800}}>{(pct*100).toFixed(1)}%</div>
      </div>
      <div style={{background:"#f8fafc",borderRadius:8,padding:"5px 6px",border:"1px solid #e2e8f0"}}>
        <div style={{fontSize:8,color:"#64748b",fontWeight:700,textTransform:"uppercase"}}>Altura</div>
        <div style={{fontSize:13,color:"#0f172a",fontWeight:800}}>{h.toFixed(2)} / {maxH.toFixed(1)} cm</div>
      </div>
      <div style={{gridColumn:"1 / -1",background:"#ecfeff",borderRadius:8,padding:"5px 6px",border:"1px solid #bae6fd"}}>
        <div style={{fontSize:8,color:"#64748b",fontWeight:700,textTransform:"uppercase"}}>Volumen llenado</div>
        <div style={{fontSize:13,color:"#0e7490",fontWeight:800}}>{vol.toFixed(1)} / {total.toFixed(1)} {unit}</div>
      </div>
    </div>
  );
}

function ProfileSketch({rkey,w=46,h=64}){
  const{cps,marks,visual={}}=RCP[rkey];const maxR=Math.max(...cps.map(p=>p[1]));const N=80;
  const toXY=(t,r)=>[(w/2)+(r/maxR)*(w/2-1),h-t*h];
  const rPts=Array.from({length:N+1},(_,i)=>{const t=i/N;return toXY(t,interpCP(cps,t));});
  const lPts=[...rPts].reverse().map(([x,y])=>[w-x,y]);
  const path=[...rPts,...lPts].map(([x,y],i)=>`${i===0?'M':'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')+'Z';
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
    <path d={path} fill={hexColor(visual.glass,"#bfdbfe")} fillOpacity=".42" stroke={hexColor(visual.edge,"#1e40af")} strokeWidth="1.5" strokeLinejoin="round"/>
    {(marks||[]).map((t,i)=><line key={i} x1={w*.18} x2={w*.82} y1={h-t*h} y2={h-t*h} stroke={hexColor(visual.edge,"#1e40af")} strokeWidth=".8" strokeDasharray="2 2" opacity=".55"/>)}
  </svg>;
}

function InfoCard({fk,dims}){
  const fig=FIGS[fk],vd=getVD(fk,dims);
  if(fig.isRec)return(
    <div style={{background:"white",borderRadius:13,padding:12,boxShadow:"0 1px 5px #0001"}}>
      <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
        <ProfileSketch rkey={fk} w={52} h={72}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,color:"#1e40af",fontSize:12,marginBottom:5}}>{fig.icon} {fig.name}</div>
          <div style={{display:'flex',gap:5,marginBottom:6}}>
            <div style={{background:"#dbeafe",borderRadius:7,padding:"4px 8px",textAlign:"center",flex:1}}><div style={{fontSize:13,fontWeight:800,color:"#1e40af"}}>{fig.ml}</div><div style={{fontSize:8,color:"#64748b"}}>ml etiqueta</div></div>
            <div style={{background:"#dcfce7",borderRadius:7,padding:"4px 8px",textAlign:"center",flex:1}}><div style={{fontSize:13,fontWeight:800,color:"#166534"}}>{fig.vol().toFixed(0)}</div><div style={{fontSize:8,color:"#64748b"}}>ml calculado</div></div>
          </div>
          <div style={{background:"#eff6ff",borderRadius:7,padding:"5px 7px",fontSize:9,color:"#1e40af",marginBottom:4,lineHeight:1.5}}>📐 {fig.desc}</div>
          <div style={{background:"#f0fdf4",borderRadius:7,padding:"5px 7px",fontSize:9,color:"#166534",lineHeight:1.5}}>💡 {fig.hint}</div>
        </div>
      </div>
    </div>
  );
  return(
    <div style={{background:"white",borderRadius:13,padding:12,boxShadow:"0 1px 5px #0001"}}>
      <div style={{fontWeight:700,color:"#1e40af",fontSize:12,marginBottom:8}}>{fig.icon} {fig.name}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:8}}>
        {[{l:"Caras",v:fig.faces,bg:"#dbeafe"},{l:"Aristas",v:fig.edges,bg:"#dcfce7"},{l:"Vértices",v:fig.vertices,bg:"#fef9c3"}].map(x=>(
          <div key={x.l} style={{background:x.bg,borderRadius:8,padding:"5px 2px",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:800,color:"#1e40af"}}>{x.v}</div><div style={{fontSize:9,color:"#64748b"}}>{x.l}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fef9c3",borderRadius:8,padding:"6px 8px",fontSize:10,color:"#78350f",lineHeight:1.5}}>🧮 {fig.formula(vd)}</div>
      {fig.hint&&<div style={{background:"#f0fdf4",borderRadius:8,padding:"5px 8px",fontSize:10,color:"#166534",lineHeight:1.5,marginTop:6}}>💡 {fig.hint}</div>}
    </div>
  );
}

function DimInputs({fk,dims,setDims,rst,accent}){
  const fig=FIGS[fk];if(!fig.dims||!fig.dims.length)return null;
  return(<div style={{marginBottom:8}}>{fig.dims.map(d=>(<div key={d.key} style={{marginBottom:5}}><label style={{fontSize:10,color:"#475569",display:"block",marginBottom:2}}>{d.label} ({d.unit})</label><input type="number" min="1" max="99" value={dims[d.key]??d.def} onChange={e=>{setDims(p=>({...p,[d.key]:e.target.value}));rst();}} style={{width:"100%",padding:"4px 6px",borderRadius:6,border:`1.5px solid ${accent}`,fontSize:12,boxSizing:"border-box"}}/></div>))}</div>);
}

function PredCanvas({maxT,maxH,onFinish,onClear}){
  const cRef=useRef(),ptsRef=useRef([]),drag=useRef(false);
  const W=250,H=148,LM=22,BM=18;
  const redraw=()=>{
    const c=cRef.current;if(!c)return;const ctx=c.getContext("2d");ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="#f1f5f9";ctx.lineWidth=.8;
    for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(LM+i*(W-LM)/5,0);ctx.lineTo(LM+i*(W-LM)/5,H-BM);ctx.stroke();ctx.beginPath();ctx.moveTo(LM,i*(H-BM)/5);ctx.lineTo(W,i*(H-BM)/5);ctx.stroke();}
    ctx.strokeStyle="#94a3b8";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(LM,4);ctx.lineTo(LM,H-BM);ctx.lineTo(W-2,H-BM);ctx.stroke();
    ctx.fillStyle="#94a3b8";ctx.font="8px sans-serif";
    ctx.fillText("h",2,10);ctx.fillText(maxH.toFixed(0),2,15);ctx.fillText("0",LM-8,H-BM);ctx.fillText("t",W-8,H-BM+10);ctx.fillText("~"+maxT.toFixed(0)+"s",W-33,H-BM-2);
    if(!ptsRef.current.length){ctx.fillStyle="#a5b4fc";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText("✏️ Dibuja tu predicción aquí",W/2+LM/2,(H-BM)/2-4);ctx.font="8px sans-serif";ctx.fillStyle="#c4b5fd";ctx.fillText("¿Cómo crees que subirá el agua?",W/2+LM/2,(H-BM)/2+11);ctx.textAlign="left";}
    if(ptsRef.current.length>1){ctx.strokeStyle="#f97316";ctx.lineWidth=2.5;ctx.setLineDash([5,3]);ctx.beginPath();ptsRef.current.forEach((p,i)=>{const x=LM+p.x*(W-LM-2),y=(H-BM)-p.y*(H-BM-5);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.stroke();ctx.setLineDash([]);}
  };
  useEffect(()=>{redraw();},[maxT,maxH]);
  const getP=(e,touch=false)=>{const c=cRef.current;if(!c)return null;const r=c.getBoundingClientRect();const src=touch?e.touches[0]:e;const px=(src.clientX-r.left)/r.width*W,py=(src.clientY-r.top)/r.height*H;return{x:Math.max(0,Math.min(1,(px-LM)/(W-LM-2))),y:Math.max(0,Math.min(1,((H-BM)-py)/(H-BM-5)))};};
  const onDn=(e,t=false)=>{drag.current=true;ptsRef.current=[];const p=getP(e,t);if(p)ptsRef.current.push(p);redraw();};
  const onMv=(e,t=false)=>{if(!drag.current)return;const p=getP(e,t);if(!p)return;const last=ptsRef.current[ptsRef.current.length-1];if(!last||Math.abs(p.x-last.x)>.007)ptsRef.current.push(p);redraw();};
  const onUp=()=>{drag.current=false;if(ptsRef.current.length>3)onFinish([...ptsRef.current]);};
  return(
    <div style={{background:"white",borderRadius:12,padding:10,boxShadow:"0 1px 5px #0001"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <span style={{fontSize:11,fontWeight:700,color:"#7c3aed"}}>✏️ Dibuja tu predicción</span>
        <button onClick={()=>{ptsRef.current=[];redraw();onClear();}} style={{fontSize:9,padding:"2px 7px",borderRadius:6,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",color:"#64748b"}}>Borrar</button>
      </div>
      <canvas ref={cRef} width={W} height={H} style={{width:"100%",height:H,cursor:"crosshair",background:"#f8fafc",borderRadius:8,border:"1.5px dashed #a5b4fc",touchAction:"none",display:"block"}} onMouseDown={e=>onDn(e)} onMouseMove={e=>onMv(e)} onMouseUp={onUp} onMouseLeave={onUp} onTouchStart={e=>{e.preventDefault();onDn(e,true);}} onTouchMove={e=>{e.preventDefault();onMv(e,true);}} onTouchEnd={onUp}/>
      <div style={{fontSize:9,color:"#94a3b8",textAlign:"center",marginTop:3}}>Dibuja de izquierda → derecha, luego presiona ▶ Iniciar</div>
    </div>
  );
}

export default function App(){
  const[mode,setMode]=useState("normal");
  const[fk1,setFk1]=useState("cubo"),[dims1,setDims1]=useState({a:"8"});
  const[fk2,setFk2]=useState("cilindro"),[dims2,setDims2]=useState({r:"4",h:"10"});
  const[flow,setFlow]=useState(5);
  const[run,setRun]=useState(false);
  const[v1,setV1]=useState(0),[v2,setV2]=useState(0),[sT,setST]=useState(0);
  const[ch,setCh]=useState([{t:0,h1:0,h2:0}]);
  const[predPts,setPredPts]=useState([]);
  const[recPred,setRecPred]=useState(false);
  const[recPredPts,setRecPredPts]=useState([]);
  const[showQ,setShowQ]=useState(false);

  const v1R=useRef(0),v2R=useRef(0),tR=useRef(0),chR=useRef([{t:0,h1:0,h2:0}]);
  const flR=useRef(5),cmpR=useRef(false),d1R=useRef(null),d2R=useRef(null);
  flR.current=flow;cmpR.current=mode==="comparar";
  const isCmp=mode==="comparar",isRec=mode==="recipientes",isPred=mode==="prediccion";
  const fig1=FIGS[fk1],vd1=getVD(fk1,dims1),tV1=fig1.vol(vd1),mH1=fig1.maxH(vd1);
  const pct1=Math.min(v1/tV1,1),hc1=Math.min(fig1.hAtV(Math.max(v1,0),vd1),mH1);
  const fig2=FIGS[fk2],vd2=getVD(fk2,dims2),tV2=fig2.vol(vd2),mH2=fig2.maxH(vd2);
  const pct2=Math.min(v2/tV2,1),hc2=Math.min(fig2.hAtV(Math.max(v2,0),vd2),mH2);
  const unit1=fig1.isRec?"ml":"cm3",unit2=fig2.isRec?"ml":"cm3";
  d1R.current={tV:tV1,mH:mH1,fig:fig1,vd:vd1};d2R.current={tV:tV2,mH:mH2,fig:fig2,vd:vd2};

  const rst=()=>{setRun(false);v1R.current=v2R.current=tR.current=0;chR.current=[{t:0,h1:0,h2:0}];setV1(0);setV2(0);setST(0);setCh([{t:0,h1:0,h2:0}]);};
  const cf1=k=>{const dd={};(FIGS[k].dims||[]).forEach(d=>{dd[d.key]=String(d.def);});setFk1(k);setDims1(dd);rst();setRecPredPts([]);};
  const cf2=k=>{const dd={};(FIGS[k].dims||[]).forEach(d=>{dd[d.key]=String(d.def);});setFk2(k);setDims2(dd);rst();};
  const chgMode=m=>{
    setMode(m);rst();setPredPts([]);setRecPred(false);setRecPredPts([]);
    if(m==='recipientes'&&!FIGS[fk1]?.isRec)cf1('r_barril');
    else if(m!=='recipientes'&&FIGS[fk1]?.isRec)cf1('cubo');
  };

  useEffect(()=>{
    if(!run)return;
    let raf,lT=null;
    const loop=ts=>{
      if(!lT)lT=ts;const dt=Math.min((ts-lT)/1000,.1);lT=ts;
      const fl=flR.current,cm=cmpR.current,d1=d1R.current,d2=d2R.current;
      const nv1=Math.min(v1R.current+fl*dt,d1.tV),nv2=cm?Math.min(v2R.current+fl*dt,d2.tV):0;
      v1R.current=nv1;if(cm)v2R.current=nv2;tR.current+=dt;
      const nh1=Math.min(d1.fig.hAtV(nv1,d1.vd),d1.mH),nh2=cm?Math.min(d2.fig.hAtV(nv2,d2.vd),d2.mH):0;
      const lp=chR.current[chR.current.length-1];
      if(!lp||tR.current-lp.t>=.35){chR.current=[...chR.current,{t:+tR.current.toFixed(1),h1:+nh1.toFixed(2),h2:+nh2.toFixed(2)}];setCh([...chR.current]);}
      setV1(nv1);if(cm)setV2(nv2);setST(tR.current);
      if(nv1<d1.tV||(cm&&nv2<d2.tV))raf=requestAnimationFrame(loop);else setRun(false);
    };
    raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf);
  },[run]);

  const dhdtData=ch.slice(1).map((pt,i)=>{const prev=ch[i],dt=pt.t-prev.t;if(dt<=0)return null;return{t:pt.t,v1:+((pt.h1-prev.h1)/dt).toFixed(3),v2:+((pt.h2-prev.h2)/dt).toFixed(3)};}).filter(Boolean);
  const estT=flow>0?tV1/flow:60;

  // Puntos de predicción activos (modo predicción normal O recipientes+predicción)
  const activePredPts=(isPred&&predPts.length>2)?predPts:(isRec&&recPred&&recPredPts.length>2)?recPredPts:[];
  const chartData=activePredPts.length>2?ch.map(pt=>{
    const tx=pt.t/estT;let lo=null,hi=null;
    for(let i=0;i<activePredPts.length-1;i++){if(activePredPts[i].x<=tx&&activePredPts[i+1].x>=tx){lo=activePredPts[i];hi=activePredPts[i+1];break;}}
    let py=activePredPts[0].y;
    if(lo&&hi){const f=hi.x===lo.x?0:(tx-lo.x)/(hi.x-lo.x);py=lo.y+f*(hi.y-lo.y);}
    else if(tx>=activePredPts[activePredPts.length-1].x)py=activePredPts[activePredPts.length-1].y;
    return{...pt,pred:+(py*mH1).toFixed(2)};
  }):ch;

  const constriccionesH=isRec&&FIGS[fk1]?.isRec?recConstrictions(fk1):[];
  const showPred=activePredPts.length>2;
  const full=pct1>=1&&(!isCmp||pct2>=1);
  const bBg=run?"#f59e0b":full?"#10b981":"#2563eb",bTx=run?"⏸ Pausa":full?"🔄 Reiniciar":"▶ Iniciar";

  const FigSel=(cur,onSel,skip,onlyRec=false)=>(
    <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
      {Object.entries(FIGS).filter(([k,f])=>!!f.isRec===onlyRec&&k!==skip).map(([k,f])=>(
        <button key={k} onClick={()=>onSel(k)} style={{padding:"3px 7px",borderRadius:11,border:"1.5px solid",fontSize:10,fontWeight:600,cursor:"pointer",borderColor:cur===k?"#2563eb":"#cbd5e1",background:cur===k?"#2563eb":"white",color:cur===k?"white":"#334155"}}>{f.icon} {f.name}</button>
      ))}
    </div>
  );
  const ProgBar=(pct,col)=>(<div style={{background:"#e2e8f0",borderRadius:7,height:10,overflow:"hidden",marginTop:4}}><div style={{width:`${pct*100}%`,height:"100%",borderRadius:7,background:pct>=1?"#10b981":col,transition:"width .08s"}}/></div>);

  return(
    <div style={{fontFamily:"sans-serif",background:"#f0f9ff",minHeight:"100vh",padding:"12px 8px"}}>
      <div style={{maxWidth:990,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:10}}>
          <div style={{fontSize:20,fontWeight:800,color:"#1e40af"}}>💧 Llena la Figura — Volumen 3D</div>
          <div style={{color:"#64748b",fontSize:11,marginTop:2}}>Arrastra para rotar · Matemáticas Secundaria</div>
        </div>

        <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:12,flexWrap:"wrap"}}>
          {[["normal","🔵","Normal"],["prediccion","✏️","Predicción"],["recipientes","🫙","Recipientes"],["comparar","⚖️","Comparar"]].map(([k,ic,lb])=>(
            <button key={k} onClick={()=>chgMode(k)} style={{padding:"6px 13px",borderRadius:16,border:"2px solid",cursor:"pointer",fontWeight:700,fontSize:11,borderColor:mode===k?"#2563eb":"#cbd5e1",background:mode===k?"#2563eb":"white",color:mode===k?"white":"#334155"}}>{ic} {lb}</button>
          ))}
        </div>

        {isPred&&<div style={{textAlign:"center",marginBottom:10,background:"#f5f3ff",borderRadius:10,padding:"7px 12px",fontSize:11,color:"#7c3aed",maxWidth:600,margin:"0 auto 10px"}}>✏️ <strong>Modo Predicción:</strong> Dibuja cómo crees que subirá el agua, luego presiona ▶ para comparar.</div>}

        {/* Selector visual de recipientes */}
        {isRec&&(
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",justifyContent:"center",marginBottom:8}}>
              {Object.entries(FIGS).filter(([,f])=>f.isRec).map(([k,f])=>(
                <button key={k} onClick={()=>cf1(k)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"9px 11px",borderRadius:14,border:"2px solid",cursor:"pointer",background:fk1===k?"#eff6ff":"white",borderColor:fk1===k?"#2563eb":"#e2e8f0",minWidth:75}}>
                  <ProfileSketch rkey={k} w={44} h={60}/>
                  <div style={{fontSize:10,fontWeight:700,color:fk1===k?"#1e40af":"#334155",lineHeight:1.2}}>{f.name}</div>
                  <div style={{fontSize:9,color:"#64748b"}}>{f.ml} ml</div>
                </button>
              ))}
            </div>
            {/* Toggle predicción en recipientes */}
            <div style={{display:"flex",justifyContent:"center"}}>
              <button onClick={()=>{setRecPred(p=>!p);setRecPredPts([]);rst();}}
                style={{padding:"6px 16px",borderRadius:14,border:"2px solid",cursor:"pointer",fontWeight:700,fontSize:11,
                  borderColor:recPred?"#7c3aed":"#cbd5e1",background:recPred?"#7c3aed":"white",color:recPred?"white":"#334155"}}>
                {recPred?"✅ Predicción activa — dibuja antes de iniciar":"✏️ Activar predicción del recipiente"}
              </button>
            </div>
          </div>
        )}

        <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center",alignItems:"flex-start"}}>
          {/* Figura 1 */}
          <div style={{background:"white",borderRadius:14,padding:13,width:213,boxShadow:"0 1px 6px #0001",flexShrink:0}}>
            <div style={{fontWeight:700,color:isRec?"#0891b2":"#2563eb",fontSize:12,marginBottom:8}}>
              {isRec?"🫙 Recipiente":isCmp?"🔵 Figura 1":"🔵 Figura"}
            </div>
            {!isRec&&FigSel(fk1,cf1,isCmp?fk2:null,false)}
            {!isRec&&<DimInputs fk={fk1} dims={dims1} setDims={setDims1} rst={rst} accent="#93c5fd"/>}
            <Fig3D fk={fk1} dims={dims1} fillPct={pct1} wc={fig1.water||0x3b82f6}/>
            <FillReadout pct={pct1} h={hc1} maxH={mH1} vol={v1} total={tV1} color={isRec?hexColor(fig1.water,"#2563eb"):"#2563eb"} unit={unit1}/>
            <div style={{fontSize:9,color:"#94a3b8",textAlign:"center",marginTop:2,marginBottom:2}}>🖱️ arrastra para rotar</div>
            {ProgBar(pct1,"#3b82f6")}
            <div style={{fontSize:10,color:"#475569",marginTop:5,lineHeight:1.8,textAlign:"center"}}>
              <div><strong>{v1.toFixed(1)}</strong>/<strong>{tV1.toFixed(1)}</strong> {unit1} · <strong>{(pct1*100).toFixed(1)}%</strong></div>
              <div>h: <strong>{hc1.toFixed(2)}</strong>/<strong>{mH1.toFixed(1)}</strong> cm · <strong>{sT.toFixed(1)}</strong>s</div>
            </div>
          </div>

          {/* Figura 2 */}
          {isCmp&&(
            <div style={{background:"white",borderRadius:14,padding:13,width:213,boxShadow:"0 1px 6px #0001",flexShrink:0}}>
              <div style={{fontWeight:700,color:"#ea580c",fontSize:12,marginBottom:8}}>🟠 Figura 2</div>
              {FigSel(fk2,cf2,fk1,false)}
              <DimInputs fk={fk2} dims={dims2} setDims={setDims2} rst={rst} accent="#fdba74"/>
              <Fig3D fk={fk2} dims={dims2} fillPct={pct2} wc={fig2.water||0xf97316}/>
              <FillReadout pct={pct2} h={hc2} maxH={mH2} vol={v2} total={tV2} color={hexColor(fig2.water,"#ea580c")} unit={unit2}/>
              <div style={{fontSize:9,color:"#94a3b8",textAlign:"center",marginTop:2,marginBottom:2}}>🖱️ arrastra para rotar</div>
              {ProgBar(pct2,"#f97316")}
              <div style={{fontSize:10,color:"#475569",marginTop:5,lineHeight:1.8,textAlign:"center"}}>
                <div><strong>{v2.toFixed(1)}</strong>/<strong>{tV2.toFixed(1)}</strong> {unit2} · <strong>{(pct2*100).toFixed(1)}%</strong></div>
                <div>h: <strong>{hc2.toFixed(2)}</strong>/<strong>{mH2.toFixed(1)}</strong> cm</div>
              </div>
            </div>
          )}

          {/* Panel derecho */}
          <div style={{display:"flex",flexDirection:"column",gap:10,width:258,flexShrink:0}}>

            {/* Controles */}
            <div style={{background:"white",borderRadius:13,padding:12,boxShadow:"0 1px 5px #0001"}}>
              <div style={{fontWeight:700,color:"#1e40af",fontSize:12,marginBottom:7}}>🎛️ Controles</div>
              <div style={{fontSize:10,color:"#475569",fontWeight:600,marginBottom:2}}>💧 Flujo: <span style={{color:"#2563eb"}}>{flow} cm³/s</span></div>
              <input type="range" min=".5" max="30" step=".5" value={flow} onChange={e=>setFlow(parseFloat(e.target.value))} style={{width:"100%",accentColor:"#2563eb",marginBottom:2}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#94a3b8",marginBottom:9}}><span>🐢 Lento</span><span>🚀 Rápido</span></div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>{if(full){rst();return;}setRun(r=>!r);}} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:bBg,color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>{bTx}</button>
                <button onClick={()=>{rst();setRecPredPts([]);}} style={{padding:"8px 11px",borderRadius:8,border:"none",background:"#e2e8f0",color:"#475569",fontWeight:700,cursor:"pointer"}}>🔄</button>
              </div>
            </div>

            <InfoCard fk={fk1} dims={dims1}/>
            {isCmp&&<InfoCard fk={fk2} dims={dims2}/>}

            {/* Canvas de predicción — modo normal */}
            {isPred&&!run&&pct1<1&&<PredCanvas maxT={estT} maxH={mH1} onFinish={pts=>setPredPts(pts)} onClear={()=>setPredPts([])}/>}
            {isPred&&predPts.length>2&&pct1<1&&!run&&<div style={{background:"#f5f3ff",borderRadius:10,padding:"7px 10px",fontSize:10,color:"#7c3aed",textAlign:"center"}}>✅ Predicción guardada · Presiona ▶ para ver si acertaste</div>}

            {/* Canvas de predicción — modo recipientes */}
            {isRec&&recPred&&!run&&pct1<1&&(
              <PredCanvas maxT={estT} maxH={mH1} onFinish={pts=>setRecPredPts(pts)} onClear={()=>setRecPredPts([])}/>
            )}
            {isRec&&recPred&&recPredPts.length>2&&pct1<1&&!run&&(
              <div style={{background:"#f5f3ff",borderRadius:10,padding:"7px 10px",fontSize:10,color:"#7c3aed",textAlign:"center"}}>
                ✅ Predicción guardada · Presiona ▶ para comparar con la gráfica real
              </div>
            )}
            {isRec&&recPred&&pct1>=1&&(
              <div style={{background:"#fef9c3",borderRadius:10,padding:"8px 10px",fontSize:10,color:"#78350f",lineHeight:1.6}}>
                <strong>🧐 Compara las curvas:</strong><br/>
                — <span style={{color:"#2563eb",fontWeight:700}}>Azul sólida</span> = comportamiento real<br/>
                — <span style={{color:"#f97316",fontWeight:700}}>Naranja punteada</span> = tu predicción
              </div>
            )}

            {/* Gráfica h(t) */}
            <div style={{background:"white",borderRadius:13,padding:12,boxShadow:"0 1px 5px #0001"}}>
              <div style={{fontWeight:700,color:"#1e40af",fontSize:12,marginBottom:2}}>
                📈 {isRec?`${fig1.icon} ${fig1.name} — `:''}Altura vs Tiempo
              </div>
              {isRec&&constriccionesH.length>0&&<div style={{fontSize:9,color:"#94a3b8",marginBottom:4,display:"flex",alignItems:"center",gap:4}}><span style={{display:"inline-block",width:18,borderTop:"2px dashed #94a3b8",flexShrink:0}}></span><span>líneas = constricciones del recipiente</span></div>}
              {showPred&&<div style={{fontSize:9,color:"#f97316",marginBottom:4}}>🟠 Punteada = tu predicción · Sólida = real</div>}
              <ResponsiveContainer width="100%" height={isRec?185:150}>
                <LineChart data={chartData} margin={{top:5,right:8,bottom:22,left:-5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="t" tick={{fontSize:9}} label={{value:"Tiempo (s)",position:"insideBottom",offset:-12,fontSize:9,fill:"#64748b"}}/>
                  <YAxis tick={{fontSize:9}} label={{value:"Altura (cm)",angle:-90,position:"insideLeft",offset:16,fontSize:9,fill:"#64748b"}}/>
                  <Tooltip formatter={(v,n)=>[`${v} cm`,n]} labelFormatter={l=>`t = ${l} s`} contentStyle={{fontSize:10,borderRadius:8}}/>
                  {(isCmp||showPred)&&<Legend wrapperStyle={{fontSize:9,paddingTop:4}}/>}
                  {constriccionesH.map((h,i)=>(
                    <ReferenceLine key={i} y={h} stroke="#94a3b8" strokeDasharray="4 3"
                      label={{value:`${h}cm`,position:"insideRight",fontSize:8,fill:"#94a3b8"}}/>
                  ))}
                  <Line type="monotone" dataKey="h1" stroke="#2563eb" dot={false} strokeWidth={2.5} name={isCmp?fig1.name:showPred?"Gráfica real":"Altura"} isAnimationActive={false}/>
                  {isCmp&&<Line type="monotone" dataKey="h2" stroke="#f97316" dot={false} strokeWidth={2.5} name={fig2.name} isAnimationActive={false}/>}
                  {showPred&&<Line type="monotone" dataKey="pred" stroke="#f97316" dot={false} strokeWidth={2} strokeDasharray="6 3" name="Mi predicción" isAnimationActive={false}/>}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfica dh/dt */}
            <div style={{background:"white",borderRadius:13,padding:12,boxShadow:"0 1px 5px #0001"}}>
              <div style={{fontWeight:700,color:"#059669",fontSize:12,marginBottom:2}}>⚡ Velocidad de subida (dh/dt)</div>
              <div style={{fontSize:9,color:"#94a3b8",marginBottom:5}}>Pico alto = sección angosta · Valle = sección ancha</div>
              <ResponsiveContainer width="100%" height={isRec?140:120}>
                <LineChart data={dhdtData} margin={{top:4,right:8,bottom:22,left:-5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="t" tick={{fontSize:9}} label={{value:"Tiempo (s)",position:"insideBottom",offset:-12,fontSize:9,fill:"#64748b"}}/>
                  <YAxis tick={{fontSize:9}} width={34} label={{value:"cm/s",angle:-90,position:"insideLeft",offset:16,fontSize:9,fill:"#64748b"}}/>
                  <Tooltip formatter={(v,n)=>[`${v} cm/s`,n]} labelFormatter={l=>`t = ${l} s`} contentStyle={{fontSize:10,borderRadius:8}}/>
                  {isCmp&&<Legend wrapperStyle={{fontSize:9,paddingTop:4}}/>}
                  <Line type="monotone" dataKey="v1" stroke="#10b981" dot={false} strokeWidth={2} name={isCmp?fig1.name+" dh/dt":"dh/dt"} isAnimationActive={false}/>
                  {isCmp&&<Line type="monotone" dataKey="v2" stroke="#f59e0b" dot={false} strokeWidth={2} name={fig2.name+" dh/dt"} isAnimationActive={false}/>}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Preguntas guiadas */}
            <div style={{background:"white",borderRadius:13,padding:12,boxShadow:"0 1px 5px #0001"}}>
              <button onClick={()=>setShowQ(q=>!q)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",cursor:"pointer",padding:0}}>
                <span style={{fontWeight:700,color:"#1e40af",fontSize:12}}>🧠 Preguntas guiadas</span>
                <span style={{fontSize:12,color:"#94a3b8"}}>{showQ?"▲":"▼"}</span>
              </button>
              {showQ&&(
                <div style={{marginTop:8}}>
                  {(QUESTIONS[fk1]||[]).map((q,i)=>(
                    <div key={i} style={{background:"#f8fafc",borderRadius:8,padding:"7px 9px",marginBottom:5,fontSize:11,color:"#334155",lineHeight:1.5}}>
                      <strong style={{color:"#7c3aed"}}>{i+1}.</strong> {q}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
