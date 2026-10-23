# DoubleL product pages

Pagine informative dei prodotti DoubleL: Feeddy, LL Platform, Focus, ACN, Kritoma e SecuRA.
Il sito è statico e viene pubblicato dalla CI GitHub Pages all'indirizzo:

`https://doppiaelle.github.io/marketing-advertising/`

Il repository resta separato da `DOUBLEL-SITE`, che collega ciascuna scheda
prodotto alla relativa pagina informativa. Gli eventuali link alle applicazioni
reali compaiono qui, non nella landing principale.

## Struttura

```text
public/
  index.html
  feeddy/index.html
  ll-platform/index.html
  focus/index.html
  acn/index.html
  kritoma/index.html
  secura/index.html
  assets/doublel-logo.png
  assets/acn-logo-dark.png
  assets/acn-logo-light.png
  assets/acn-logo-loop.mp4
  assets/acn-logo-poster.webp
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
Il logo principale usa un video H.264 muto di 4 secondi, 1080 × 1200 a 60 fps,
con poster statico e comando pausa/ripresa. Il video viene caricato soltanto
quando è visibile e il sistema non richiede la riduzione del movimento; si
ferma fuori schermo o quando la pagina non è attiva. Vedi
[preparazione e verifica del video](docs/acn-logo-video.md) per provenienza,
interventi e limiti dell'elaborazione.
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

## Vetrina SecuRA

SecuRA ha un'identità dedicata bianca/argento/rosso, con font locali Oxanium e
Manrope, logo trasparente con raggi e scena di apertura interattiva su desktop.
Su mobile riutilizza la scena web in loop automatico, con raggi interamente visibili
e sospensione del rendering fuori schermo. Non carica video.
La preview illustrativa comprende Dashboard, Vulnerabilità e Campagne.
La pagina rimane interamente statica e conserva il deploy GitHub Pages esistente.
Vedi [asset, animazioni e verifiche](docs/secura-branding.md).

## Vetrina Feeddy

Feeddy ha una pagina dedicata con Manrope locale, antracite e oro del tool,
illustrazioni cartoon e anteprime interattive di editor, calendario e risultati.
L’intro HTML fornita si riproduce automaticamente, senza cornice o controlli della
demo, e approda al logo originale con il titolo centrato sotto. Rispetta le
preferenze di movimento ridotto e sospende il rendering fuori vista.
Vedi [identità, intro e collegamenti](docs/feeddy-showcase.md).
