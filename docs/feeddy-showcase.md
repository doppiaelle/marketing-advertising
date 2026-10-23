# Feeddy · sito vetrina

Pagina: `public/feeddy/index.html`. Usa il deploy GitHub Pages esistente di
`public/`, senza build o dipendenze aggiuntive. L’indice prodotti include Feeddy.

## Identità e provenienza

- Logo originale da `marketing-agent/frontend/public/brand/feeddy-logo.png`.
  È identico al PNG incorporato nell’HTML fornito dall’utente, verificato con SHA-256.
- Manrope variabile e licenza OFL dal medesimo frontend, serviti localmente.
- Colori del tool: antracite `#111318`, oro `#edc577`, wordmark `#f5f1e7`.
  Carta, menta e lilla completano le illustrazioni della vetrina.
- Paesaggi, post, materiali, calendario e approvazioni sono illustrazioni originali
  SVG/HTML/CSS. Le interfacce riprendono editor, calendario, risultati e copilot
  del prodotto; Atlas Studio, conversazione e metriche sono esempi dichiarati.
  Nessuna API, pubblicazione o autenticazione avviene nella vetrina.

## Intro

L’animazione è estratta da `feeddy-motion-v2-demo.html`, fornito il 23 ottobre 2026.
`assets/feeddy/motion.css` e `motion.js` conservano il percorso pinball, le icone,
la scia canvas e il logo originale. Il PNG incorporato diventa un asset locale.
Shell della demo, bordi, label, stato e pulsanti esterni vengono rimossi.

Riproduzione automatica unica di circa 9,3 secondi. Al reveal, il logo rimane
visibile e il titolo e i contenuti della hero entrano progressivamente sotto.
La durata segue il tempo effettivo anche su dispositivi con frame rate ridotto.
Lo scroll rimane libero. I link interni consentono di saltare subito al prodotto.
Sono disponibili comandi accessibili da tastiera per salto e pausa dell’intro.
Fuori vista e a scheda nascosta il rendering si sospende, senza ripartire da capo.
Con `prefers-reduced-motion` si mostra direttamente la composizione finale.
Senza JavaScript, logo e informazioni restano leggibili, così come tutti i pannelli
dimostrativi e le FAQ native.

## Collegamenti

URL confermati dall’utente:

- Tool: `https://feeddy-dev.duckdns.org/`.
- Accesso: `https://feeddy-dev.duckdns.org/#accesso`.
- Registrazione: `/register` sullo stesso servizio, percorso presente nel router
  del tool. La disponibilità dipende dalla configurazione del gestore.

La schermata di accesso in `marketing-agent` rinvia a
`https://doppiaelle.github.io/marketing-advertising/feeddy/` per le informazioni.
Pubblicare questa pagina prima di distribuire il frontend aggiornato del tool.

## Verifica locale

Servire `public/` con un server HTTP statico e aprire `/feeddy/`. Le tab Editor,
Calendario e Risultati supportano click, frecce sinistra/destra, Home/End e ARIA.
Le FAQ usano `details/summary`. Verificare desktop e mobile, intro, link, font,
assenza di scroll orizzontale e layout senza animazioni.

Per il frontend del tool usare Node >=22.22.0 come indicato in `package.json`.
La build di produzione è stata verificata con Node 24.22.1; il Node 20 predefinito
di questa macchina non è compatibile con Vite 8.

Verifiche eseguite il 23 ottobre 2026: risposta HTTP 200 della pagina; sintassi dei
due script; presenza di asset e destinazioni delle ancore; ID HTML unici; controllo
visivo a 1280×720 e 390×844 senza sbordi orizzontali; arrivo automatico al logo;
selezione delle tre tab via mouse e freccia destra. Accesso e registrazione del
tool verificati su build locale con risposta dimostrativa di `/auth/status`, in
italiano e inglese. Nessuna registrazione o autenticazione reale eseguita.
