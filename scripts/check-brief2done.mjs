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
assert.match(motion, /const position=sampleFlight\(progress\)/);
assert.match(motion, /tip\.style\.opacity=String\(depart/);
assert.match(motion, /flightDirection<0\?-yaw:180-yaw/, 'Reverse points the nose upward');
assert.match(motion, /mirrorMix\+=\(reverse-mirrorMix\)/, 'Return path mirrors smoothly');
assert.match(motion, /flightDirection<0\?Math\.min\(chapterCount,progress\+\.17\)/,
  'Reverse trail should follow the rocket, not lead it');
assert.match(motion, /paintTitle\(nodes\[index\],1,shot\.titleMode\)/, 'Simplified static titles');
assert.match(motion, /compose\(index,\.68\)/, 'No aggressive screen whip on chapter changes');
assert.match(motion, /const enter=reduced\.matches\?1:ease\(\(p-\(chapterCount-\.49\)\)\/\.46\)/,
  'Closing reveal must follow scroll, not a multi-second timer');

// Test the *actual* pure geometry functions extracted from the browser source,
// including both lanes and their shared anchors, rather than a copy of the math.
const geomStart = motion.indexOf('function cubicPoint(');
const geomEnd = motion.indexOf('// There is no camera subtraction.', geomStart);
assert.ok(geomStart > 0 && geomEnd > geomStart, 'Cannot locate flight geometry');
const geometry = runInNewContext(
  motion.slice(geomStart, geomEnd) + '\n({cubicPoint,cubicTangent})',
  {Math}
);
const start = {x: 880, y: 92};
const end = {x: 490, y: 645};
const anchors = [start];
for (let i = 1; i < 6; i++) {
  anchors.push({x:i%2===0?780:220,y:start.y+(end.y-start.y)*i/6});
}
anchors.push(end);
const segments = [];
for (let i = 0; i < 6; i++) {
  const a=anchors[i],d=anchors[i+1],dy=d.y-a.y;
  segments.push({a,d,bow:i%2===0?-200:200,b:{y:a.y+dy/3},c:{y:d.y-dy/3}});
}
for (const mirror of [0,1]) {
  for (let i=0; i<segments.length;i++) {
    let previousY=-Infinity;
    for (let k=0;k<=100;k++) {
      const p=geometry.cubicPoint(segments[i],k/100,mirror);
      assert.ok(p.y>=previousY-1e-6, 'Forward flight must descend without ascending');
      previousY=p.y;
    }
    if (i>0) {
      const a=geometry.cubicPoint(segments[i-1],1,mirror);
      const b=geometry.cubicPoint(segments[i],0,mirror);
      assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-8,'No discontinuity at a chapter join');
      const da=geometry.cubicTangent(segments[i-1],1,mirror);
      const db=geometry.cubicTangent(segments[i],0,mirror);
      assert.ok(Math.hypot(da.x-db.x,da.y-db.y)<1e-7,'No velocity stop at chapter join');
      assert.ok(Math.hypot(db.x,db.y)>100,'The rocket must not stall at a chapter start');
    }
  }
}
assert.match(showcase, /\\.rocket-guide\s*\\{\s*opacity: 0;/,
  'The rocket must be invisible before the first scroll');
assert.match(showcase, /\\.rocket-guide img\s*\\{[^}]*transition: transform/s,
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
console.log('PASS: Brief2Done native scroll and immediate response, seamless six-stage descent, mirrored reverse flight, header launch fade, calm scene transitions, assets and footer lock.');
