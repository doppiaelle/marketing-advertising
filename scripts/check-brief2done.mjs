import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

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
assert.match(motion, /queuedFirstGesture/, 'A first gesture during loading must not be lost');
assert.match(motion, /startGesture=now-wheelLast>480/, 'Trackpad inertia must not skip chapters');
assert.match(motion, /const fast=clamp\(part\/\.68\)/, 'Rocket should move ahead of the informational pacing');
assert.match(motion, /function catmull\(/, 'Flight should use smooth multi-curve paths');
assert.match(motion, /Math\.min\(pts\.length-1,j\+2\)/, 'Curves must join without discontinuity');
assert.match(motion, /sampleFlight\(start\+\(flown-start\)\*j\/n\)/, 'Trail must be a fading recent-path window');
for (const id of ['rocket-guide', 'flight-trace', 'flight-path', 'story-prev', 'story-next', 'closing', 'story-replay']) {
  assert.ok(html.includes('id="'+id+'"'), 'Missing guided flight element: '+id);
}
assert.match(html, /id="rocket-trail-gradient"/);
assert.match(html, /id="rocket-fire-cut"/);
assert.match(html, /id="rocket-body-cut"/);
assert.match(html, /viewBox="242 43 263 350"/);
assert.match(html, /id="story-prev"[^>]*aria-label="Previous chapter"/);
assert.match(html, /id="story-next"[^>]*aria-label="Next chapter"/);
assert.ok(!html.includes('class="story-step-info"'), 'Remove the large Next/progress bar');
assert.match(showcase, /height: var\(--journey-height, 700dvh\)/);
assert.match(showcase, /\.experience\.is-scroll \.shell \{\s*position: sticky;/);
assert.match(showcase, /\.is-closing \.story-nav \{ display: flex; \}/);
assert.match(showcase, /stroke: url\(#rocket-trail-gradient\)/);
assert.match(showcase, /width: 73px;\s*height: 92px;/);
assert.match(html, /class="story-portal".*>Get started<\/span>/);
assert.match(html, /Create your account/);

const legacy = await readFile(new URL('taskhub/index.html', root), 'utf8');
assert.ok(legacy.includes('../brief2done/'));
assert.ok(legacy.includes('location.search+location.hash'));
console.log('PASS: Brief2Done sticky native-scroll journey, uninterrupted curved rocket with original flame, fading trail, compact arrows, footer lock and legacy redirect.');
