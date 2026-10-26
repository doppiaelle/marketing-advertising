(()=>{'use strict';
const $=s=>document.querySelector(s),clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ease=t=>1-Math.pow(1-clamp(t),3);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.body.classList.add('motion-enabled');
// Duration controls each chapter's actual share of the scroll runway.
// Beats map scroll position to demo action progress: fast entrances, legible holds.
const shots=[
 {source:0,label:'Explore opportunities',duration:4,title:'Find your next<br><em>opportunity.</em>',description:'Explore briefs and discover where your skills could make a difference.',titleMode:'rise',beats:[[0,.06],[.24,.3],[.67,.64],[.9,.91],[1,1]]},
 {source:6,label:'Connect and collaborate',duration:4.8,title:'Meet people.<br><em>Build together.</em>',description:'Connect with people and companies. Find the right collaborators for each brief.',titleMode:'center',beats:[[0,0],[.18,.16],[.4,.34],[.56,.54],[.77,.75],[1,1]]},
 {source:1,label:'Pitch your skills',duration:5,title:'Pitch your skills.<br><em>Get noticed.</em>',description:'Show what you can do, apply for a brief and take the next step.',titleMode:'rise',beats:[[0,0],[.2,.12],[.47,.46],[.68,.69],[.88,.82],[1,1]]},
 {source:8,label:'Agree on clear terms',duration:4.8,title:'Clear terms.<br><em>Confident start.</em>',description:'Align on scope and expectations before the work begins.',titleMode:'center',beats:[[0,0],[.3,.33],[.7,.72],[1,1]]},
 {source:2,label:'Deliver your work',duration:5,title:'Make it.<br><em>Deliver it.</em>',description:'Turn the brief into work your client can review and approve.',titleMode:'rise',beats:[[0,0],[.18,.1],[.48,.49],[.73,.74],[.87,.84],[1,1]]},
 {source:5,label:'Get work approved',duration:5.2,title:'Work approved.<br><em>What’s next?</em>',description:'See the outcome confirmed, and bring that experience to your next opportunity.',titleMode:'center',beats:[[0,0],[.25,.3],[.58,.56],[.76,.73],[.92,.91],[1,1]]},
 {source:null,label:'Create your account',duration:3.5,closing:true}
];
const total=shots.reduce((n,s)=>n+s.duration,0),starts=shots.map((s,i)=>shots.slice(0,i).reduce((a,b)=>a+b.duration,0));
const contentSources=new Set(shots.filter(s=>!s.closing).map(s=>s.source));
let elapsed=0,index=-1,local=0,last=0,destroyed=false,ready=false,mobile=false,scale=1,frameHandle,lastSent=-Infinity,visible=true,targetElapsed=0,lastRendered=-1;
const cleanup=[],frames=[],bounds=new Map(),nodes=[],frameScenes=new Map();
let requestedSource=0,lastAction=-1;
let chapterStart=performance.now(),gestureUntil=0,pendingDirection=0,touchStart=null;
let flightFrom={x:0,y:0},flightTo={x:0,y:0},flightCurve=null;
const flyer=$('#rocket-guide'),trail=$('#flight-trace'),flightPath=$('#flight-path');
const targets=[[.12,.75],[.84,.15],[.12,.2],[.88,.78],[.13,.78],[.85,.20]];
// Exactly two documents are reused for every chapter; hidden chapters have no apps.
const composition=document.createElement('div');composition.className='composition';
composition.innerHTML='<div class="fragment secondary" aria-hidden="true"></div><div class="fragment primary" aria-hidden="true"></div>';
$('#canvas').insertBefore(composition,$('.cursor'));
for(const role of ['primary','secondary']){
 const f=document.createElement('iframe');f.title='Brief2Done illustrative '+role+' screen';f.tabIndex=-1;f.setAttribute('aria-hidden','true');
 f.src='../assets/brief2done/frame.html?scene=0&v=20261026-guided';
 f.addEventListener('load',()=>{f.contentWindow?.postMessage({type:'brief2done:scene',scene:requestedSource},location.origin);f.contentWindow?.postMessage({type:'brief2done:visibility',visible:!shots[index]?.closing},location.origin);});
 composition.querySelector('.'+role).appendChild(f);frames.push(f);
}
function screensReady(){return !shots[index]?.closing&&frames.every(f=>frameScenes.get(f.contentWindow)===shots[index]?.source);}
function switchScreens(source){requestedSource=source;frameScenes.clear();lastAction=-1;lastSent=-Infinity;for(const f of frames)f.contentWindow?.postMessage({type:'brief2done:scene',scene:source},location.origin);}

shots.forEach((shot,i)=>{
 if(shot.closing){nodes.push({el:null,pair:[]});return;}
 const el=document.createElement('section');el.className='scene';el.dataset.index=i;el.dataset.titleMode=shot.titleMode;el.setAttribute('aria-hidden','true');
 el.innerHTML='<div class="scene-eyebrow">STEP '+String(i+1).padStart(2,'0')+' / 06</div><div class="headline-mask"><'+(i===0?'h1':'h2')+' class="headline">'+shot.title+'</'+(i===0?'h1':'h2')+'></div><p class="scene-explainer">'+shot.description+'</p><div class="intertitle" aria-hidden="true"><div>'+shot.title+'</div></div>';
 $('#scenes').appendChild(el);
 nodes.push({el,primary:composition.querySelector('.primary'),secondary:composition.querySelector('.secondary'),headline:el.querySelector('.headline'),explainer:el.querySelector('.scene-explainer'),intertitle:el.querySelector('.intertitle'),composition,pair:frames});
});
function listen(el,event,fn,options){el.addEventListener(event,fn,options);cleanup.push(()=>el.removeEventListener(event,fn,options));}
function fromFrame(e){return frames.some(f=>f.contentWindow===e.source);}
listen(window,'message',e=>{
 if(e.data?.type==='brief2done:ready'&&fromFrame(e)){
  if(!contentSources.has(e.data.scene)||!e.data.primary)return;
  bounds.set(e.data.scene,e.data);frameScenes.set(e.source,e.data.scene);
  if(!ready&&frames.every(f=>frameScenes.has(f.contentWindow))){ready=true;chapterStart=performance.now();$('#loading').classList.add('hidden');$('#loading').setAttribute('aria-hidden','true');document.body.classList.remove('motion-failed');}
  if(screensReady()){
   compose(index,local);paintTitle(nodes[index],local,shots[index].titleMode);sendProgress();
  }
  return;
 }
 if(window.parent!==window&&e.source===window.parent){
  if(e.data?.type==='brief2done:set-progress')setProgress(e.data.progress);
  
  
  if(e.data?.type==='brief2done:go-to')goTo(e.data.scene);
 }
});
const timeout=setTimeout(()=>{if(!ready){document.body.classList.add('motion-failed');$('#loading').classList.add('hidden');}},20000);cleanup.push(()=>clearTimeout(timeout));
function resize(){mobile=$('.screen-wrap').clientWidth<730;const w=mobile?640:1280,h=mobile?940:760,area=$('.screen-wrap');scale=Math.min(area.clientWidth/w,(area.clientHeight||innerHeight)/h);$('#canvas').classList.toggle('mobile',mobile);$('#canvas').style.transform='scale('+scale+')';$('#canvas').style.left=((area.clientWidth-w*scale)/2)+'px';$('#canvas').style.top=(((area.clientHeight||innerHeight)-h*scale)/2)+'px';if(index>=0&&!shots[index].closing)compose(index,local);}
const ro=new ResizeObserver(resize);ro.observe($('.screen-wrap'));resize();
function paintTitle(n,t,titleMode){
 const arrival=reduced.matches?1:ease(t/.19);
 const center=titleMode==='center'&&!reduced.matches;
 const topArrival=reduced.matches?1:ease((t-(center?.14:0))/.18);
 n.headline.style.transform='translateY('+((1-topArrival)*195)+'px)';
 n.headline.style.opacity=String(topArrival);
 n.explainer.style.opacity=String(reduced.matches?1:ease((t-.16)/.15));
 n.explainer.style.transform='translateY('+((1-ease((t-.16)/.15))*20)+'px)';
 const splash=center?arrival*(1-ease((t-.16)/.15)):0;
 n.intertitle.style.opacity=String(splash);
 n.intertitle.style.transform='scale('+(.88+.12*arrival)+')';
 n.intertitle.style.filter='blur('+((1-arrival)*7)+'px)';
 n.composition.style.opacity=String(screensReady()?(reduced.matches?1:ease((t-(center?.14:.04))/.18)):0);
}
function crop(el,box){if(!box)return false;const b={...box};b.w=Math.min(1440,b.w);b.h=Math.min(1000,b.h);el.style.width=b.w+'px';el.style.height=b.h+'px';const f=el.querySelector('iframe');f.style.left=-b.x+'px';f.style.top=-b.y+'px';return true;}
function pose(el,x,y,s,r,extra=0){el.style.transform=`translate3d(${x}px,${y}px,0) rotate(${reduced.matches?0:r}deg) scale(${s})`;el.style.opacity=String(extra?0:1);}
function compose(i,t){const n=nodes[i],data=bounds.get(shots[i].source);if(!data)return;const source=shots[i].source;
 let p=data.primary,s=data.secondary;
 if(source===0||source===6){[p,s]=[data.secondary,data.primary];if(s)s={...s,h:source===0?560:600};}
 if(source===9&&p)p={...p,y:p.y+90,h:510};
 if(!p)p=data.primary;
 crop(n.primary,p);crop(n.secondary,s);
 const settle=ease((t-.07)/.28),reframe=ease((t-.78)/.18);
 const blend=(a,b,c)=>reduced.matches?b:a+(b-a)*settle+(c-b)*reframe;
 let x,y,z,r,sx,sy,sz,sr;
 const punch=reduced.matches?1:1+.06*settle+.04*reframe;
 if(mobile){
  z=Math.min(1.34,510/p.w,510/p.h)*punch;x=(640-p.w*z)/2+blend(9,9,-9);y=362+blend(24,0,0);r=blend(3,-2,1);
  sx=30;sy=435;sz=s?Math.min(540/s.w,390/s.h):.5;sr=-5;
  if(source===4){z=.71;x=45;y=402;sx=50;sy=760;sz=s?Math.min(530/s.w,180/s.h):.7;sr=2;}
  if(source===0||source===6){z=Math.min(1.38,460/p.w);x=(640-p.w*z)/2;y=465;sy=360;sz=.49;}
  if(source===5){y=350;z=Math.min(1.3,510/p.h);x=(640-p.w*z)/2;sy=750;sz=.48;}
 }else{
  if(source===0||source===6){z=1.13*punch;x=720-blend(0,0,30);y=349+blend(25,0,0);r=blend(6,2,-2);sx=65;sy=282;sz=.75;sr=-2.6;}
  else if(source===9){z=.83*punch;x=424;y=250;r=blend(-5,2,-1);sx=60;sy=415;sz=1.05;sr=-4;}
  else if(source===1){z=Math.min(.84,455/p.h)*punch;x=770;y=242;r=blend(6,-2,1);sx=265;sy=390;sz=1.12;sr=-5;}
  else if(source===8){z=.69*punch;x=440;y=252;r=blend(-4,1.5,-1);sx=95;sy=535;sz=.88;sr=-4;}
  else if(source===2){z=Math.min(.86,460/p.h)*punch;x=425;y=255;r=blend(5,-2,1);sx=90;sy=390;sz=.86;sr=-5;}
  else if(source===4){z=.9*punch;x=390;y=290;r=blend(-5,0,2);sx=120;sy=575;sz=.64;sr=-3;}
  else{z=Math.min(1.2,475/p.h)*punch;x=720;y=244;r=blend(6,-2,0);sx=100;sy=415;sz=.74;sr=-4;}
 }
 // Whip in, settle, then a second hard framing. Screens keep their own typography and layout.
 z=Math.min(z,((mobile?895:700)-y)/p.h);
 const arrival=reduced.matches?0:1-ease(t/.14);
 pose(n.primary,x+arrival*135-reframe*12,y+arrival*60,z*(1+arrival*.15),r+arrival*9-reframe*2);
 n.primary.style.opacity=String(1-arrival);
 if(s){pose(n.secondary,sx,sy,sz,sr);n.secondary.style.visibility='visible';}else n.secondary.style.visibility='hidden';
 const c=$('.cursor');let cx=x+p.w*z*.71,cy=y+p.h*z*.65;
 if(data.focus&&source===1){cx=x+(data.focus.x-p.x+data.focus.w*.7)*z;cy=y+(data.focus.y-p.y+data.focus.h*.65)*z;}
 if(source===5){cx=x+p.w*z*.6;cy=y+p.h*z*.57;}
 if(source===2){cx=x+p.w*z*.16;cy=y+p.h*z*.87;}
 c.style.transform=`translate(${cx}px,${cy}px) rotate(-8deg)`;c.classList.toggle('visible',!reduced.matches&&t>.18&&t<.8&&[1,2,5].includes(source));
 const clickAt=source===1?.72:source===2?.73:.58,action=actionProgress(shots[i],t);c.classList.toggle('click',action>clickAt&&action<clickAt+.11);
}
function actionProgress(shot,t){if(reduced.matches)return .9;const beats=shot.beats;for(let j=1;j<beats.length;j++){const [x,y]=beats[j], [px,py]=beats[j-1];if(t<=x)return py+(y-py)*clamp((t-px)/(x-px));}return 1;}
function sendProgress(){
 if(!screensReady())return;
 const now=performance.now(),action=actionProgress(shots[index],local);
 if(now-lastSent<50||Math.abs(action-lastAction)<.001)return;
 for(const f of frames)f.contentWindow?.postMessage({type:'brief2done:frame',progress:action},location.origin);
 lastSent=now;lastAction=action;
}
function changeScene(next){
 if(index===next)return;
 if(index>=0&&nodes[index].el){
  nodes[index].el.classList.remove('active');
  nodes[index].el.setAttribute('aria-hidden','true');
 }
 index=next;
 const closing=!!shots[index].closing;
 if(!closing)switchScreens(shots[index].source);
 for(const f of frames)f.contentWindow?.postMessage({type:'brief2done:visibility',visible:!closing},location.origin);
 if(closing){$('#loading').classList.add('hidden');$('#loading').setAttribute('aria-hidden','true');}
 if(nodes[index].el){
  nodes[index].el.classList.add('active');nodes[index].el.setAttribute('aria-hidden','false');
 }
 $('#experience').classList.toggle('is-closing',closing);
 $('#closing').setAttribute('aria-hidden',String(!closing));
 $('#closing').inert=!closing;
 $('#announcement').textContent=closing?'Create your Brief2Done account.':shots[index].label;
 $('.slip').classList.remove('on');
 if(!closing&&!reduced.matches)requestAnimationFrame(()=>$('.slip').classList.add('on'));
 $('#story-prev').disabled=index===0;
 $('#story-next-label').textContent=index===shots.length-2?'Get started':'Next';
 $('#story-step-counter').textContent=String(Math.min(index+1,6)).padStart(2,'0')+' / 06';
 $('#story-step-name').textContent=shots[index].label;
 $('#story-step-progress').style.transform='scaleX('+Math.min(1,(index+1)/6)+')';
 $('#story-hint').textContent=index===0?'Scroll to begin · One step at a time':'Scroll to continue · Or use the arrows';
 const detail={scene:index,closing};
 window.dispatchEvent(new CustomEvent('brief2done:scene-change',{detail}));
 if(window.parent!==window)window.parent.postMessage({type:'brief2done:scene-change',...detail},'*');
}
function render(){
 if(index<0)return;
 if(shots[index].closing){
  const enter=reduced.matches?1:ease(local/.24);
  $('#closing').style.opacity=String(enter);
  $('#closing').style.transform='scale('+(1.04-.04*enter)+')';
  $('.cursor').classList.remove('visible');
  const arrival=reduced.matches?1:ease((local-.06)/.38);
  const card=$('.closing-card');
  card.style.opacity=String(arrival);
  card.style.transform='translate3d(0,'+((1-arrival)*Math.min(innerHeight*.62,520))+'px,0) scale('+(.94+.06*arrival)+')';
  $('#closing').inert=arrival<.85;
  $('.closing-brand-icon').style.opacity=String(reduced.matches?1:.32+.68*ease((local-.7)/.25));
 }else{
  paintTitle(nodes[index],local,shots[index].titleMode);
  sendProgress();
  compose(index,local);
 }
 updateFlight(local);
}
function cubic(a,b,c,d,t){
 const u=1-t;
 return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d;
}
function flightAnchor(){
 const wrap=$('.screen-wrap').getBoundingClientRect(),img=$('.story-brand-icon').getBoundingClientRect();
 return{x:img.left-wrap.left+img.width*.77,y:img.top-wrap.top+img.height*.3};
}
function flightDestination(i,w,h){
 if(i===shots.length-1){
  const wrap=$('.screen-wrap').getBoundingClientRect();
  const logo=$('.closing-brand-icon').getBoundingClientRect();
  return{x:logo.left-wrap.left+logo.width*.78,y:logo.top-wrap.top+logo.height*.31};
 }
 return{x:targets[i][0]*w,y:targets[i][1]*h};
}
function updateFlight(t){
 if(index<0)return;
 if(reduced.matches){flyer.style.opacity='0';trail.style.opacity='0';return;}
 const wrap=$('.screen-wrap');
 const w=wrap.clientWidth,h=wrap.clientHeight;
 const from=index===0?flightAnchor():flightDestination(index-1,w,h);
 const to=flightDestination(index,w,h);
 const closing=!!shots[index].closing;
 const outerY=(index%2===0?.11:.88)*h;
 const dx=to.x-from.x;
 const c1={x:from.x+dx*.2,y:closing?from.y-.15*h:outerY};
 const c2={x:to.x-dx*.2,y:closing?to.y-.18*h:outerY};
 const durationRatio=closing?clamp((t-.05)/.88):clamp((t-.025)/.84);
 const move=ease(durationRatio);
 const pos=u=>({x:cubic(from.x,c1.x,c2.x,to.x,u),y:cubic(from.y,c1.y,c2.y,to.y,u)});
 const p=pos(move),a=pos(Math.max(0,move-.015)),b=pos(Math.min(1,move+.015));
 const angle=closing?45*(1-ease((t-.65)/.27)):Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI+45;
 const landingScale=closing?1-.61*ease((t-.42)/.48):.92+.08*ease(t/.24);
 const launchScale=index===0?.19+.81*ease(t/.26):1;
 const scale=landingScale*launchScale;
 const rx=flyer.offsetWidth/2,ry=flyer.offsetHeight/2;
 flyer.style.transform='translate3d('+(p.x-rx)+'px,'+(p.y-ry)+'px,0) rotate('+angle+'deg) scale('+scale+')';
 flyer.style.opacity=String(closing?1-ease((t-.84)/.14):1);
 trail.setAttribute('viewBox','0 0 '+w+' '+h);
 const d='M '+from.x+' '+from.y+' C '+c1.x+' '+c1.y+', '+c2.x+' '+c2.y+', '+to.x+' '+to.y;
 if(flightPath.getAttribute('d')!==d)flightPath.setAttribute('d',d);
 const len=flightPath.getTotalLength();
 flightPath.style.strokeDasharray=Math.max(0,move*len)+' '+(len+10);
 flightPath.style.strokeDashoffset='0';
 trail.style.opacity=String(closing?.36:.62);
}
function goTo(i){
 i=clamp(Math.floor(Number(i)||0),0,shots.length-1);
 if(index!==i)changeScene(i);
 local=0;
 chapterStart=performance.now();
 pendingDirection=0;
 render();
}
function requestStep(dir,force=false){
 if(!ready)return;
 const now=performance.now();
 if(!force&&now<gestureUntil)return;
 gestureUntil=now+620;
 if(index===0&&dir<0)return;
 if(index===shots.length-1&&dir>0)return;
 // One step per gesture; an early flick queues exactly one step rather than skipping chapters.
 if(!force&&local<.46){pendingDirection=dir;return;}
 goTo(index+dir);
}
// The stage is one viewport tall. Wheel and touch gestures advance one chapter
// at a time; there is no multi-viewport dead zone before the first transition.
// The rest of the page still scrolls normally at the first/last boundary.
function inStage(){
 const r=$('#experience').getBoundingClientRect();
 return r.top<=2&&r.bottom>=innerHeight*.72;
}
function onWheel(e){
 if(!inStage()||e.ctrlKey||Math.abs(e.deltaY)<3)return;
 const dir=e.deltaY>0?1:-1;
 if((index===0&&dir<0)||(index===shots.length-1&&dir>0))return;
 e.preventDefault();
 requestStep(dir);
}
function onTouchStart(e){
 if(!inStage()||e.touches.length!==1||e.target.closest('a,button')){touchStart=null;return;}
 touchStart={y:e.touches[0].clientY,x:e.touches[0].clientX};
}
function onTouchMove(e){
 if(!touchStart||!inStage()||!e.cancelable)return;
 const dy=touchStart.y-e.touches[0].clientY;
 if((index===0&&dy<0)||(index===shots.length-1&&dy>0))return;
 e.preventDefault();
}
function onTouchEnd(e){
 if(!touchStart||!e.changedTouches.length)return;
 const dy=touchStart.y-e.changedTouches[0].clientY;
 const dx=touchStart.x-e.changedTouches[0].clientX;
 touchStart=null;
 if(Math.abs(dy)>42&&Math.abs(dy)>Math.abs(dx)*1.1)requestStep(dy>0?1:-1);
}
function tick(now){
 if(destroyed)return;
 if(!document.hidden&&visible){
  if(ready){
   local=clamp((now-chapterStart)/(shots[index].duration*1000));
   if(pendingDirection&&local>=.46){
    const dir=pendingDirection;pendingDirection=0;goTo(index+dir);
   }
  }else local=0;
  render();
 }
 frameHandle=requestAnimationFrame(tick);
}
function setProgress(progress){
 const e=clamp(Number(progress)||0)*total;
 let next=shots.length-1;
 for(let i=0;i<shots.length;i++)if(e<starts[i]+shots[i].duration){next=i;break;}
 changeScene(next);
 local=clamp((e-starts[next])/shots[next].duration);
 chapterStart=performance.now()-local*shots[next].duration*1000;
 render();
}
listen(window,'wheel',onWheel,{passive:false});
listen($('.screen-wrap'),'touchstart',onTouchStart,{passive:true});
listen($('.screen-wrap'),'touchmove',onTouchMove,{passive:false});
listen($('.screen-wrap'),'touchend',onTouchEnd,{passive:true});
listen(window,'resize',()=>{resize();updateFlight(local);});
listen(reduced,'change',()=>{render();});
listen($('#story-prev'),'click',()=>requestStep(-1,true));
listen($('#story-next'),'click',()=>requestStep(1,true));
for(const link of document.querySelectorAll('a[href="#closing"]'))listen(link,'click',e=>{
 if(document.body.classList.contains('motion-failed')){e.preventDefault();$('.fallback .launch-button').focus();return;}
 e.preventDefault();goTo(shots.length-1);$('.closing-card .launch-button').focus({preventScroll:true});
});
listen(document,'keydown',e=>{
 if(!inStage()||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('a,button,input,textarea,select,[contenteditable]'))return;
 const forward=['ArrowDown','ArrowRight','PageDown',' '];
 const backward=['ArrowUp','ArrowLeft','PageUp'];
 if(forward.includes(e.key)&&index<shots.length-1){e.preventDefault();requestStep(1,true);}
 if(backward.includes(e.key)&&index>0){e.preventDefault();requestStep(-1,true);}
});
const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;},{threshold:.02});
observer.observe($('.screen-wrap'));
changeScene(0);
local=0;
render();
frameHandle=requestAnimationFrame(tick);

window.Brief2DoneMotion=Object.freeze({
 setProgress,goTo,
 getState:()=>({mode:'guided-scroll',progress:(starts[index]+shots[index].duration*local)/total,scene:index,closing:!!shots[index]?.closing,ready,duration:total}),
 destroy(){destroyed=true;cancelAnimationFrame(frameHandle);cleanup.forEach(fn=>fn());ro.disconnect();observer.disconnect();frames.forEach(f=>f.remove());}
});

})();
