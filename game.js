(()=>{"use strict";
const C=document.getElementById("game"),ctx=C.getContext("2d",{alpha:false});
const menu=document.getElementById("menu"),hud=document.getElementById("hud"),status=document.getElementById("status");
const W=40,D=40,MIN=-6,SEA=6;let world=new Map(),seed=1,seedText="Nikita123",sel=0;
let px=20.5,pz=20.5,py=10,yaw=0,pitch=-.18,vy=0,ground=true,sx=0,sy=0,last=performance.now(),started=false;
const HOT=["grass","dirt","stone","wood","leaves","sand"];
const COL={grass:"#64bf50",dirt:"#8c5a37",stone:"#777c80",wood:"#99643b",leaves:"#3d9845",sand:"#d8c17a",water:"#3b91c7",bedrock:"#30343a"};
const K=(x,y,z)=>x+"|"+y+"|"+z;
function H(n){n|=0;n=Math.imul(n^(n>>>16),2246822519);n=Math.imul(n^(n>>>13),3266489917);return(n^(n>>>16))>>>0}
function SH(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function R(x,z,o=0){return H((x*374761393+z*668265263+seed+o*1442695041)|0)/4294967296}
function N(x,z,s,o){let a=Math.floor(x*s),b=Math.floor(z*s),fx=x*s-a,fz=z*s-b,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz),q=R(a,b,o),r=R(a+1,b,o),t=R(a,b+1,o),w=R(a+1,b+1,o);return q+(r-q)*u+((t+(w-t)*u)-(q+(r-q)*u))*v}
function height(x,z){return Math.max(2,Math.min(20,Math.floor(SEA-1+(N(x,z,.035,1)-.5)*12+(N(x,z,.09,2)-.5)*4)))}
function biome(x,z){let t=N(x,z,.02,7),m=N(x,z,.025,8);return t>.72&&m<.5?"desert":m>.66?"forest":t<.27?"taiga":"plains"}
function gen(s){
 seedText=s||"Nikita123";seed=SH(seedText);world=new Map();
 for(let x=0;x<W;x++)for(let z=0;z<D;z++){let h=height(x,z),b=biome(x,z);
   for(let y=MIN;y<=h;y++){let t=y===MIN?"bedrock":y===h?((h<=SEA+1||b==="desert")?"sand":"grass"):(y>=h-2?(b==="desert"?"sand":"dirt"):"stone");world.set(K(x,y,z),t)}
   if(h<SEA)for(let y=h+1;y<=SEA;y++)world.set(K(x,y,z),"water");
   let chance=b==="forest"?.045:b==="taiga"?.025:b==="plains"?.008:0;
   if(chance&&h>SEA+2&&R(x,z,30)<chance){for(let y=1;y<=3;y++)world.set(K(x,h+y,z),"wood");for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(let dy=3;dy<=4;dy++)if(R(x+dx,z+dz,40+dy)>.18)world.set(K(x+dx,h+dy,z+dz),"leaves")}
 }
 spawn();save();draw();
}
function get(x,y,z){return world.get(K(x,y,z))}
function surf(x,z){for(let y=22;y>MIN;y--){let t=get(x,y,z);if(t&&t!=="water"&&t!=="wood"&&t!=="leaves")return y}return null}
function good(x,z){let y=surf(x,z);if(x<5||z<5||x>W-6||z>D-6||y===null||y<SEA+3||get(x,y,z)!=="grass")return false;for(let dx=-3;dx<=3;dx++)for(let dz=-3;dz<=3;dz++){let q=surf(x+dx,z+dz);if(q===null||q<=SEA+1||Math.abs(q-y)>3)return false}return !get(x,y+1,z)}
function spawn(){for(let i=0;i<600;i++){let x=5+Math.floor(R(i,seed,71)*(W-10)),z=5+Math.floor(R(i,seed,91)*(D-10));if(good(x,z)){let y=surf(x,z);px=x+.5;pz=z+.5;py=y+1.02;vy=0;ground=true;return}}let y=surf(20,20)||SEA+3;px=20.5;pz=20.5;py=y+1.02}
function resize(){let d=Math.min(devicePixelRatio||1,1.5);C.width=innerWidth*d;C.height=innerHeight*d}
function proj(x,y,z){let dx=x-px,dz=z-pz,c=Math.cos(yaw),s=Math.sin(yaw),X=dx*c-dz*s,Z=dx*s+dz*c,Y=y-(py+1.5),cp=Math.cos(pitch),sp=Math.sin(pitch),YY=Y*cp-Z*sp,ZZ=Y*sp+Z*cp;if(ZZ<=.2)return null;let f=Math.min(C.width,C.height)*.9;return [C.width/2+X*f/ZZ,C.height/2-YY*f/ZZ,ZZ]}
function draw(){ctx.fillStyle="#8bcfe9";ctx.fillRect(0,0,C.width,C.height);if(!started)return;let cx=Math.floor(px),cz=Math.floor(pz),list=[];for(let x=Math.max(0,cx-14);x<Math.min(W,cx+15);x++)for(let z=Math.max(0,cz-14);z<Math.min(D,cz+15);z++){let h=surf(x,z);if(h==null)continue;let top=get(x,h,z),p=proj(x+.5,h+.5,z+.5);if(p)list.push({x,y:h,z,t:top,p});}list.sort((a,b)=>b.p[2]-a.p[2]);for(const b of list){let p0=proj(b.x,b.y,b.z),p1=proj(b.x+1,b.y,b.z),p2=proj(b.x+1,b.y+1,b.z),p3=proj(b.x,b.y+1,b.z);if(!p0||!p1||!p2||!p3)continue;ctx.fillStyle=COL[b.t]||"#777";ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.lineTo(p3[0],p3[1]);ctx.closePath();ctx.fill();ctx.strokeStyle="#0002";ctx.stroke();
 let q0=proj(b.x,b.y,b.z+1),q1=proj(b.x+1,b.y,b.z+1),q2=proj(b.x+1,b.y+1,b.z+1),q3=proj(b.x,b.y+1,b.z+1);if(q0&&q1&&q2&&q3){ctx.fillStyle=shade(COL[b.t],.72);ctx.beginPath();ctx.moveTo(q0[0],q0[1]);ctx.lineTo(q1[0],q1[1]);ctx.lineTo(q2[0],q2[1]);ctx.lineTo(q3[0],q3[1]);ctx.closePath();ctx.fill()}}
}
function shade(c,k){if(!c||c[0]!=="#")return c;let n=parseInt(c.slice(1),16),r=((n>>16)&255)*k,g=((n>>8)&255)*k,b=(n&255)*k;return`rgb(${r|0},${g|0},${b|0})`}
function move(dt){let f=Math.sin(yaw),g=Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw),speed=5;px+=(rx*sx+f*sy)*speed*dt;pz+=(rz*sx+g*sy)*speed*dt;px=Math.max(.5,Math.min(W-.5,px));pz=Math.max(.5,Math.min(D-.5,pz));let y=surf(Math.floor(px),Math.floor(pz));if(y!=null){let target=y+1.02;if(py>target){vy-=18*dt;py+=vy*dt;if(py<=target){py=target;vy=0;ground=true}}else{py=target;vy=0;ground=true}}}
function ray(){let fx=Math.sin(yaw)*Math.cos(pitch),fy=Math.sin(pitch),fz=Math.cos(yaw)*Math.cos(pitch),x=px,z=pz,y=py+1.5,last=null;for(let d=0;d<6;d+=.1){let a=Math.floor(x),b=Math.floor(y),c=Math.floor(z),t=get(a,b,c);if(t&&t!=="water")return{x:a,y:b,z:c,last};last={x:a,y:b,z:c};x+=fx*.1;y+=fy*.1;z+=fz*.1}return null}
function mine(){let h=ray();if(!h)return msg("Aim at a block");if(h.t==="bedrock")return;world.delete(K(h.x,h.y,h.z));msg("Mined");draw();save()}
function place(){let h=ray();if(!h||!h.last)return msg("Aim at a block");let p=h.last;if(!get(p.x,p.y,p.z)&&p.x>=0&&p.x<W&&p.z>=0&&p.z<D){world.set(K(p.x,p.y,p.z),HOT[sel]);msg("Placed");draw();save()}}
function jump(){if(ground){vy=7;ground=false}}
function save(){try{localStorage.setItem("NikitaCraftsV9",JSON.stringify({seedText,world:[...world],p:[px,py,pz],yaw,pitch,sel}))}catch(e){}}
function load(){try{let d=JSON.parse(localStorage.getItem("NikitaCraftsV9"));if(!d)return false;seedText=d.seedText;seed=SH(seedText);world=new Map(d.world);[px,py,pz]=d.p;yaw=d.yaw||0;pitch=d.pitch||-.18;sel=d.sel||0;return true}catch(e){return false}}
function msg(t){let e=document.getElementById("msg");e.textContent=t;e.style.opacity=1;clearTimeout(msg.t);msg.t=setTimeout(()=>e.style.opacity=0,800)}
function hot(){let e=document.getElementById("hotbar");e.innerHTML="";HOT.forEach((t,i)=>{let s=document.createElement("div");s.className="slot"+(i===sel?" sel":"");s.innerHTML=`<div class="sw" style="background:${COL[t]}"></div><small>${i+1}</small>`;s.onpointerdown=a=>{a.stopPropagation();sel=i;hot()};e.appendChild(s)})}
function controls(){let j=document.getElementById("joy"),k=j.querySelector("i"),active=false,id=null;function up(e){let r=j.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,m=Math.hypot(dx,dy),rad=46;if(m>rad){dx*=rad/m;dy*=rad/m}k.style.transform=`translate(${dx}px,${dy}px)`;sx=dx/rad;sy=-dy/rad}function reset(){active=false;sx=sy=0;k.style.transform="translate(0,0)"}j.onpointerdown=e=>{active=true;id=e.pointerId;j.setPointerCapture(id);up(e)};j.onpointermove=e=>active&&e.pointerId===id&&up(e);j.onpointerup=reset;j.onpointercancel=reset;
 let l=document.getElementById("look"),lid=null,lx=0,ly=0;l.onpointerdown=e=>{lid=e.pointerId;l.setPointerCapture(lid);lx=e.clientX;ly=e.clientY};l.onpointermove=e=>{if(e.pointerId!==lid)return;yaw-=(e.clientX-lx)*.006;pitch=Math.max(-1,Math.min(1,pitch-(e.clientY-ly)*.005));lx=e.clientX;ly=e.clientY};l.onpointerup=()=>lid=null;l.onpointercancel=()=>lid=null;
 document.getElementById("mine").onpointerup=mine;document.getElementById("place").onpointerup=place;document.getElementById("jump").onpointerup=jump;document.getElementById("menuBtn").onclick=()=>{save();hud.hidden=true;menu.style.display="flex";started=false;draw()};hot();
}
function start(){menu.style.display="none";hud.hidden=false;started=true;status.textContent="";draw()}
document.getElementById("new").onclick=()=>{status.textContent="Generating…";setTimeout(()=>{gen(document.getElementById("seed").value.trim()||"Nikita123");start()},20)};
document.getElementById("cont").onclick=()=>{status.textContent="Loading…";setTimeout(()=>{if(!load())gen(document.getElementById("seed").value.trim()||"Nikita123");start()},20)};
addEventListener("resize",()=>{resize();draw()});resize();controls();draw();
function loop(t){let dt=Math.min(.05,(t-last)/1000);last=t;if(started){move(dt);draw()}requestAnimationFrame(loop)}requestAnimationFrame(loop);
})();