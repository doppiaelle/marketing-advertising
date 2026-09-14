# DoubleL product pages

Pagine informative dei prodotti DoubleL: Focus, ACN, Kritoma e VulnTracker.
Il sito è statico e viene pubblicato dalla CI GitHub Pages all'indirizzo:

`https://doppiaelle.github.io/marketing-advertising/`

Il repository resta separato da `DOUBLEL-SITE`, che collega ciascuna scheda
prodotto alla relativa pagina informativa. Gli eventuali link alle applicazioni
reali compaiono qui, non nella landing principale.

## Struttura

```text
public/
  index.html
  focus/index.html
  acn/index.html
  kritoma/index.html
  vulntracker/index.html
  assets/doublel-logo.png
  assets/kritoma-logo.png
  assets/kritoma-worlds.svg
  assets/product-pages.css
  assets/product-pages.js
```

Tutte le pagine condividono una base CSS mobile-first e la stessa navigazione:
nome del prodotto in testata, accesso all'indice e firma «by DoubleL» nel footer.
Le pagine sono documenti HTML statici, senza controlli applicativi. Un piccolo
script condiviso gestisce soltanto le animazioni progressive e riattivabili allo
scroll, rispettando la preferenza di sistema per la riduzione del movimento.

## Deploy principale

Il workflow `.github/workflows/pages.yml` pubblica `public/` su GitHub Pages a
ogni push su `main`. È disponibile anche l'avvio manuale da GitHub Actions.

## Cloudflare opzionale

`wrangler.toml` conserva una configurazione assets-only utilizzabile come
canale alternativo con `wrangler deploy`. Gli URL del sito DoubleL puntano però
alla pubblicazione GitHub Pages gestita dalla CI.

## Sviluppo locale

Aprire `public/index.html` oppure servire la cartella `public/` con un server
HTTP statico. Non sono richiesti build, dipendenze o runtime lato server.
