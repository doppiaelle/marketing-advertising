(()=>{'use strict';
const $=s=>document.querySelector(s),clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ease=t=>1-Math.pow(1-clamp(t),3);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.body.classList.add('motion-enabled');
// Duration controls each chapter's actual share of the scroll runway.
// Beats map scroll position to demo action progress: fast entrances, legible holds.
const shots=[
 {source:0,label:'Explore',duration:3.2,title:'Find your<br><em>next possibility.</em>',titleMode:'rise',beats:[[0,.25],[.24,.3],[.72,.72],[1,1]]},
 {source:6,label:'Connect',duration:4.6,title:'People. Companies.<br><em>Connected.</em>',titleMode:'center',beats:[[0,0],[.13,.16],[.32,.31],[.4,.37],[.62,.64],[.71,.7],[.94,.91],[1,1]]},
 {source:9,label:'Team up',duration:2.7,title:'One brief.<br><em>Many talents.</em>',titleMode:'rise',beats:[[0,0],[.22,.36],[.78,.72],[1,1]]},
 {source:1,label:'Apply',duration:4.2,title:'Your skills.<br><em>In motion.</em>',titleMode:'rise',beats:[[0,0],[.16,.12],[.48,.49],[.66,.7],[.78,.75],[1,1]]},
 {source:8,label:'Agree',duration:3.6,title:'Clear terms.<br><em>Shared direction.</em>',titleMode:'center',beats:[[0,0],[.3,.35],[.82,.76],[1,1]]},
 {source:2,label:'Deliver',duration:3.8,title:'Create.<br><em>Deliver.</em>',titleMode:'rise',beats:[[0,0],[.15,.08],[.46,.47],[.7,.7],[.8,.76],[1,1]]},
 {source:4,label:'Approve',duration:2.8,title:'Good work.<br><em>Recognised.</em>',titleMode:'rise',beats:[[0,0],[.22,.36],[.8,.76],[1,1]]},
 {source:5,label:'Confirm',duration:4,title:'Confirmed.<br><em>On to what’s next.</em>',titleMode:'center',beats:[[0,0],[.26,.33],[.58,.56],[.7,.64],[.94,.91],[1,1]]},
 {source:null,label:'Your next move',duration:4.8,closing:true}
];
const total=shots.reduce((n,s)=>n+s.duration,0),starts=shots.map((s,i)=>shots.slice(0,i).reduce((a,b)=>a+b.duration,0));
const contentSources=new Set(shots.filter(s=>!s.closing).map(s=>s.source));
let elapsed=0,index=-1,local=0,last=0,destroyed=false,ready=false,mobile=false,scale=1,frameHandle,lastSent=-Infinity,visible=true,targetElapsed=0,lastRendered=-1;
const cleanup=[],frames=[],bounds=new Map(),nodes=[],frameScenes=new Map();
let requestedSource=0,lastAction=-1;
// Exactly two documents are reused for every chapter; hidden chapters have no apps.
const composition=document.createElement('div');composition.className='composition';
composition.innerHTML='<div class="fragment secondary" aria-hidden="true"></div><div class="fragment primary" aria-hidden="true"></div>';
$('#canvas').insertBefore(composition,$('.cursor'));
for(const role of ['primary','secondary']){
 const f=document.createElement('iframe');f.title='Brief2Done illustrative '+role+' screen';f.tabIndex=-1;f.setAttribute('aria-hidden','true');
 f.src='../assets/brief2done/frame.html?scene=0&v=20261024-mobile-2';
 f.addEventListener('load',()=>{f.contentWindow?.postMessage({type:'brief2done:scene',scene:requestedSource},location.origin);f.contentWindow?.postMessage({type:'brief2done:visibility',visible:!shots[index]?.closing},location.origin);});
 composition.querySelector('.'+role).appendChild(f);frames.push(f);
}
function screensReady(){return !shots[index]?.closing&&frames.every(f=>frameScenes.get(f.contentWindow)===shots[index]?.source);}
function switchScreens(source){requestedSource=source;frameScenes.clear();lastAction=-1;lastSent=-Infinity;for(const f of frames)f.contentWindow?.postMessage({type:'brief2done:scene',scene:source},location.origin);}

shots.forEach((shot,i)=>{
 if(shot.closing){nodes.push({el:null,pair:[]});return;}
 const el=document.createElement('section');el.className='scene';el.dataset.index=i;el.dataset.titleMode=shot.titleMode;el.setAttribute('aria-hidden','true');
 el.innerHTML='<div class="headline-mask"><'+(i===0?'h1':'h2')+' class="headline">'+shot.title+'</'+(i===0?'h1':'h2')+'></div><div class="intertitle" aria-hidden="true"><div>'+shot.title+'</div></div>';
 $('#scenes').appendChild(el);
 nodes.push({el,primary:composition.querySelector('.primary'),secondary:composition.querySelector('.secondary'),headline:el.querySelector('.headline'),intertitle:el.querySelector('.intertitle'),composition,pair:frames});
});
function listen(el,event,fn,options){el.addEventListener(event,fn,options);cleanup.push(()=>el.removeEventListener(event,fn,options));}
function fromFrame(e){return frames.some(f=>f.contentWindow===e.source);}
listen(window,'message',e=>{
 if(e.data?.type==='brief2done:ready'&&fromFrame(e)){
  if(!contentSources.has(e.data.scene)||!e.data.primary)return;
  bounds.set(e.data.scene,e.data);frameScenes.set(e.source,e.data.scene);
  if(!ready&&frames.every(f=>frameScenes.has(f.contentWindow))){ready=true;$('#loading').classList.add('hidden');$('#loading').setAttribute('aria-hidden','true');document.body.classList.remove('motion-failed');}
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
 if(index===0)t=Math.max(.25,t);
 const incoming=reduced.matches?1:ease(t/(titleMode==='center'?.24:.2));
 const rise=reduced.matches?1:ease((t-(titleMode==='center'?.18:0))/.2);
 const outgoing=reduced.matches?1:1-clamp((t-.94)/.06);
 n.headline.style.transform='translateY('+((1-rise)*195)+'px)';n.headline.style.opacity=String(rise*outgoing*(titleMode==='center'&&!reduced.matches?ease((t-.29)/.12):1));
 const pop=titleMode==='center'&&!reduced.matches?incoming*(1-ease((t-.19)/.14)):0;
 n.intertitle.style.opacity=String(pop);n.intertitle.style.transform='scale('+(.82+.18*incoming)+')';n.intertitle.style.filter='blur('+((1-incoming)*8)+'px)';
 n.composition.style.opacity=String(screensReady()?(titleMode==='center'&&!reduced.matches?ease((t-.19)/.18):incoming):0);
}
function crop(el,box){if(!box)return false;const b={...box};b.w=Math.min(1440,b.w);b.h=Math.min(1000,b.h);el.style.width=b.w+'px';el.style.height=b.h+'px';const f=el.querySelector('iframe');f.style.left=-b.x+'px';f.style.top=-b.y+'px';return true;}
function pose(el,x,y,s,r,extra=0){el.style.transform=`translate3d(${x}px,${y}px,0) rotate(${reduced.matches?0:r}deg) scale(${s})`;el.style.opacity=String(extra?0:1);}
function compose(i,t){if(i===0)t=Math.max(.25,t);const n=nodes[i],data=bounds.get(shots[i].source);if(!data)return;const source=shots[i].source;
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
function render(){const e=clamp(elapsed,0,total-.00001);let next=0;for(let i=0;i<shots.length;i++)if(e>=starts[i])next=i;local=elapsed>=total?1:clamp((e-starts[next])/shots[next].duration);
 if(index!==next){
  if(index>=0&&nodes[index].el){nodes[index].el.classList.remove('active');nodes[index].el.setAttribute('aria-hidden','true');}
  index=next;const closing=!!shots[index].closing;
  if(!closing)switchScreens(shots[index].source);
  for(const f of frames)f.contentWindow?.postMessage({type:'brief2done:visibility',visible:!closing},location.origin);
  if(closing){$('#loading').classList.add('hidden');$('#loading').setAttribute('aria-hidden','true');}

  if(nodes[index].el){nodes[index].el.classList.add('active');nodes[index].el.setAttribute('aria-hidden','false');}
  $('#experience').classList.toggle('is-closing',closing);$('#closing').setAttribute('aria-hidden',String(!closing));$('#closing').inert=!closing;$('#announcement').textContent=closing?'Your next connection. Open Brief2Done.':shots[index].label;
  $('.slip').classList.remove('on');if(!closing&&!reduced.matches)requestAnimationFrame(()=>$('.slip').classList.add('on'));
  const detail={scene:index,closing};window.dispatchEvent(new CustomEvent('brief2done:scene-change',{detail}));
  if(window.parent!==window)window.parent.postMessage({type:'brief2done:scene-change',...detail},'*');
 }
 if(shots[index].closing){const enter=reduced.matches?1:ease(local/.26);$('#closing').style.opacity=String(enter);$('#closing').style.transform='scale('+(1.04-.04*enter)+')';$('.cursor').classList.remove('visible');
  const arrival=reduced.matches?1:ease((local-.07)/.46);const card=$('.closing-card');card.style.opacity=String(arrival);card.style.transform='translate3d(0,'+((1-arrival)*Math.min(innerHeight*.62,520))+'px,0) scale('+(.94+.06*arrival)+')';$('#closing').inert=arrival<.85;
 }
 else{paintTitle(nodes[index],local,shots[index].titleMode);sendProgress();compose(index,local);}
}
// Native wheel/touch/keyboard scrolling stays in charge. A short visual catch-up
// removes wheel stepping without intercepting input or adding a second scroll container.
function tick(now){if(destroyed)return;const dt=last?Math.min((now-last)/1000,.1):0;last=now;
 if(!document.hidden&&visible){
  const delta=targetElapsed-elapsed;
  // Fast flings jump directly to their destination, without rendering every skipped app state.
  elapsed=reduced.matches||Math.abs(delta)>2||Math.abs(delta)<.001?targetElapsed:elapsed+delta*(1-Math.exp(-dt/0.075));
  if(Math.abs(elapsed-lastRendered)>.0001){render();lastRendered=elapsed;}
  else sendProgress();
 }
 frameHandle=requestAnimationFrame(tick);
}
function setProgress(progress){targetElapsed=clamp(Number(progress)||0)*total;elapsed=targetElapsed;render();}
function storyRange(){const el=$('#experience');return{top:el.getBoundingClientRect().top+scrollY,range:Math.max(1,el.offsetHeight-$('.shell').clientHeight)};}
function goTo(i){i=clamp(Math.floor(Number(i)||0),0,shots.length-1);const target=starts[i]+shots[i].duration*(shots[i].closing?.72:.2),r=storyRange();window.scrollTo({top:r.top+r.range*target/total,behavior:'instant'});onScroll();}
function onScroll(){const r=storyRange();targetElapsed=clamp((scrollY-r.top)/r.range)*total;}
let runwayWidth=0;
function sizeRunway(){const width=document.documentElement.clientWidth;if(runwayWidth===width)return;runwayWidth=width;const h=$('.shell').clientHeight;const pxPerBeat=reduced.matches?h/3.5:Math.max(160,Math.min(280,h*.32));$('#experience').style.setProperty('--story-height',(h+total*pxPerBeat)+'px');onScroll();}
listen(window,'resize',()=>{resize();sizeRunway();});listen(window,'scroll',onScroll,{passive:true});
listen(reduced,'change',()=>{sizeRunway();onScroll();elapsed=targetElapsed;render();});
for(const link of document.querySelectorAll('a[href="#closing"]'))listen(link,'click',e=>{if(document.body.classList.contains('motion-failed')){e.preventDefault();$('.fallback .launch-button').focus();return;}e.preventDefault();goTo(shots.length-1);elapsed=targetElapsed;render();$('.launch-button').focus({preventScroll:true});});
listen(document,'keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.target.closest('a,button,input,textarea,select,[contenteditable]'))return;if(e.key==='ArrowRight'){e.preventDefault();goTo(index+1);}if(e.key==='ArrowLeft'){e.preventDefault();goTo(index-1);}});
const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(!visible)last=0;},{threshold:.02});observer.observe($('.screen-wrap'));
window.Brief2DoneMotion=Object.freeze({setProgress,goTo,getState:()=>({mode:'scroll',progress:elapsed/total,scene:index,closing:!!shots[index]?.closing,ready,duration:total}),destroy(){destroyed=true;cancelAnimationFrame(frameHandle);cleanup.forEach(fn=>fn());ro.disconnect();observer.disconnect();frames.forEach(f=>f.remove());}});
$('#experience').classList.add('is-scroll');sizeRunway();onScroll();elapsed=targetElapsed;render();frameHandle=requestAnimationFrame(tick);
})();
