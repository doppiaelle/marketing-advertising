import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

for (const product of ['feeddy', 'focus', 'taskhub', 'll-platform', 'acn', 'kritoma', 'secura']) {
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
  assert.ok(html.includes('href="../assets/contact-links.css"'));
  if (product === 'secura') {
    for (const intent of ['environment', 'remediation']) assert.ok(links.some(link => link.searchParams.get('intent') === intent));
    for (const anchor of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)) {
      if (anchor[0].includes('Let’s talk')) assert.ok(anchor[0].includes('#contatti'));
    }
  }
}
assert.ok((await stat(new URL('../public/assets/contact-links.css', import.meta.url))).isFile());
console.log('PASS: all seven product pages link to the official contact form, with product, language and information/support context; SecuRA CTAs keep their specific intent.');
