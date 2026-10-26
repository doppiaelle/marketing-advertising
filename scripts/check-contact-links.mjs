import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

for (const product of ['feeddy', 'focus', 'brief2done', 'll-platform', 'acn', 'kritoma', 'secura']) {
  const html = await readFile(new URL(`../public/${product}/index.html`, import.meta.url), 'utf8');
  const links = [...html.matchAll(/href="([^"]*#contatti)"/g)].map(match => new URL(match[1].replaceAll('&amp;', '&')));
  assert.ok(links.length >= 2, `Information and support links required for ${product}`);
  for (const link of links) {
    assert.equal(link.origin, 'https://official.doppiaelletech.workers.dev');
    assert.equal(link.searchParams.get('product'), product);
    assert.equal(link.searchParams.get('lang'), 'en');
    assert.equal(link.hash, '#contatti');
  }
  assert.ok(links.some(link => link.searchParams.get('intent') === 'info'));
  assert.ok(links.some(link => link.searchParams.get('intent') === 'support'));
  assert.ok(html.includes('href="../assets/product-footer.css"'));
  assert.equal((html.match(/class="product-footer"/g) || []).length, 1);
  assert.ok(!html.includes('product-contact-links'), 'No extra contact pre-footer');
  const footer = html.slice(html.lastIndexOf('<footer'));
  assert.ok(html.lastIndexOf('</main>') < html.lastIndexOf('<footer'), 'The footer must follow the complete story');
  assert.ok(footer.includes('class="product-footer-brand"') && footer.includes('class="product-footer-by"'));
  const nav = footer.match(/<nav[\s\S]*?<\/nav>/)[0];
  assert.deepEqual([...nav.matchAll(/<a[^>]+>([^<]+)/g)].map(m => m[1].trim()), ['Support', 'Contact', 'All Products']);
  for (const [, asset] of footer.matchAll(/src="\.\.\/([^"]+)"/g)) assert.ok((await stat(new URL('../public/' + asset, import.meta.url))).isFile());
  if (product === 'secura') {
    for (const intent of ['environment', 'remediation']) assert.ok(links.some(link => link.searchParams.get('intent') === intent));
    for (const anchor of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)) {
      if (anchor[0].includes('Let’s talk')) assert.ok(anchor[0].includes('#contatti'));
    }
  }
}
const css = await readFile(new URL('../public/assets/product-footer.css', import.meta.url), 'utf8');
const light = hex => { const rgb = hex.match(/[a-f0-9]{2}/gi).map(x => parseInt(x,16)/255).map(x => x <= .04045 ? x/12.92 : ((x+.055)/1.055)**2.4); return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722; };
for (const rule of css.matchAll(/\.product-footer(?:\[data-product="[^"]+"\])? \{([^}]+)\}/g)) {
  const vars = Object.fromEntries([...rule[1].matchAll(/--footer-(bg|text|accent): (#[a-f0-9]{6})/g)].map(m => [m[1], m[2]]));
  for (const key of ['text', 'accent']) { const values = [light(vars.bg), light(vars[key])].sort((a,b) => b-a); assert.ok((values[0]+.05)/(values[1]+.05) >= 4.5, 'Footer text and hover colors need readable contrast'); }
}
console.log('PASS: one normal-flow footer on all seven product pages, original logos, Support/Contact/All Products links, product presets, themed hover contrast >= 4.5:1 and specific SecuRA CTAs.');
