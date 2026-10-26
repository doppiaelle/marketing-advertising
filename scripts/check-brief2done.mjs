import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const root = new URL('../public/', import.meta.url);
for (const relative of ['brief2done/index.html', 'assets/brief2done/frame.html']) {
  const file = new URL(relative, root);
  const html = await readFile(file, 'utf8');
  assert.ok(!/taskhub/i.test(html));
  for (const [, reference] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (/^(https?:|data:)/.test(reference)) continue;
    const target = new URL(reference, file);
    const info = await stat(target);
    assert.ok(info.isFile() || (info.isDirectory() && (await stat(new URL('index.html', target))).isFile()), `Missing asset: ${reference}`);
  }
}
const html = await readFile(new URL('brief2done/index.html', root), 'utf8');
const header = html.match(/<header[\s\S]*?<\/header>/)[0];
assert.match(header, /class="story-portal" href="https:\/\/brief2done\.doppiaelletech\.workers\.dev\/"/);
assert.match(header, /aria-label="Open Brief2Done portal"/);
assert.match(header, /brief2done-icon\.png/);
assert.match(header, /brief2done-wordmark-light\.png/);
assert.ok(html.includes('product=brief2done&amp;intent=support'));
assert.ok(html.includes('product=brief2done&amp;intent=info'));
for (const file of ['motion.js', 'screens.js']) {
  const js = await readFile(new URL(`assets/brief2done/${file}`, root), 'utf8');
  assert.ok(!/taskhub/i.test(js));
  for (const message of ['scene', 'visibility', 'frame', 'ready']) assert.ok(js.includes(`brief2done:${message}`), `Missing ${message} protocol in ${file}`);
}
// One continuous native-scroll runway synchronizes the scrollbar, panels and rocket.
const motion = await readFile(new URL('assets/brief2done/motion.js', root), 'utf8');
const showcase = await readFile(new URL('assets/brief2done/showcase.css', root), 'utf8');
const scenes = motion.match(/\{source:(?:0|6|1|8|2|5),label:/g) || [];
assert.equal(scenes.length, 6, 'Keep the guided story to six readable chapters');
assert.match(motion, /const chapterCount=shots\.length-1;/);
assert.match(motion, /storyHeight=stageH\*\(chapterCount\+1\)/, 'Runway must last until the closing scene');
assert.match(motion, /scrollProgress\(\)/, 'Scrollbar position must be the source of truth');
assert.match(motion, /Math\.round\(p\)/, 'Nearest chapter must track manual scrubbing');
assert.match(motion, /window\.scrollTo\(\{top:from\+\(target-from\)\*smoother\(frac\)/, 'Native scroll must advance with the animation');
assert.match(motion, /if\(!finalUnlocked&&stageH\)/, 'Footer must be gated before the closing reveal');
assert.match(motion, /story-unlocked/, 'The footer must unlock after the final scene');
// Native scrolling must not be intercepted or rate-limited. It drives both
// forward motion and rewind regardless of pointer velocity or device.
assert.doesNotMatch(motion, /function onWheel\(/);
assert.doesNotMatch(motion, /function onTouchMove\(/);
assert.doesNotMatch(motion, /wheelGesture|queuedFirstGesture|wheelLast/);
assert.doesNotMatch(motion, /touchstart.*onTouchStart/);
assert.doesNotMatch(motion, /worldCamera\(|const fast=clamp\(part\/\.68\)/);
assert.match(motion, /listen\(window,'scroll',onManualScroll,\{passive:true\}\)/);
assert.match(motion, /const p=scrollProgress\(\)/);
assert.match(motion, /const position=screenFlight\(progress\)/);
assert.match(motion, /tip\.style\.opacity=String\(depart/);
assert.match(motion, /flightDirection<0\?-yaw:180-yaw/, 'Reverse points the nose upward');
assert.match(motion, /mirrorMix\+=\(reverse-mirrorMix\)/, 'Return path mirrors smoothly');
assert.match(motion, /flightDirection<0\?Math\.min\(chapterCount,progress\+\.17\)/,
  'Reverse trail should follow the rocket, not lead it');
assert.match(motion, /paintTitle\(nodes\[index\],1,shot\.titleMode\)/, 'Simplified static titles');
assert.match(motion, /compose\(index,\.68\)/, 'No aggressive screen whip on chapter changes');
assert.match(motion, /const enter=reduced\.matches\?1:ease\(\(p-\(chapterCount-\.49\)\)\/\.46\)/,
  'Closing reveal must follow scroll, not a multi-second timer');

// Execute the actual geometry and flight builder used on the page, instead
// of duplicating the control points in the test. This prevents a return to the
// previous failure where each of six stages travelled only 1/6 screen height.
const geomStart=motion.indexOf('function cubicPoint(');
const geomEnd=motion.indexOf('function flightSegment(',geomStart);
assert.ok(geomStart>0&&geomEnd>geomStart,'Cannot locate real flight geometry');
function fixture(w,h,begin,finish){
 const prelude=[
  'const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));',
  'const ease=t=>1-Math.pow(1-clamp(t),3);',
  'const chapterCount=6;',
  'const screen={clientWidth:'+w+',clientHeight:'+h+'};',
  'const flightPaths=[];let pathSize="";',
  'const rocketStart=()=>({x:'+begin.x+',y:'+begin.y+'});',
  'const rocketEnd=()=>({x:'+finish.x+',y:'+finish.y+'});',
  'const trailSvg={setAttribute(){}};',
  'const mirrorMix=0;'
 ].join('\n');
 return runInNewContext(
  prelude+'\n'+motion.slice(geomStart,geomEnd)+
  '\nbuildFlight();({flightPaths,flightSweep,flightCamera,cubicPoint,cubicTangent})',
  {Math}
 );
}
for(const {w,h,start,end} of [
 {w:1280,h:800,start:{x:1080,y:82},end:{x:420,y:690}},
 {w:390,h:844,start:{x:300,y:74},end:{x:170,y:700}}
]){
 const {flightPaths,flightSweep,flightCamera,cubicPoint,cubicTangent}=fixture(w,h,start,end);
 assert.equal(flightPaths.length,6);
 assert.ok(flightSweep>=h*.78,'Chapter sweep should occupy most of the viewport');
 const projected=p=>{
  const index=Math.min(5,Math.floor(p));
  const point=cubicPoint(flightPaths[index],p>=6?1:p-index,0);
  return{x:point.x,y:point.y-flightCamera(p)};
 };
 for(const lane of [0,1]){
  for(let i=0;i<6;i++){
   const segment=flightPaths[i];
   let prevWorldY=-Infinity;
   for(let j=0;j<=100;j++){
    const p=cubicPoint(segment,j/100,lane);
    assert.ok(p.y>=prevWorldY-1e-6,'World trajectory must always descend');
    prevWorldY=p.y;
   }
   if(i>0){
    const left=cubicPoint(flightPaths[i-1],1,lane),right=cubicPoint(segment,0,lane);
    assert.ok(Math.hypot(left.x-right.x,left.y-right.y)<1e-8,'Join cannot teleport');
    const tangent=cubicTangent(segment,0,lane);
    assert.ok(Math.hypot(tangent.x,tangent.y)>100,'Start of chapter cannot stall');
   }
  }
 }
 for(let i=0;i<6;i++){
  const top=project(i).y;
  const bottom=project(i+.76).y;
  assert.ok(bottom-top>=h*.46,
    'Each chapter must visibly sweep down at least 46% of the viewport; chapter '+i+
    ' moved '+Math.round(bottom-top)+'px of '+h+'px');
  if(i<5){
   const before=project(i+1-0.000001),after=project(i+1);
   assert.ok(Math.hypot(before.x-after.x,before.y-after.y)<.01,
    'Viewport/camera must remain continuous at chapter '+(i+1));
  }
 }
 assert.ok(Math.abs(project(6).y-end.y)<1e-6,'Final landing must meet brand icon');
}
assert.match(motion,/function flightCamera\(progress\)/);
assert.match(motion,/flightSweep\*\(i\+ease\(\(u-\.78\)\/\.22\)\)/,
 'Camera should hand off between chapters only after the full-height sweep');
assert.match(motion,/position=screenFlight\(progress\)/,'Rocket must use projected position');
assert.match(motion,/points\.push\(screenFlight\(q\)\)/,
 'Trail must be drawn in the same projected space as the rocket');
assert.match(motion,/opacity\*=1-\.9\*ease\(\(fraction-\.78\)\/\.22\)/,
 'Panel should dissolve during camera handoff');
assert.match(showcase, /\.rocket-guide\s*\{\s*opacity: 0;/,
  'The rocket must be invisible before the first scroll');
assert.match(showcase, /\.rocket-guide img\s*\{[^}]*transition: transform/s,
  'Reverse heading must rotate smoothly');
const rocket = await readFile(new URL('assets/brief2done/rocket-flight.svg', root), 'utf8');
assert.match(rocket, /viewBox="0 0 120 220"/);
assert.match(rocket, /Entire cone flame: an unbroken silhouette ending at a single tip/);
assert.match(rocket, /60 219/, 'Flame must reach its complete conical tip');
assert.match(rocket, /id="flame-core"/);
assert.match(html, /<img src="\.\.\/assets\/brief2done\/rocket-flight\.svg"/);
assert.doesNotMatch(html, /rocket-fire-cut|rocket-body-cut/, 'Broken logo cropping masks must be removed');
for (const id of ['rocket-guide', 'flight-trace', 'flight-path', 'story-prev', 'story-next', 'closing', 'story-replay']) {
  assert.ok(html.includes('id="'+id+'"'), 'Missing guided flight element: '+id);
}
assert.match(html, /id="rocket-trail-gradient"/);



assert.match(html, /id="story-prev"[^>]*aria-label="Previous chapter"/);
assert.match(html, /id="story-next"[^>]*aria-label="Next chapter"/);
assert.ok(!html.includes('class="story-step-info"'), 'Remove the large Next/progress bar');
assert.match(showcase, /height: var\(--journey-height, 700dvh\)/);
assert.match(showcase, /\.experience\.is-scroll \.shell \{\s*position: sticky;/);
assert.match(showcase, /\.is-closing \.story-nav \{ display: flex; \}/);
assert.match(showcase, /stroke: url\(#rocket-trail-gradient\)/);

assert.match(html, /class="story-portal".*>Get started<\/span>/);
assert.match(html, /Create your account/);

const legacy = await readFile(new URL('taskhub/index.html', root), 'utf8');
assert.ok(legacy.includes('../brief2done/'));
assert.ok(legacy.includes('location.search+location.hash'));
console.log('PASS: Brief2Done six full-height sweeps (desktop/mobile), scroll-led camera handoffs, no jumps, reverse paths, native scroll, asset and footer checks.');
