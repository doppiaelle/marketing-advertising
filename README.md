# product-pages

Pagine informative dei prodotti DoubleL (Focus, ACN, Kritoma, VulnTracker):
spiegano cosa fa ogni prodotto senza portare all'app vera. Sito statico,
deployato come Cloudflare Worker (assets-only), stesso meccanismo del sito
principale `official.doppiaelletech.workers.dev` — repo separato, non tocca
`DOUBLEL-SITE`.

## Struttura

```
public/
  index.html          hub con i link alle 4 pagine
  focus/index.html
  acn/index.html
  kritoma/index.html      (placeholder, in lavorazione)
  vulntracker/index.html  (placeholder, in lavorazione)
  assets/doublel-logo.png
wrangler.toml
```

## Deploy

Richiede un account Cloudflare con Workers abilitato (login locale con
`wrangler login`, non servono token condivisi in questo repo).

```bash
npm install -g wrangler   # se non già installato
wrangler login
wrangler deploy
```

Il primo deploy assegna un URL tipo `product-pages.<tuo-subdomain>.workers.dev`.
Per un dominio/percorso diverso (es. un sottodominio di doppiaelletech.dev),
va configurata una route in `wrangler.toml` o dal dashboard Cloudflare.

## Sviluppo locale

```bash
wrangler dev
```
