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
// The guided story is intentionally shorter and cannot skip multiple chapters per wheel gesture.
const motion = await readFile(new URL('assets/brief2done/motion.js', root), 'utf8');
const showcase = await readFile(new URL('assets/brief2done/showcase.css', root), 'utf8');
const scenes = motion.match(/\{source:(?:0|6|1|8|2|5),label:/g) || [];
assert.equal(scenes.length, 6, 'The walkthrough should contain six readable steps');
for (const id of ['rocket-guide', 'flight-trace', 'story-prev', 'story-next', 'story-step-counter', 'story-hint']) {
  assert.ok(html.includes('id="'+id+'"'), 'Missing guided story element: '+id);
}
for (const token of ['onWheel(e)', 'onTouchStart(e)', 'onTouchEnd(e)', 'requestStep(dir', 'updateFlight(t)', 'landingScale', 'closing-brand-icon', 'prefers-reduced-motion']) {
  assert.ok((motion+showcase).includes(token), 'Missing guided story behavior: '+token);
}
assert.match(html, /viewBox="312 45 190 220"/);
assert.match(html, /brief2done-icon\.png" width="500" height="500" clip-path/);
assert.match(html, /class="story-portal".*>Get started<\/span>/);
assert.match(html, /Create your account/);
assert.match(showcase, /\.experience\.is-scroll \{ height: 100dvh;/);

const legacy = await readFile(new URL('taskhub/index.html', root), 'utf8');
assert.ok(legacy.includes('../brief2done/'));
assert.ok(legacy.includes('location.search+location.hash'));
console.log('PASS: Brief2Done assets, six-step journey, rocket/logo docking, accessible navigation, portal entry, synchronized demo frames and legacy redirect.');
