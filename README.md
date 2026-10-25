# DoubleL product pages

Pagine informative dei prodotti DoubleL: Feeddy, LL Platform, Focus, ACN, Kritoma, SecuRA e taskhub.
Il sito è statico e viene pubblicato dalla CI GitHub Pages all'indirizzo:

`https://doppiaelle.github.io/marketing-advertising/`

Il repository resta separato da `DOUBLEL-SITE`, che collega ciascuna scheda
prodotto alla relativa pagina informativa. Gli eventuali link alle applicazioni
reali compaiono qui, non nella landing principale.

Le sette vetrine collegano il modulo del sito ufficiale a `#contatti`, passando
`product`, `intent` e `lang=en` per preparare il messaggio. SecuRA distingue anche
integrazione nell'infrastruttura e remediation. I link funzionano senza JavaScript;
il selettore EN/IT del sito ufficiale traduce il messaggio iniziale conservando le
modifiche del visitatore. Verifica: `node scripts/check-contact-links.mjs`.

Tutte le vetrine, incluse Focus e LL Platform temporaneamente nascoste dal catalogo,
usano un solo footer condiviso: logo prodotto a sinistra, «by DoubleL» al centro,
Support / Contact / All Products a destra. `assets/product-footer.css` gestisce
struttura responsive e palette specifiche. I colori di testo e hover hanno un
contrasto di almeno 4,5:1 con lo sfondo del relativo footer. Il precedente blocco
contatti separato è rimosso. In taskhub il footer segue l'intera sequenza di scroll
ed è nel flusso del documento: non è fisso e non si sovrappone alla scena finale.

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
  taskhub/index.html
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
  assets/catalog.css
  assets/navigation-lockup.svg
  assets/doublel-frog.png
  assets/product-pages.css
  assets/product-pages.js
  assets/ll-platform.css
```

L'indice è un catalogo compatto in inglese, con palette, tipografia e righe
editoriali riprese da `DOUBLEL-SITE`. Le categorie sono **Digital workspaces**
(Feeddy, Focus, taskhub), **Software & infrastructure** (LL Platform, SecuRA, ACN) e
**Games & interactive experiences** (Kritoma). Ogni riga collega la vetrina del
prodotto, usa il logo disponibile e ne descrive brevemente l'ambito. Il footer
mantiene la firma «by DoubleL» e il collegamento al sito ufficiale, come le
vetrine già rivisitate.

Il catalogo usa `assets/catalog.css` e `assets/ui-icons.css`, senza JavaScript o dipendenze
esterne. Classi e variabili hanno il prefisso `catalog-` per facilitarne un
futuro riuso nel sito ufficiale. I collegamenti ai prodotti e agli asset sono
relativi alla cartella `public/`; in caso di importazione in un percorso diverso
vanno mantenuti o adattati. Il logo esteso in testata è lo stesso SVG statico
generato da `DOUBLEL-SITE/scripts/prepare-navigation-brand.mjs`, con il PNG
originale incorporato e la sua correzione colore. Anche ingombri e scale
responsive seguono `DOUBLEL-SITE/src/styles/navigation-brand.css`, senza
importare l'animazione di passaggio al simbolo singolo.
La navbar mantiene l'altezza del sito ufficiale (86 px desktop, 76 px mobile),
gli stessi margini responsive e il limite di larghezza di 1280 px anche su
schermi ultra-wide. Lo stesso limite vale per il contenuto del catalogo.
Anche la favicon usa il file originale `DOUBLEL-SITE/public/brand/doublel-frog.png`.
La testata contiene solo Products a destra; il contenitore usa la spaziatura
della navbar senza sommare i margini della griglia dei contenuti, anche su mobile.
Le frecce del catalogo e delle vetrine sono SVG monocromatici condivisi, così
mantengono lo stesso disegno anche sui dispositivi che usano emoji per i glifi.
Le vetrine conservano CSS e comportamenti dedicati.
Le pagine sono documenti HTML statici. Il piccolo script condiviso delle vetrine
gestisce le animazioni progressive allo scroll e rispetta reduced-motion.

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

## Vetrina Kritoma

Kritoma usa una direzione dedicata ciano/magenta/giallo su blu notte: terreno
in CSS 3D, sequenza Mano/Luogo/Azione/Extra, particelle canvas e carte HTML.
Fronti illustrativi con concept generici e retro semplice con logo originale
sostituiscono le grafiche demo. La pagina include approfondimenti sulle
interazioni e un selettore illustrativo dei dodici Ambiti, con formati 40/60
carte e soglie 15/20 PV. Rispetta reduced-motion e sospende la scena fuori vista.
Vedi [fonti, animazioni e prompt delle illustrazioni](docs/kritoma-showcase.md).

## Vetrina taskhub

taskhub entra nel catalogo Digital workspaces con una vetrina a tutto schermo:
otto scene dell'HTML fornito, scroll nativo con durate ponderate e un finale verde
in cui una card scura sale al centro. Il pulsante apre l'installazione pubblica.
I font e le schermate illustrative sono risorse locali, senza dipendenze di build.
Due sole interfacce persistenti servono tutte le scene, senza creare un'app per
ogni estratto. Le interfacce sospendono gli aggiornamenti nel finale; i salti
rapidi nello scroll non attraversano i capitoli saltati.
Sono disponibili navigazione da tastiera, versione con movimento ridotto e
contenuto alternativo senza JavaScript o in caso di mancato caricamento.
Vedi [sequenza, ritmo e verifiche](docs/taskhub-showcase.md).

## Prodotti temporaneamente nascosti dal catalogo

Focus e LL Platform restano nell’HTML di `public/index.html`, ma i rispettivi `li` hanno `hidden` e `data-product`. Le pagine `public/focus/index.html` e `public/ll-platform/index.html` sono conservate. Il catalogo mostra 2 prodotti Digital workspaces e 2 Software & infrastructure. Per riattivare una voce rimuovere soltanto `hidden` dal relativo `li` e aggiornare il conteggio della categoria. In DOUBLEL-SITE la visibilità corrispondente si controlla con `hidden` in `src/productCatalog.ts`.
