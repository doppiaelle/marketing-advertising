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
let chapterStart=performance.now(),gestureUntil=0,pendingDirection=0,touchStart=null,lastWheelAt=0;
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
  if(!ready&&frames.every(f=>frameScenes.has(f.contentWindow))){ready=true;chapterStart=performance.now();$('#loading').classList.add('hidden');
   $('#loading').setAttribute('aria-hidden','true');document.body.classList.remove('motion-failed');}
  if(screensReady()){
   compose(index,.68);paintTitle(nodes[index],1,shots[index].titleMode);sendProgress();
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
// A real vertical visual rail contains all six already-laid-out story scenes.
// The rail (rather than a simulated camera) moves UP behind a center-flight rocket.
const sceneRail=$('#scenes');
const sceneDesignHeight=()=>mobile?940:760;
function layoutRail(){
 const h=sceneDesignHeight();
 sceneRail.style.height=(chapterCount*h)+'px';
 nodes.forEach((n,i)=>{
  if(!n.el)return;
  n.el.style.top=(i*h)+'px';
  n.el.style.bottom='auto';
  n.el.style.height=h+'px';
  n.headline.style.opacity='1';n.headline.style.transform='translateY(0)';
  n.explainer.style.opacity='1';n.explainer.style.transform='none';
  n.intertitle.style.opacity='0';
 });
}
layoutRail();
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
// Native scroll position and chapter are one source of truth. The stage remains
// sticky over the entire six-chapter journey (and its closing landing).
// Dragging the scrollbar scrubs the same flight instead of cutting off the stage.
const chapterCount=shots.length-1;
let scrollFrame=null,scrollAnim=null,previousFlightProgress=0,flightDirection=1,mirrorMix=0,lastFlightFrame=0;
let chapterStartedAt=performance.now(),storyHeight=0,stageH=0;
let finalUnlocked=false;
const smoother=t=>{t=clamp(t);return t*t*(3-2*t);};
const screen=$('.screen-wrap');
const logo=$('.closing-brand-icon');
const tip=$('#rocket-guide');
const trailSvg=$('#flight-trace'),trailPath=$('#flight-path'),trailGradient=$('#rocket-trail-gradient');

function storyTop(){
 return $('#experience').getBoundingClientRect().top+window.scrollY;
}
function scrollProgress(){
 const h=stageH||Math.max(1,screen.clientHeight);
 return clamp((window.scrollY-storyTop())/h,0,chapterCount);
}
function inStage(){
 if(document.body.classList.contains('motion-failed'))return false;
 const b=$('#experience').getBoundingClientRect();
 return b.top<=2&&b.bottom>=screen.clientHeight-3;
}
function sizeRunway(){
 const height=Math.max(1,screen.clientHeight);
 if(stageH!==height){
  const ratio=stageH?scrollProgress()/chapterCount:0;
  stageH=height;
  storyHeight=stageH*(chapterCount+1);
  $('#experience').style.setProperty('--journey-height',storyHeight+'px');
  // A resize must preserve the chapter even when mobile browser chrome changes.
  if(ratio>0&&inStage())window.scrollTo({top:storyTop()+ratio*chapterCount*stageH,behavior:'instant'});
  pathSize='';
 }
}
function chapterFor(p){return clamp(Math.round(p),0,chapterCount);}
function activate(next){
 next=clamp(next,0,chapterCount);
 if(index===next)return;
 if(index>=0&&nodes[index].el){
  nodes[index].el.classList.remove('active');
  nodes[index].el.setAttribute('aria-hidden','true');
 }
 index=next;
 local=0;
 chapterStartedAt=performance.now();
 const closing=!!shots[index].closing;
 if(!closing)switchScreens(shots[index].source);
 for(const f of frames)f.contentWindow?.postMessage({type:'brief2done:visibility',visible:!closing},location.origin);
 if(closing){
  $('#loading').classList.add('hidden');
  $('#loading').setAttribute('aria-hidden','true');
 }
 if(nodes[index].el){
  nodes[index].el.classList.add('active');
  nodes[index].el.setAttribute('aria-hidden','false');
 }
 $('#experience').classList.toggle('is-closing',closing);
 $('#experience').classList.remove('rocket-docked');
 $('#closing').setAttribute('aria-hidden',String(!closing));
 $('#closing').inert=!closing;
 $('#announcement').textContent=closing?'Create your Brief2Done account.':shots[index].label;
 $('.slip').classList.remove('on');
 if(!closing&&!reduced.matches)requestAnimationFrame(()=>$('.slip').classList.add('on'));
 $('#story-prev').disabled=index===0;
 $('#story-next').disabled=closing;
 $('#story-next').setAttribute('aria-label',closing?'End of walkthrough':'Next chapter');
 $('#story-step-counter').textContent=String(Math.min(index+1,6)).padStart(2,'0')+' / 06';
 $('#story-step-name').textContent=shots[index].label;
 $('#story-step-progress').textContent=String(Math.round((index+1)/shots.length*100))+'%';
 const detail={scene:index,closing};
 window.dispatchEvent(new CustomEvent('brief2done:scene-change',{detail}));
 if(window.parent!==window)window.parent.postMessage({type:'brief2done:scene-change',...detail},'*');
}
// One uninterrupted infinity-sign route, centered over a normal vertical
// content rail. Rocket movement never has to reset between chapters: each
// integer progress marks a loop junction with continuous velocity.
function infinityPoint(progress,w,h,mirror=0){
 const theta=2*Math.PI*progress;
 const side=1-2*mirror;
 return {
  x:w*.5+side*Math.min(w*.29,350)*Math.sin(theta),
  y:h*.49+Math.min(h*.15,128)*Math.sin(2*theta)
 };
}
function infinityTangent(progress,w,h,mirror=0){
 const theta=2*Math.PI*progress;
 return {
  x:(1-2*mirror)*Math.min(w*.29,350)*2*Math.PI*Math.cos(theta),
  y:Math.min(h*.15,128)*4*Math.PI*Math.cos(2*theta)
 };
}
function rocketStart(){
 const view=screen.getBoundingClientRect(),b=$('.story-brand-icon').getBoundingClientRect();
 return{x:b.left-view.left+b.width*.77,y:b.top-view.top+b.height*.36};
}
function rocketEnd(progress){
 const view=screen.getBoundingClientRect(),b=logo.getBoundingClientRect();
 // The entire closing panel rises from below. Subtract its current shift to
 // read the FINAL docking point rather than chasing a moving DOM rectangle.
 const panelShift=Math.max(0,chapterCount-progress)*screen.clientHeight;
 return{x:b.left-view.left+b.width*.77,y:b.top-view.top+b.height*.30-panelShift};
}
function flightPoint(progress,mirror=mirrorMix){
 const w=screen.clientWidth,h=screen.clientHeight,p=clamp(progress,0,chapterCount);
 const point=infinityPoint(p,w,h,mirror);
 if(p<.24){
  const start=rocketStart(),blend=ease(p/.24);
  point.x=start.x+(point.x-start.x)*blend;
  point.y=start.y+(point.y-start.y)*blend;
 }
 if(p>chapterCount-.32){
  const end=rocketEnd(progress),blend=ease((p-(chapterCount-.32))/.32);
  point.x+=(end.x-point.x)*blend;
  point.y+=(end.y-point.y)*blend;
 }
 return point;
}
function drawFlight(progress){
 if(reduced.matches){tip.style.opacity='0';trailSvg.style.opacity='0';return;}
 const w=screen.clientWidth,h=screen.clientHeight;
 if(!w||!h)return;
 const now=performance.now(),dt=lastFlightFrame?Math.min(now-lastFlightFrame,50):16;
 lastFlightFrame=now;
 const delta=progress-previousFlightProgress;
 if(Math.abs(delta)>.00015)flightDirection=delta>0?1:-1;
 previousFlightProgress=progress;
 const reverse=flightDirection<0?1:0;
 mirrorMix+=(reverse-mirrorMix)*(1-Math.exp(-dt/160));
 const point=flightPoint(progress);
 const tangent=infinityTangent(progress,w,h,mirrorMix);
 // In forward flight the rocket faces downward even when the local
 // infinity curve rises. On rewind, it faces upward, with gentle banking.
 const bank=clamp(Math.atan2(tangent.x,Math.max(40,Math.abs(tangent.y)))*180/Math.PI,-40,40);
 const angle=(flightDirection<0?0:180)+bank*(flightDirection<0?-1:1);
 const docking=ease((progress-(chapterCount-.25))/.25);
 const launch=.6+.4*ease(progress/.24),size=launch*(1-.48*docking);
 tip.style.transform='translate3d('+(point.x-tip.offsetWidth/2)+'px,'+(point.y-tip.offsetHeight/2)+'px,0) scale('+size+')';
 tip.querySelector('img').style.transform='rotate('+(angle*(1-docking))+'deg)';
 const depart=ease((progress-.025)/.12);
 tip.style.opacity=String(depart*(1-ease((progress-(chapterCount-.065))/.065)));
 // The trail is a short, fading slice of the SAME infinity path; reverse
 // direction samples AHEAD of progress so the old line stays behind the ship.
 const from=flightDirection<0?Math.min(chapterCount,progress+.16):Math.max(0,progress-.16);
 const n=32,points=[];
 for(let j=0;j<=n;j++)points.push(flightPoint(from+(progress-from)*j/n));
 trailSvg.setAttribute('viewBox','0 0 '+w+' '+h);
 const tail=points[0],head=points[n];
 trailPath.setAttribute('d',points.map((p,j)=>(j?'L ':'M ')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(''));
 trailGradient.setAttribute('x1',tail.x);
 trailGradient.setAttribute('y1',tail.y);
 trailGradient.setAttribute('x2',head.x);
 trailGradient.setAttribute('y2',head.y);
 trailSvg.style.opacity=String(depart*(1-docking*.75));
 $('#experience').classList.toggle('rocket-docked',docking>.94);
}
function render(){
 if(index<0)return;
 const p=scrollProgress();
 const nearest=chapterFor(p);
 if(nearest!==index)activate(nearest);
 const shot=shots[index];
 local=ready?clamp((performance.now()-chapterStartedAt)/(shot.duration*1000)):0;
 // An unbroken pinned stage: screenshots fade during the travelling portion;
 // the rocket keeps moving on its independent, faster trajectory.
 const fraction=p-Math.floor(p),travelling=Math.abs(p-Math.round(p))>.015;
 let opacity=1;
 if(travelling){
  // Content remains legible during the main downward arc. During the final
  // camera handoff, the scene dissolves instead of appearing to slide up
  // beneath the rocket. The next chapter emerges as the camera settles.
  opacity=1-.34*Math.sin(Math.PI*fraction);
  if(Math.floor(p)<chapterCount-1)opacity*=1-.9*ease((fraction-.78)/.22);
 }
 $('#canvas').style.opacity=String(clamp(opacity));
 if(shot.closing){
  const enter=reduced.matches?1:ease((p-(chapterCount-.49))/.46);
  $('#closing').style.opacity=String(enter*clamp(opacity));
  $('#closing').style.transform='scale('+(1.025-.025*enter)+')';
  $('.cursor').classList.remove('visible');
  const card=$('.closing-card');
  if(enter>.92&&!finalUnlocked){finalUnlocked=true;document.body.classList.add('story-unlocked');}
  card.style.opacity=String(enter);
  card.style.transform='translate3d(0,'+((1-enter)*Math.min(innerHeight*.27,180))+'px,0)';
  $('#closing').inert=enter<.8;
  logo.style.opacity=String(reduced.matches?1:.5+.5*ease((p-(chapterCount-.18))/.17));
 }else{
  // Calm scroll-led dissolves; title and screen are settled on arrival.
  paintTitle(nodes[index],1,shot.titleMode);
  sendProgress();
  compose(index,.68);
 }
 drawFlight(p);
}
function scrollToStep(to,focus=false){
 to=clamp(Math.round(to),0,chapterCount);
 if(document.body.classList.contains('motion-failed'))return;
 if(scrollAnim)cancelAnimationFrame(scrollAnim.id);
 const from=window.scrollY,target=storyTop()+to*stageH;
 const begun=performance.now();
 const duration=reduced.matches?0:460;
 function advance(now){
  const frac=duration?clamp((now-begun)/duration):1;
  // This is the native document scroll, not a separate visual-only counter.
  window.scrollTo({top:from+(target-from)*smoother(frac),behavior:'instant'});
  render();
  if(frac<1){scrollAnim={id:requestAnimationFrame(advance)};}
  else{scrollAnim=null; if(focus)$('#story-prev').focus({preventScroll:true});}
 }
 advance(begun);
}
function goTo(i){scrollToStep(i);}
function setProgress(value){
 const p=clamp(Number(value)||0)*chapterCount;
 if(scrollAnim)cancelAnimationFrame(scrollAnim.id);
 scrollAnim=null;
 window.scrollTo({top:storyTop()+p*stageH,behavior:'instant'});
 render();
}
// Browser-native wheel and touch scrolling keep every gesture responsive;
// no wheel-burst limits, dead zones, forced gesture snapping or touch hijack.
function onManualScroll(){
 // The document's scrollbar cannot expose the footer until landing has played.
 if(!finalUnlocked&&stageH){
  const limit=storyTop()+chapterCount*stageH;
  if(window.scrollY>limit+1){window.scrollTo({top:limit,behavior:'instant'});}
 }
 // The scrollbar and keyboard scrollbar controls use the SAME chapter position.
 // On thumb drag, cancel any previous wheel animation instead of fighting it.
 if(scrollFrame)return;
 scrollFrame=requestAnimationFrame(()=>{scrollFrame=null;render();});
}
function onResize(){
 const before=scrollProgress();
 const oldH=stageH;
 resize();
 sizeRunway();
 if(oldH!==stageH&&inStage()){
  window.scrollTo({top:storyTop()+before*stageH,behavior:'instant'});
 }
 layoutRail();
 render();
}
function tick(){
 if(destroyed)return;
 if(!document.hidden&&visible)render();
 frameHandle=requestAnimationFrame(tick);
}




listen(window,'scroll',onManualScroll,{passive:true});
listen(window,'pageshow',onManualScroll);
listen(window,'resize',onResize);
listen(reduced,'change',render);
listen($('#story-prev'),'click',()=>scrollToStep(index-1));
listen($('#story-next'),'click',()=>scrollToStep(index+1));
listen($('#story-replay'),'click',()=>{scrollToStep(0);$('#story-prev').focus({preventScroll:true});});
for(const link of document.querySelectorAll('a[href="#closing"]'))listen(link,'click',e=>{
 if(document.body.classList.contains('motion-failed')){e.preventDefault();$('.fallback .launch-button').focus();return;}
 e.preventDefault();
 scrollToStep(chapterCount);
 // Focus only when final card becomes focusable, without jumping past sticky stage.
 const focusWhenReady=()=>{if($('#closing').inert){requestAnimationFrame(focusWhenReady);}else $('.closing-card .launch-button').focus({preventScroll:true});};
 requestAnimationFrame(focusWhenReady);
});
listen(document,'keydown',e=>{
 if(!inStage()||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('a,button,input,textarea,select,[contenteditable]'))return;
 const dir=['ArrowDown','ArrowRight','PageDown',' '].includes(e.key)?1:
           ['ArrowUp','ArrowLeft','PageUp'].includes(e.key)?-1:0;
 const p=scrollProgress();
 if(!dir||dir<0&&p<.02||dir>0&&p>=chapterCount-.02)return;
 e.preventDefault();if(!scrollAnim)scrollToStep(chapterFor(p)+dir);
});
const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;},{threshold:.01});
observer.observe(screen);
$('#experience').classList.add('is-scroll');
sizeRunway();
layoutRail();
activate(chapterFor(scrollProgress()));
render();
frameHandle=requestAnimationFrame(tick);
window.Brief2DoneMotion=Object.freeze({
 setProgress,goTo,
 getState:()=>({mode:'continuous-scroll',progress:scrollProgress()/chapterCount,scene:index,closing:!!shots[index]?.closing,ready,duration:total}),
 destroy(){
  destroyed=true;
  cancelAnimationFrame(frameHandle);
  if(scrollFrame)cancelAnimationFrame(scrollFrame);
  if(scrollAnim)cancelAnimationFrame(scrollAnim.id);
  cleanup.forEach(fn=>fn());ro.disconnect();observer.disconnect();frames.forEach(f=>f.remove());
 }
});
})();
