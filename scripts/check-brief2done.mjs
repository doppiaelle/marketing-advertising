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
assert.match(motion, /storyHeight=stageH\*\(chapterCount\*scrollStretch\+1\)/, 'Runway must extend for the slower-paced six scenes');
assert.match(motion,/const scrollStretch=1\.18;/,'One physical scroll chapter must take 18% more distance');
assert.match(motion,/\(h\*scrollStretch\)/,'Actual scroll speed is scaled without wheel interception');
assert.match(motion,/target=storyTop\(\)\+to\*stageH\*scrollStretch/,'Chapter arrows must use the same slower scale');
assert.match(motion, /scrollProgress\(\)/, 'Scrollbar position must be the source of truth');
assert.match(motion, /Math\.round\(p\)/, 'Nearest chapter must track manual scrubbing');
assert.match(motion, /window\.scrollTo\(\{top:from\+\(target-from\)\*smoother\(frac\)/, 'Native scroll must advance with the animation');
assert.match(motion, /if\(!finalUnlocked&&stageH\)/, 'Footer must be gated before the closing reveal');
assert.match(motion, /story-unlocked/, 'The footer must unlock after the final scene');
// A physical vertical rail scrolls UP under a small, continuously descending
// serpentine rocket. The rocket is NOT attached to a resettable camera.
assert.doesNotMatch(motion,/function onWheel\(/);
assert.doesNotMatch(motion,/function onTouchMove\(/);
assert.doesNotMatch(motion,/wheelGesture|queuedFirstGesture|wheelLast/);
assert.doesNotMatch(motion,/infinityPoint|infinityTangent|flightCamera|worldCamera/);
assert.match(motion,/listen\(window,'scroll',onManualScroll,\{passive:true\}\)/);
assert.match(motion,/sceneRail\.style\.transform='translate3d\(0,'\+railOffset\(p,h\)/);
assert.match(motion,/n\.el\.style\.top=railPanelTop\(i,h\)/);
assert.match(motion,/nodes\.forEach\(\(n,i\)=>/);
assert.match(motion,/const closingShift=Math\.max\(0,chapterCount-p\)\*screen\.clientHeight/);
assert.match(motion,/endPanel\.style\.transform='translate3d\(0,'\+closingShift/);
assert.match(motion,/const point=descentPoint\(p,w,h,mirror\)/);
assert.match(motion,/const angle=rocketHeading\(progress,w,h,flightDirection,mirrorMix\)/);
assert.match(motion,/return \(direction<0\?0:180\)-bank;/);
assert.match(motion,/const from=trailOrigin\(progress,flightDirection\)/);
assert.match(motion,/mirrorMix\+=\(reverse-mirrorMix\)/);
assert.match(motion,/tip\.style\.opacity=String\(depart/);
assert.match(showcase,/\.experience\.is-scroll #scenes\s*\{[^}]*will-change: transform/s);
assert.match(showcase,/\.experience\.is-scroll #closing\s*\{[^}]*visibility: visible/s);
assert.match(showcase,/\.experience\.is-scroll #scenes\s*\{[^}]*z-index: 12/s,
  'Scene labels must paint above product preview cards');
assert.match(showcase,/\.experience\.is-scroll #scenes \.scene-explainer\s*\{[^}]*background: linear-gradient/s,
  'Dark translucent explanation panel must be restored');
assert.match(showcase,/\.experience\.is-scroll #flight-glow\s*\{[^}]*stroke: url\(#rocket-trail-gradient\)/s);
assert.match(showcase,/height: 100svh/,'Mobile stage must not resize with Safari bottom URL toolbar');
assert.match(html, /class="scene-viewport"><div id="scenes"><\/div><\/div>/,
  'Scene rail must be inside a fixed, clipping fade viewport');
assert.match(showcase,/\.experience\.is-scroll \.scene-viewport\s*\{[^}]*position: absolute;[^}]*overflow: hidden/s,
  'Fade viewport must stay still while the story rail moves');
assert.match(showcase,/\.experience\.is-scroll \.scene-viewport #scenes \.scene,[\s\S]*?opacity: 1;[\s\S]*?visibility: visible;/,
  'All inactive and active scenes must remain painted, preventing abrupt mobile phase changes');
assert.match(showcase,/\.mobile \.scene-viewport::before/, 'Top fade must be anchored to the scaled story viewport');
assert.match(showcase,/\.scene-viewport #scenes\s*\{ z-index: 1; \}/, 'Moving panels must paint BEHIND the two fixed gradient overlays');
assert.match(showcase,/\.mobile \.scene-viewport::after[\s\S]*?z-index: 4;/, 'Static fades must paint above the moving rail');
assert.match(showcase,/\.mobile \.scene-viewport::after/, 'Bottom fade must be anchored to the scaled story viewport');
assert.match(showcase,/\.screen-wrap::before,[\s\S]*?\.screen-wrap::after\s*\{\s*display: none;/,
  'Old outer mobile gradients must not conflict with the new inner fade');
assert.doesNotMatch(motion,/n\.el\.style\.opacity=String\(fade\)/,
  'Never animate per-panel opacity while scrolling');
assert.doesNotMatch(motion,/n\.el\.style\.opacity=String\(fade\)/,
  'Never animate opacity for the entire preloaded rail per frame');
assert.match(motion,/chromeSettlingUntil=performance\.now\(\)\+220/,
  'Mobile browser chrome changes briefly suspend decorative bank adjustments');
assert.match(motion,/const visualViewport=window\.visualViewport;/);
assert.match(motion,/if\(!mobile\|\|now>=chromeSettlingUntil\)/,
  'The rocket remains scroll-driven even if visual viewport chrome is settling');
assert.match(showcase,/\.mobile \.static-payment-amount/,
  'Payment in chapter six must have a prominent numeric amount');
assert.match(motion,/Reported by client/);
assert.match(motion,/Paid outside Brief2Done/);
assert.match(motion,/Confirm receipt/);

assert.match(showcase,/\.experience\.is-scroll \.mobile \.static-preview\s*\{[^}]*display: block/s,
  'Mobile preview must be pre-painted rather than swapping React iframe content');
assert.match(motion,/if\(!staticMobileAtLoad\)mountDemoFrames\(\)/,
  'Mobile must not mount heavyweight React preview frames');
assert.doesNotMatch(motion,/n\.el\.style\.visibility=distance/,
  'Safari should not toggle story panel visibility during scroll');
assert.match(showcase,/\.experience\.is-scroll #flight-path\s*\{[^}]*stroke-width: 3\.25px/s);

// Execute the ACTUAL rail functions to catch a return to resetting every
// panel at the top rather than physically lifting one column of content.
const railStart=motion.indexOf('const railPanelTop=');
const railEnd=motion.indexOf('function layoutRail(){',railStart);
assert.ok(railStart>0&&railEnd>railStart);
const rail=runInNewContext(motion.slice(railStart,railEnd)+
  '\n({railPanelTop,railOffset})', {});
for(const h of [760,940]){
  for(let i=0;i<6;i++){
    const top=rail.railPanelTop(i,h);
    assert.equal(top,i*h);
    assert.equal(top+rail.railOffset(i-1,h),h, 'Next panel waits below');
    assert.equal(top+rail.railOffset(i,h),0, 'Panel arrives at top under native scroll');
    assert.equal(top+rail.railOffset(i+1,h),-h, 'Previous panel rises off screen');
  }
  for(let p=0;p<6;p+=.02){
    assert.ok(rail.railOffset(p+.02,h)<rail.railOffset(p,h),
      'Rail must always rise with forward scrolling');
  }
}

// Execute the source geometry rather than a hand-written approximation.
// Each chapter is one alternating horizontal swing. Its Y coordinate NEVER
// goes upward on the forward journey (and ascends on rewind).
const geoStart=motion.indexOf('function flightAmplitude(');
const geoEnd=motion.indexOf('function rocketStart(){',geoStart);
assert.ok(geoStart>0&&geoEnd>geoStart);
const flight=runInNewContext(
  'const chapterCount=6;const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));\n'+
  motion.slice(geoStart,geoEnd)+'\n({flightAmplitude,descentPoint,descentTangent,rocketHeading,trailOrigin})',{Math}
);
for(const {w,h} of [{w:1280,h:800},{w:390,h:844}]){
  const amplitude=flight.flightAmplitude(w);
  if(w>=730) {
    const formerlyWide=Math.min(w*.29,390);
    assert.ok(amplitude<formerlyWide*.85,'Desktop arc must be visibly narrower than previous overly wide version');
    assert.ok(amplitude>formerlyWide*.55,'Desktop still needs a readable lateral arc');
  } else {
    assert.equal(amplitude,Math.min(w*.225,125),'Mobile retains its approved generous arc');
  }
  assert.ok(amplitude<w*.34,'Do not clip the rocket near either viewport edge');
  const overallDrop=flight.descentPoint(6,w,h).y-flight.descentPoint(0,w,h).y;
  assert.ok(overallDrop>=h*.66,'The rocket must travel much farther down vertically than before');
  for(let i=0;i<6;i++){
    const drop=flight.descentPoint(i+1,w,h).y-flight.descentPoint(i,w,h).y;
    assert.ok(drop>=h*.11,'Each chapter must show a meaningful downward displacement');
  }

  let previous=-Infinity;
  for(let j=0;j<=1200;j++){
    const p=6*j/1200;
    const point=flight.descentPoint(p,w,h,0);
    assert.ok(point.y>previous-1e-8,'Rocket must never rise in the viewport');
    previous=point.y;
    assert.ok(point.x>=w*.17&&point.x<=w*.83,'Wider arcs must still leave safe side margins');
    const reversed=flight.descentPoint(p,w,h,1);
    assert.ok(Math.abs(reversed.y-point.y)<1e-8,'Return lane preserves vertical travel');
    assert.ok(Math.abs(reversed.x+point.x-w)<1e-7,'Return path mirrors x coordinates');
    const tangent=flight.descentTangent(p,w,h);
    assert.ok(tangent.y>0,'Always a downward tangent, never a vertical stall');
  }
  for(let i=0;i<6;i++){
    const middle=flight.descentPoint(i+.5,w,h);
    assert.ok((middle.x-w*.5)*(i%2===0?1:-1)>w*.08,
      'Chapter '+i+' must alternate right and left');
    const join=flight.descentPoint(i+1,w,h);
    assert.ok(Math.abs(join.x-w*.5)<1e-7,'No x teleport at chapter joins');
    const before=flight.descentPoint(i+1-1e-6,w,h);
    assert.ok(Math.hypot(join.x-before.x,join.y-before.y)<.005,
      'Continuous path at chapter boundary');
  }
  assert.ok(flight.descentPoint(6,w,h).y-flight.descentPoint(0,w,h).y>=h*.66,
    'The nose slowly descends while the page rises behind it');
  // The sprite art points up when unrotated: its rotated heading must have
  // the same horizontal sign as the forward tangent, and the opposite sign
  // on rewind. Test BOTH alternating sides, desktop and phone geometry.
  for (const p of [.25,.75,1.25,1.75,2.25,3.25,4.75,5.25]) {
    const vx=flight.descentTangent(p,w,h,0).x;
    for (const direction of [1,-1]) {
      const radians=flight.rocketHeading(p,w,h,direction,0)*Math.PI/180;
      const noseX=Math.sin(radians),noseY=-Math.cos(radians);
      assert.ok(noseX*vx*direction>0,
        'Rocket nose must match horizontal movement at '+p+' direction '+direction);
      assert.ok(noseY*direction>0,
        'Rocket must point down in forward scroll and up on rewind');
    }
  }
  for (const p of [.5,1.5,2.5,3.5,4.5,5.5]) {
    for (const direction of [1,-1]) {
      const start=flight.trailOrigin(p,direction);
      assert.ok(Math.abs(p-start)>=Math.min(.84,direction<0?6-p:p)-1e-8,'Tail must span available flight history');
      let total=0,prev=flight.descentPoint(start,w,h,0);
      for(let i=1;i<=64;i++){
        const current=flight.descentPoint(start+(p-start)*i/64,w,h,0);
        total+=Math.hypot(current.x-prev.x,current.y-prev.y);
        prev=current;
      }
      assert.ok(total>(Math.abs(p-start)<.8?28:65), 'Trail must leave a visible arc beyond the sprite at p='+p+' size='+w+'x'+h);
    }
  }

}
assert.match(motion,/paintTitle\(nodes\[index\],1,shots\[index\]\.titleMode\)/);
assert.match(motion,/const previewFade=clamp\(\(\.48-distance\)\/\.22\)/,
  'Shared iframe handoff must be hidden while switching panels');
assert.match(motion,/if\(e\.key!=='ArrowLeft'&&e\.key!=='ArrowRight'\)return/,
  'Vertical keyboard scrolling must remain native');
const rocket = await readFile(new URL('assets/brief2done/rocket-flight.svg', root), 'utf8');
assert.match(rocket, /viewBox="0 0 120 220"/);
assert.match(rocket, /Entire cone flame: an unbroken silhouette ending at a single tip/);
assert.match(rocket, /60 219/, 'Flame must reach its complete conical tip');
assert.match(rocket, /id="flame-core"/);
assert.match(html, /<img src="\.\.\/assets\/brief2done\/rocket-flight\.svg"/);
assert.doesNotMatch(html, /rocket-fire-cut|rocket-body-cut/, 'Broken logo cropping masks must be removed');
for (const id of ['rocket-guide', 'flight-trace', 'flight-glow', 'flight-path', 'story-prev', 'story-next', 'closing', 'story-replay']) {
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
console.log('PASS: mobile fixed-viewport fades, continuously prepainted panels, slower native scroll, smoother desktop arc and larger vertical flight, payment and other assets.');
