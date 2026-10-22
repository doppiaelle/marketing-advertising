# DoubleL product pages

Pagine informative dei prodotti DoubleL: LL Platform, Focus, ACN, Kritoma e SecuRA.
Il sito è statico e viene pubblicato dalla CI GitHub Pages all'indirizzo:

`https://doppiaelle.github.io/marketing-advertising/`

Il repository resta separato da `DOUBLEL-SITE`, che collega ciascuna scheda
prodotto alla relativa pagina informativa. Gli eventuali link alle applicazioni
reali compaiono qui, non nella landing principale.

## Struttura

```text
public/
  index.html
  ll-platform/index.html
  focus/index.html
  acn/index.html
  kritoma/index.html
  secura/index.html
  assets/doublel-logo.png
  assets/acn-logo-dark.png
  assets/acn-logo-light.png
  assets/acn.css
  assets/acn.js
  assets/acn-mono-latin.woff2
  assets/kritoma-logo.png
  assets/kritoma-worlds.svg
  assets/ll-hero-constellation.webp
  assets/ll-mascot-secure.webp
  assets/ll-mascot-ai.webp
  assets/ll-frog-mark.png
  assets/product-pages.css
  assets/product-pages.js
  assets/ll-platform.css
```

Tutte le pagine condividono una base CSS mobile-first e la stessa navigazione:
nome del prodotto in testata, accesso all'indice e firma «by DoubleL» nel footer.
Le pagine sono documenti HTML statici, senza controlli applicativi. Un piccolo
script condiviso gestisce soltanto le animazioni progressive e riattivabili allo
scroll, rispettando la preferenza di sistema per la riduzione del movimento.

La vetrina LL Platform include un'illustrazione animata e supporto reduced-motion.
La vetrina ACN ha uno stile autonomo e minimale, con i loghi trasparenti scuro e
chiaro, un carattere monospace servito localmente e un esploratore del ciclo di
clearing. I cinque passaggi sono illustrativi: non inviano richieste né eseguono
transazioni. Con JavaScript disabilitato restano leggibili tutti i passaggi e
l'esempio SDK. I contenuti seguono SDK 0.4.0: ispezione del buyer, dispute gestite
dal supporto ACN e pagamenti sandbox sintetici.
Le anteprime Studio, Console
e Analytics sono ricostruzioni HTML/CSS delle rispettive interfacce nei repository
LL-WEB, LL-DASHBOARD e LL-ANALYTICS, con dati esclusivamente illustrativi.
Non espongono login, chiamate API o comandi operativi.

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
