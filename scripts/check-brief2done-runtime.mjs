/**
 * Browser-startup smoke test. Syntax/static regex checks cannot catch stale
 * references such as the removed pathSize variable in sizeRunway().
 * Run the real, unmodified motion.js against a minimal DOM contract.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source=await readFile(new URL('../public/assets/brief2done/motion.js',import.meta.url),'utf8');

function boot({initialScroll=0,navigationType='navigate'}={}){
 const events=new Map(),elements=new Map(),iframes=[],rafs=[],timers=[];
 let scrollY=initialScroll,seq=1;
 class MockElement {
  constructor(key='element'){
   this.key=key;this.children=[];this.nodes=new Map();this.dataset={};
   this.attributes={};this.clientWidth=1280;this.clientHeight=800;
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
   if(this.key==='#experience')return {top:-scrollY,bottom:5600-scrollY,left:0,right:1280,width:1280,height:5600};
   if(this.key==='.story-brand-icon')return {top:20,left:1100,right:1140,bottom:60,width:40,height:40};
   if(this.key==='.closing-brand-icon')return {top:580,left:610,right:706,bottom:676,width:96,height:96};
   return {top:0,left:0,bottom:800,right:1280,width:1280,height:800};
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
  history:{scrollRestoration:'auto'},innerHeight:800,
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
  matchMedia(){return reduced;},innerHeight:800,Math,Set,Map,Date,Number,
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

console.log('PASS: Browser startup after reload, two-frame readiness, all scene transitions, closing CTA, reverse, and back/forward scroll restoration.');
