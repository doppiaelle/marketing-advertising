
/**
 * Feeddy / Neon pinball scrolling vignette
 * - No libraries, no external requests, deterministic one-hit path.
 * - The icons move through a virtual camera: each arrives at viewport CENTER.
 * - The original PNG is the only final brand artwork and is NEVER redrawn.
 * - Points are measured in STAGE HEIGHT units, not in document pixels.
 * Public API: document.querySelector('[data-feeddy-motion]').feeddyMotion
 *        .replay() / .pause() / .resume() / .seek(milliseconds)
 */
(() => {
  'use strict';
  const P = [
    {name:'Instagram', x:-.21, y:0},
    {name:'YouTube', x:.21, y:.82},
    {name:'TikTok', x:-.21, y:1.64},
    {name:'Google Ads', x:.21, y:2.46},
    {name:'Meta', x:-.21, y:3.28},
    {name:'Feeddy', x:0, y:4.10}
  ];
  const FIRST = {x:P[0].x, y:-.72};
  const SEGMENTS = [];
  const add=(kind,duration,from,to)=>SEGMENTS.push({kind,duration,from,to});
  add('flight',1050,-1,0);
  for(let i=0;i<5;i++) {
    add('impact',122,i,i);
    add('flight',i===4?1120:1020,i,i+1);
  }
  add('reveal',1200,5,5);
  add('hold',1200,5,5);
  let LENGTH=0;
  SEGMENTS.forEach(s=>{s.start=LENGTH; LENGTH+=s.duration;s.end=LENGTH;});
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>t*t*(3-2*t);
  const begin=()=>document.querySelectorAll('[data-feeddy-motion]').forEach(el=>{try{new Pinball(el);}catch(error){el.dispatchEvent(new CustomEvent('feeddy:ready',{bubbles:true}));console.error(error);}});

  class Pinball {
    constructor(stage){
      this.stage=stage;
      this.items=[...stage.querySelectorAll('.feeddy-icon')];
      this.ball=stage.querySelector('.feeddy-ball');
      this.logo=stage.querySelector('.feeddy-logo');
      this.canvas=stage.querySelector('.feeddy-light-canvas');
      this.ctx=this.canvas.getContext('2d');
      this.replayBtn=document.querySelector('[data-motion-replay]');
      this.toggleBtn=document.querySelector('[data-motion-toggle]');
      this.status=document.querySelector('[data-motion-status]');
      this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.camera={x:P[0].x,y:-.3};
      this.ballWorld={...FIRST};
      this.history=[];this.impacts=[];this.visited=new Set();
      this.lastFrame=null;this.clock=0;this.playing=false;this.finished=false;this.raf=0;
      this.width=0;this.height=0;this.dpr=1;
      this.tick=this.tick.bind(this);
      this.observer=new ResizeObserver(()=>this.resize());
      this.observer.observe(stage);
      this.resize();
      stage.feeddyMotion=this;
      if(this.replayBtn)this.replayBtn.addEventListener('click',()=>this.replay());
      if(this.toggleBtn)this.toggleBtn.addEventListener('click',()=>this.playing?this.pause():this.resume());
      if(this.reduced){this.showFinal();return;}
      document.documentElement.classList.add('motion-enabled');
      this.replay();
    }
    setStatus(value){if(this.status)this.status.textContent=value;}
    setToggle(){if(this.toggleBtn){this.toggleBtn.textContent=this.playing?'Ⅱ Pause':'▶ Resume';this.toggleBtn.setAttribute('aria-pressed',String(!this.playing));}}
    resize(){
      const box=this.stage.getBoundingClientRect();
      this.width=box.width;this.height=box.height;
      this.dpr=Math.min(2,window.devicePixelRatio||1);
      this.canvas.width=Math.round(box.width*this.dpr);
      this.canvas.height=Math.round(box.height*this.dpr);
      this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
      this.positionWorld();
    }
    project(point){return {x:this.width/2+(point.x-this.camera.x)*this.height,y:this.height/2+(point.y-this.camera.y)*this.height};}
    positionWorld(){
      if(!this.height)return;
      this.items.forEach((item,i)=>{
        const pos=this.project(P[i]);
        item.style.left=pos.x+'px';item.style.top=pos.y+'px';
        // Prevent faraway icons from remaining focusable or affecting paint.
        item.style.visibility=pos.y < -120 || pos.y > this.height+120 ? 'hidden':'visible';
      });
    }
    currentFlight(from,to,t){
      const a=from<0?FIRST:P[from], b=P[to];
      // Very fast flipper takeoff: a short UPWARD impulse followed by
      // accelerated free fall. No gentle repeated hopping on a logo.
      const u=smooth(t);
      const x=mix(a.x,b.x,u);
      const launch=from<0?0:.34;
      const y=mix(a.y,b.y,t*t) - launch*Math.sin(Math.PI*t)*(1-.15*t);
      // Follow the path with a delayed virtual camera: the ball moves sideways
      // on screen, while OLD icons are pushed up and out of the viewport.
      const camStart=from<0?{x:P[0].x,y:-.3}:P[from];
      const scroll=smooth(clamp((t-.12)/.88));
      const camX=smooth(clamp((t-.28)/.72));
      this.camera.x=mix(camStart.x,b.x,camX);
      this.camera.y=mix(camStart.y,b.y,scroll);
      // Keep the glowing sphere on-screen while the virtual camera catches up.
      this.camera.y=y-clamp(y-this.camera.y,-.365,.365);
      this.ballWorld={x,y};
    }
    applyTime(ms,simulateEvents=true){
      this.clock=clamp(ms,0,LENGTH);
      if(simulateEvents){
        SEGMENTS.forEach(seg=>{
          if(seg.kind==='impact' && this.clock>=seg.start && !this.visited.has(seg.from)){
            this.visited.add(seg.from);
            this.items[seg.from].classList.add('is-hit');
            this.impacts.push({point:P[seg.from],born:seg.start,final:false});
          }
        });
      }
      const segment=SEGMENTS.find(s=>this.clock < s.end) || SEGMENTS[SEGMENTS.length-1];
      const t=clamp((this.clock-segment.start)/segment.duration);
      let ballVisible=1,stretch=1;
      if(segment.kind==='flight'){
        this.currentFlight(segment.from,segment.to,t);
        stretch=1.04+(segment.from<0?0:.13)*Math.min(1,t*2);
        this.setStatus('Towards '+P[segment.to].name);
      } else if(segment.kind==='impact'){
        this.ballWorld={...P[segment.from]};
        this.camera={...P[segment.from]};
        // Brief pinball compression, immediately released into next flight.
        stretch=1 - .23*Math.sin(Math.PI*t);
        this.setStatus('Impact · '+P[segment.from].name);
      } else {
        this.camera={...P[5]};
        this.ballWorld={...P[5]};
        ballVisible=segment.kind==='reveal'?1-clamp(t*5):0;
        this.stage.classList.add('is-revealing');
        if(!this.revealed){this.revealed=true;this.stage.dispatchEvent(new CustomEvent('feeddy:ready',{bubbles:true}));}
        if(!this.impacts.some(s=>s.final))this.impacts.push({point:P[5],born:segment.start,final:true});
        this.setStatus(segment.kind==='hold'?'Feeddy logo':'Feeddy');
      }
      this.positionWorld();
      const b=this.project(this.ballWorld);
      this.ball.style.left=b.x+'px';this.ball.style.top=b.y+'px';
      this.ball.style.opacity=String(ballVisible);
      const compress=segment.kind==='impact';
      this.ball.style.transform=`translate(-50%,-50%) scale(${compress?1.25:stretch},${compress?stretch:1})`;
      this.logo.style.left='50%';this.logo.style.top='50%';
      if(ballVisible>.01 && (segment.kind==='flight'||segment.kind==='impact')){
        const last=this.history[this.history.length-1];
        if(!last||this.clock-last.time>=12){
          this.history.push({point:{...this.ballWorld},time:this.clock});
        }
      }
      this.history=this.history.filter(h=>this.clock-h.time<=400 && h.time<=this.clock);
      this.paint();
      if(this.clock>=LENGTH){this.playing=false;this.finished=true;this.setStatus('Feeddy logo');this.setToggle();}
    }
    paint(){
      const ctx=this.ctx,w=this.width,h=this.height;
      ctx.clearRect(0,0,w,h);
      const trail=this.history.filter(p=>this.clock-p.time>=0&&this.clock-p.time<395);
      // Connected continuous glowing comet ribbon, NOT separated dots.
      if(trail.length>=2){
        const layers=[
          {width:37,opacity:.095,blur:24,color:'#ec9852'},
          {width:22,opacity:.23,blur:15,color:'#efb067'},
          {width:10,opacity:.48,blur:7,color:'#ffd18a'},
          {width:2.4,opacity:.72,blur:2,color:'#fff2cf'}
        ];
        const pts=trail.map(p=>({...this.project(p.point),age:clamp((this.clock-p.time)/395)}));
        ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
        for(const layer of layers){
          ctx.strokeStyle=layer.color;ctx.shadowColor=layer.color;ctx.shadowBlur=layer.blur;
          for(let i=1;i<pts.length;i++){
            const a=pts[i-1],b=pts[i], age=(a.age+b.age)/2;
            const freshness=Math.pow(1-age,2.2);
            ctx.globalAlpha=layer.opacity*freshness;
            ctx.lineWidth=layer.width*(.15+.85*freshness);
            ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
          }
        }
        ctx.restore();
      }
      // Soft radiant splash droplets travel in WORLD space with the camera.
      this.impacts=this.impacts.filter(hit=>this.clock-hit.born<(hit.final?850:700));
      this.impacts.forEach(hit=>{
        const time=clamp((this.clock-hit.born)/(hit.final?850:650));
        const origin=this.project(hit.point);
        const r=hit.final?31:19;
        const halo=ctx.createRadialGradient(origin.x,origin.y,0,origin.x,origin.y,r*(1+time*1.4));
        halo.addColorStop(0,`rgba(255,228,162,${.32*(1-time)})`);
        halo.addColorStop(.45,`rgba(232,159,83,${.14*(1-time)})`);
        halo.addColorStop(1,'rgba(222,158,88,0)');
        ctx.fillStyle=halo;
        ctx.beginPath();ctx.arc(origin.x,origin.y,r*(1+time*1.4),0,Math.PI*2);ctx.fill();
        const count=hit.final?18:12;
        for(let n=0;n<count;n++){
          const angle=2*Math.PI*n/count+Math.sin(n*8.27)*.08;
          const magnitude=(hit.final?88:58)*(.55+.35*Math.sin(n*4.11)**2);
          const radius=magnitude*Math.pow(time,.77);
          const px=origin.x+Math.cos(angle)*radius;
          const py=origin.y+Math.sin(angle)*radius*.68;
          const size=(hit.final?4.0:3.3)*(1-time)*(.6+.4*(n%3)/2);
          if(size<.3)continue;
          ctx.save();ctx.globalAlpha=(1-time)*.9;
          ctx.shadowColor='#ffc97e';ctx.shadowBlur=9;
          ctx.fillStyle=n%3===0?'#fff3cb':'#f2b96c';
          ctx.beginPath();ctx.ellipse(px,py,size*(1+.35*time),size*.65,angle,0,Math.PI*2);ctx.fill();
          ctx.restore();
        }
      });
    }
    replay(){
      if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;
      this.clock=0;this.lastFrame=null;this.finished=false;this.playing=true;this.revealed=false;
      this.history=[];this.impacts=[];this.visited.clear();
      this.items.forEach(el=>el.classList.remove('is-hit'));
      this.stage.classList.remove('is-revealing');
      this.ball.style.display='block';
      this.applyTime(0);
      this.setToggle();
      this.raf=requestAnimationFrame(this.tick);
    }
    pause(){this.playing=false;if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;this.lastFrame=null;this.setToggle();this.setStatus('Paused');}
    resume(){
      if(this.reduced)return;
      if(this.finished){this.replay();return;}
      if(this.playing)return;
      this.playing=true;this.lastFrame=null;this.setToggle();
      this.raf=requestAnimationFrame(this.tick);
    }
    seek(ms){
      this.pause();this.history=[];this.impacts=[];this.visited.clear();
      this.items.forEach(el=>el.classList.remove('is-hit'));
      this.stage.classList.toggle('is-revealing',ms>=SEGMENTS.find(s=>s.kind==='reveal').start);
      this.applyTime(ms);
    }
    showFinal(){
      if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;this.lastFrame=null;
      this.camera={...P[5]};this.positionWorld();
      this.history=[];this.impacts=[];this.ctx.clearRect(0,0,this.width,this.height);
      this.stage.classList.add('is-revealing');
        if(!this.revealed){this.revealed=true;this.stage.dispatchEvent(new CustomEvent('feeddy:ready',{bubbles:true}));}
      this.ball.style.opacity='0';this.ball.style.display='none';
      this.setStatus('Feeddy logo');this.finished=true;this.playing=false;this.setToggle();
    }
    tick(now){
      if(!this.playing)return;
      if(this.lastFrame===null)this.lastFrame=now;
      const dt=Math.max(0,now-this.lastFrame);
      this.lastFrame=now;
      this.applyTime(this.clock+dt);
      if(this.playing)this.raf=requestAnimationFrame(this.tick);
      else this.raf=0;
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin);
  else begin();
})();

