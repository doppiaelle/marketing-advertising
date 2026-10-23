# SecuRA — identità e interazione

La vetrina è `public/secura/index.html`, con fogli di stile e script dedicati `public/assets/secura.css` e `public/assets/secura.js`. Rimane un sito statico, pubblicabile dalla CI GitHub Pages esistente: nessuna dipendenza, build, API o servizio esterno aggiunto.

La lingua predefinita è l’inglese nell’HTML (`lang="en"`), senza dipendere dal
browser o da JavaScript. Sono tradotti contenuti, anteprime, metadati, nomi
accessibili e messaggi dinamici della scansione.

## Asset

Gli allegati originali sono conservati in `public/assets/secura/`:

- `secura-robot.png`: robot senza raggi, base condivisa della scena web desktop/mobile.
- `secura-scan.png`: originale con raggi.
- `secura-lockup.png`: firma ufficiale estesa.
- `secura-scan.mp4`: video originale 1280 × 720, conservato come riferimento; non viene più caricato dalla pagina.
- `secura-mark-scan.png`: estrazione RGBA con raggi, condivisa da testata, anteprima dashboard, riquadro «La tua infrastruttura», footer e favicon. Nessuna tessera bianca intorno al marchio.

Manrope e Oxanium sono serviti localmente; le licenze OFL sono incluse. Il wordmark originale resta disponibile come immagine. Oxanium è un abbinamento visivo al lettering, non un'identificazione del carattere originale.

## Scansione desktop

Il robot grande in apertura usa l'originale senza raggi; i raggi SVG si attivano al primo movimento del puntatore nella sezione o allo scroll. I due pivot seguono le pupille nelle coordinate originali (525, 532) e (854, 532). Gli angoli centrali sono limitati a ±34° dalla verticale, con semiapertura di circa 18,3°: nessun bordo supera i circa 52,3° rispetto alla verticale. Il puntatore sopra gli occhi, l'uscita dalla sezione o la perdita del focus riportano l'obiettivo alla posizione originale. L'interpolazione usa requestAnimationFrame soltanto durante il movimento.

Le sezioni emergono dal basso con un sottile passaggio luminoso. Dopo la prima comparsa rimangono leggibili. Senza JavaScript i contenuti e tutte le viste illustrative restano disponibili.

## Mobile e accessibilità

La stessa scena HTML/SVG viene usata su desktop e mobile. Su schermi fino a 760 px o con puntatore coarse/assente, il loop parte automaticamente senza trigger: in 8,4 secondi i raggi convergono, scandiscono lateralmente e tornano alla posizione originale, accompagnati da una leggera rotazione prospettica e oscillazione del robot. Immagine e raggi condividono lo stesso contenitore trasformato, mantenendo gli occhi allineati ai pivot. La scena mantiene il canvas completo e spazio per l'intera lunghezza dei raggi; nessun video viene inserito o richiesto.

Non esiste un controllo di pausa. Il rendering si sospende quando la scena è fuori schermo o la pagina è nascosta, conservando la fase del ciclo; riparte automaticamente al ritorno. Reduced-motion mantiene il robot statico. Le schede della preview supportano frecce, Home ed End; il link iniziale consente di saltare la scena. Sotto il payoff compare soltanto una freccia rossa centrata, con nome accessibile «Scopri SecuRA».

La dashboard è una ricostruzione illustrativa con tre viste: Dashboard, Vulnerabilities, Campaigns. I numeri e i sistemi mostrati sono esempi. Nessun collegamento all'app reale.

## Estrazione trasparente

Strumento: ImageGen integrato, modalità edit/background-extraction, `transparent_background: true`.

Input: `39E062EC-C34B-4DA9-8ED1-F853DC3950B3.PNG` fornito dall'utente.

Output selezionato: `public/assets/secura/secura-mark-scan.png`, copiato anche nel repository applicativo come `public/brand/secura-mark-scan.png`.

Prompt finale:

> Use case: background-extraction. Edit target: the attached SecuRA silver robot logo with two red scanning beams. Remove ONLY the white outer background and make it genuinely transparent (RGBA). Preserve the robot design, original shape, silver metal colors, dark visor, eyes, reflections and the exact two red beams and their original directions. Preserve opaque white eye highlights and silver highlights inside the robot. Outside the robot, keep the beams as red light with progressively translucent alpha toward their ends, not opaque pale pink or white. No square, no tile, no white backing, no shadow box, no checkerboard painted into the image. No text. Keep the entire robot and both full beams, centred and tightly framed with 4% transparent padding. This is an existing brand asset: no redesign or stylistic changes. Must work on dark navy UI and on white backgrounds.

## Verifiche

- `node --check public/assets/secura.js`.
- Controllo locale di esistenza degli asset HTML e CSS e unicità degli ID.
- Browser: raggi inizialmente spenti, attivazione e limiti, schede da mouse/tastiera, nessun errore console durante le verifiche.
- Browser mobile: assenza di video e pulsante pausa, loop web automatico, verifica delle posizioni dei raggi e dell’assenza di overflow.
- Build dell'app React completata; dashboard, routing, API e script legacy invariati.

L’animazione web non dipende dai permessi di autoplay multimediale. Non è stato eseguito un deploy remoto.

Il footer usa robot e wordmark a sinistra, come la navbar. Il lockup esteso centrale è stato rimosso dalla pagina su richiesta dell’utente; l’originale resta conservato tra gli asset.

Il footer rimane su una riga anche su mobile: marchio SecuRA a sinistra, «by DoubleL» testuale, con solo «DoubleL» in grassetto e poi «Tutti i prodotti» a destra.
