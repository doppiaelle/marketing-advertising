/**
 * Browser-startup smoke test. Syntax/static regex checks cannot catch stale
 * references such as the removed pathSize variable in sizeRunway().
 * Run the real, unmodified motion.js against a minimal DOM contract.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source=await readFile(new URL('../public/assets/brief2done/motion.js',import.meta.url),'utf8');

function boot({initialScroll=0,navigationType='navigate',width=1280,height=800}={}){
 const events=new Map(),elements=new Map(),iframes=[],rafs=[],timers=[];
 let scrollY=initialScroll,seq=1;
 class MockElement {
  constructor(key='element'){
   this.key=key;this.children=[];this.nodes=new Map();this.dataset={};
   this.attributes={};this.clientWidth=width;this.clientHeight=height;
   this.classList={values:new Set(),add(...x){x.forEach(z=>this.values.add(z));},
    remove(...x){x.forEach(z=>this.values.delete(z));},
    contains(x){return this.values.has(x);},
    toggle(x,force){const make=force===undefined?!this.values.has(x):force;
     if(make)this.values.add(x);else this.values.delete(x);return make;}};
   this.style={setProperty(k,v){this[k]=v;}};
   this.inert=false;this.disabled=false;this.contentWindow=null;
  }
  addEventListener(name,fn){if(!this.listeners)this.listeners=new Map();
   if(!this.listeners.has(name))this.listeners.set(name,[]);this.listeners.get(name).push(fn);}
  removeEventListener(name,fn){this.listeners?.set(name,(this.listeners.get(name)||[]).filter(x=>x!==fn));}
  setAttribute(k,v){this.attributes[k]=String(v);}
  getAttribute(k){return this.attributes[k]??null;}
  appendChild(child){this.children.push(child);return child;}
  insertBefore(child){this.children.push(child);return child;}
  querySelector(s){
   if(s==='iframe')return this.children.find(c=>c.tagName==='iframe')??this.childFor(s);
   return this.childFor(s);
  }
  childFor(s){if(!this.nodes.has(s))this.nodes.set(s,new MockElement(s));return this.nodes.get(s);}
  getBoundingClientRect(){
   if(this.key==='#experience')return {top:-scrollY,bottom:height*7-scrollY,left:0,right:width,width,height:height*7};
   if(this.key==='.story-brand-icon')return {top:20,left:1100,right:1140,bottom:60,width:40,height:40};
   if(this.key==='.closing-brand-icon')return {top:580,left:610,right:706,bottom:676,width:96,height:96};
   return {top:0,left:0,bottom:height,right:width,width,height};
  }
  focus(){}
 }
 const get=s=>{if(!elements.has(s))elements.set(s,new MockElement(s));return elements.get(s);};
 const body=get('body');
 const document={
  body,querySelector:get,querySelectorAll(){return [];},
  addEventListener(name,fn){if(!events.has('document:'+name))events.set('document:'+name,[]);events.get('document:'+name).push(fn);},
  removeEventListener(name,fn){events.set('document:'+name,(events.get('document:'+name)||[]).filter(x=>x!==fn));},
  createElement(tag){const el=new MockElement(tag);el.tagName=tag;
   if(tag==='iframe'){
    el.contentWindow={postMessage(){}};
    iframes.push(el);
   }
   return el;
  }
 };
 const window={
  parent:null,location:{hash:'',origin:'https://doppiaelle.github.io'},
  history:{scrollRestoration:'auto'},innerHeight:height,
  addEventListener(name,fn){if(!events.has(name))events.set(name,[]);events.get(name).push(fn);},
  removeEventListener(name,fn){events.set(name,(events.get(name)||[]).filter(x=>x!==fn));},
  dispatchEvent(e){(events.get(e.type)||[]).forEach(fn=>fn(e));return true;},
  scrollTo(opts){scrollY=typeof opts==='object'?opts.top:opts;},
  postMessage(){},
  get scrollY(){return scrollY;},
  set scrollY(n){scrollY=n;}
 };
 window.parent=window;
 const reduced={matches:false,addEventListener(){},removeEventListener(){}};
 const context={
  document,window,location:window.location,history:window.history,
  matchMedia(){return reduced;},innerHeight:height,Math,Set,Map,Date,Number,
  performance:{now(){return 1000;},getEntriesByType(){return [{type:navigationType}];}},
  ResizeObserver:class{observe(){}disconnect(){}},
  IntersectionObserver:class{observe(){}disconnect(){}},
  CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts?.detail;}},
  requestAnimationFrame(fn){rafs.push(fn);return ++seq;},
  cancelAnimationFrame(){},
  setTimeout(fn){timers.push(fn);return ++seq;},
  clearTimeout(){},
  console
 };
 runInNewContext(source,context,{filename:'motion.js',timeout:3000});
 return {window,body,get,iframes,events,scroll:()=>scrollY,
   changeBrowserToolbar(nextHeight){window.innerHeight=nextHeight;context.innerHeight=nextHeight;for(const fn of events.get('resize')||[])fn();},
   sendReady(scene){
    for(const iframe of iframes)(events.get('message')||[]).forEach(fn=>
     fn({source:iframe.contentWindow,data:{
       type:'brief2done:ready',scene,
       primary:{x:0,y:0,w:800,h:500},
       secondary:{x:0,y:0,w:600,h:400},
       focus:{x:100,y:100,w:40,h:40}
     }}));
   }
 };
}

const fresh=boot({initialScroll:4800,navigationType:'reload'});
assert.ok(fresh.window.Brief2DoneMotion,'The page must finish startup and expose the controller');
assert.equal(fresh.scroll(),0,'Fresh reload must not start at the closing scene');
assert.equal(fresh.window.Brief2DoneMotion.getState().scene,0);
assert.equal(fresh.get('#experience').style['--journey-height'],'5600px');
assert.equal(fresh.get('#scenes').children.length,6,'All six chapter panels must be built');
assert.equal(fresh.iframes.length,2,'The preview must reuse exactly two iframes');

fresh.sendReady(0);
assert.equal(fresh.window.Brief2DoneMotion.getState().ready,true);
assert.ok(fresh.get('#loading').classList.contains('hidden'));

// Exercise actual scroll-driven painting, not merely geometry helpers.
// The long glowing path must be produced by render(), and the forward nose
// must tilt in the same left/right direction as its serpentine segment.
function noseX(){
 const transform=fresh.get('#rocket-guide').querySelector('img').style.transform;
 const degrees=Number(transform.match(/rotate\(([-\d.]+)deg\)/)?.[1]);
 assert.ok(Number.isFinite(degrees),'Rocket must have a computed rotation');
 return Math.sin(degrees*Math.PI/180);
}
fresh.window.Brief2DoneMotion.setProgress(1.25/6);
assert.ok(noseX()<-.1,'Forward leftward descent should face left');
fresh.window.Brief2DoneMotion.setProgress(2.25/6);
assert.ok(noseX()>.1,'Forward rightward descent should face right');
const d=fresh.get('#flight-path').getAttribute('d');
assert.ok((d.match(/L /g)||[]).length>=64,'Trail should contain the longer rendered arc');
assert.equal(fresh.get('#flight-glow').getAttribute('d'),d,'Glow and gradient path must stay aligned');
assert.ok(Number(fresh.get('#flight-trace').style.opacity)>.8,'Trail should be visible during the main flight');
fresh.window.Brief2DoneMotion.setProgress(1.25/6);
assert.ok(noseX()>.1,'Reverse motion should face back up the route');

fresh.window.Brief2DoneMotion.setProgress(1/6);
assert.equal(fresh.window.Brief2DoneMotion.getState().scene,1,'Next chapter must render');
fresh.sendReady(6);
fresh.window.Brief2DoneMotion.setProgress(.5);
assert.equal(fresh.window.Brief2DoneMotion.getState().scene,3,'Middle chapter must render');
fresh.sendReady(8);
fresh.window.Brief2DoneMotion.setProgress(1);
assert.equal(fresh.window.Brief2DoneMotion.getState().scene,6,'The closing panel must render');
assert.ok(fresh.body.classList.contains('story-unlocked'),'Footer unlocks only at the final scene');
fresh.window.Brief2DoneMotion.setProgress(0);
assert.equal(fresh.window.Brief2DoneMotion.getState().scene,0,'Reverse should restore the first scene');
fresh.sendReady(0);

const restored=boot({initialScroll:2400,navigationType:'back_forward'});
assert.equal(restored.scroll(),2400,'Back/forward history must retain its scroll position');
assert.equal(restored.window.Brief2DoneMotion.getState().scene,3);


const phone=boot({initialScroll:0,navigationType:'navigate',width:390,height:760});
assert.ok(phone.window.Brief2DoneMotion,'Mobile boot must initialize controller');
assert.equal(phone.iframes.length,0,'Mobile Safari must not initialize heavyweight React preview iframes');
assert.equal(phone.get('#scenes').children.length,6,'All six static mobile panels must be created before scrolling');
for(const [i,panel] of phone.get('#scenes').children.entries()){
 assert.ok(panel.innerHTML.includes('static-preview'),'Static panel '+i+' must already exist');
}
assert.ok(phone.get('#loading').classList.contains('hidden'),'Mobile static content must not wait for async frames');
phone.window.Brief2DoneMotion.setProgress(2.25/6);
assert.equal(phone.window.Brief2DoneMotion.getState().scene,2);
const beforeRunway=phone.get('#experience').style['--journey-height'];
const beforeCanvas=phone.get('#canvas').style.transform;
const beforeScroll=phone.scroll();
// Safari's address-bar collapse expands its visual viewport without changing
// the small stable layout viewport: avoid the forced resize that caused jumps.
phone.changeBrowserToolbar(830);
assert.equal(phone.get('#experience').style['--journey-height'],beforeRunway);
assert.equal(phone.get('#canvas').style.transform,beforeCanvas);
assert.equal(phone.scroll(),beforeScroll);
phone.window.Brief2DoneMotion.setProgress(5.5/6);
assert.ok(phone.get('#scenes').style.transform.includes('translate3d'),
 'The preloaded mobile rail must move with native scroll');

console.log('PASS: Browser startup, heading on forward/reverse scroll, illuminated long trail, mobile static panels, stable Safari toolbar, scenes, CTA and history.');
