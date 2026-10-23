# Kritoma · vetrina e sequenza sul terreno

`public/kritoma/index.html`, `public/assets/kritoma.css` e
`public/assets/kritoma.js`. Sito statico in inglese, pubblicato dal workflow
GitHub Pages esistente. Nessun framework, servizio, API o build aggiuntiva.

## Direzione

Blu notte `#030d25`, ciano `#00e5ed`, magenta `#ff008c`, giallo `#ffeb26` e
avorio `#fffbea` riprendono logo e identità dell'app Kritoma. Il logo originale
`assets/kritoma-logo.png` rimane invariato. Manrope e Oxanium sono asset locali
già presenti, con licenze OFL rispettivamente in `assets/feeddy/` e
`assets/secura/`.

Fronti e retri sono elementi HTML, con cornici CSS e simboli SVG. Il retro è
semplice, ciano e magenta, con il logo Kritoma al centro. Nessuna grafica demo
delle carte del repository applicativo viene distribuita nella nuova vetrina.
Le tre illustrazioni generiche dei fronti sono concept per questa presentazione,
non asset definitivi del gioco. Combattente, pedine e Obiettivo usano simboli
generici. Le informazioni esplicative rimangono testo HTML leggibile.

## Fonti del gioco

Consultate nel repository `KRITOMA`, senza modificarlo:

- `docs/regolamento-v1.2.md`: formati 40/60 carte, soglie 15/20 PV, 2 Settori
  da 3 slot, Luoghi, Mana, Extra e personalità.
- `web/src/palette.ts` e `starters/_ambiti.json`: dodici Ambiti, nomi e colori.
  Il riepilogo Ambiti del README applicativo contiene una tassonomia differente;
  la vetrina segue il catalogo e la palette effettivamente usati dall'app.
- `cards/media/chat-room.json`, `piccolo-streamer.json`, `raid.json`,
  `streamer-dell-anno.json`, `live-da-record.json`: interazioni illustrative.

La vecchia affermazione che la vittoria richiedesse obbligatoriamente metà
punti da combattimento e metà da Obiettivi è rimossa: nel regolamento è una
ripartizione attesa di design, non una condizione per vincere.

## Terreno e nomi illustrativi

Il terreno riprende il modello fornito dall’utente (coincidente con
`docs/designer_schemes/prototipo-terreno.png`): due Settori orizzontali,
ciascuno con Luogo a sinistra e tre Combattenti. Sotto: Mazzo, Cimitero,
tre slot Azione centrali ed Extra Deck a destra, con Mana coperto distinto.
Il regolamento v1.2 prevale sul README: gli slot Azione sono tre. Gli
attacchi diretti richiedono che l’avversario non controlli alcun Combattente
in tutto il campo, non soltanto un Settore vuoto.

I fronti usano nomi comuni (Place, Fighter, Instant Action, Extra Fighter,
Objective, Token), senza Ambito. Sono esempi dei tipi, non carte neutrali
ufficiali: il regolamento non prevede un pool neutrale. Gli effetti prendono
spunto dai dati Media, senza associarne i nomi alle nuove illustrazioni.
L’intestazione usa il logo originale, senza il precedente rombo.
Didascalia e replay sono fuori dal viewport animato, in una riga dedicata.

## Movimento

La sequenza di apertura dura 12,5 secondi ed è eseguita una volta:

1. Mano: tre retri entrano in prospettiva.
2. Luogo: un Luogo generico e un Combattente Creativo entrano nel Settore A; il suo
   effetto di ingresso crea una pedina. Il bordo del Settore mostra il bonus
   locale del Luogo.
3. Azione: un’Azione Istantanea aggiunge due pedine, una nello slot libero di A e una in B.
   L’Azione risolve durante la Main Phase e va al Cimitero, senza occupare
   i tre slot Azione. Taglio diagonale e particelle accompagnano l’effetto.
4. Extra: tre materiali di A, incluso il Creativo, vengono sacrificati.
   L'Extra occupa A e crea altre due pedine; quella già in B resta in campo.

Non vengono simulati attacchi nel turno di evocazione, assegnati punti al
sacrificio, né dichiarata una vittoria. È una vignetta illustrativa delle
interazioni, non una partita o un collegamento al motore di gioco.

CSS 3D gestisce tavolo e carte. Canvas usa particelle a numero limitato e DPR
massimo 1,5. Tempo e rendering si sospendono fuori vista, a scheda nascosta o
con pausa manuale. Replay riparte dall'inizio. A fine sequenza il loop RAF si
arresta. `prefers-reduced-motion` mostra direttamente la composizione finale,
senza particelle, parallasse o animazioni. Il nastro tipografico segue lo scroll;
non usa un loop automatico. Le sezioni si rivelano una sola volta.

Senza JavaScript rimangono visibili composizione finale, spiegazioni e tutte
le carte di approfondimento. Il selettore mostra la combinazione iniziale.

## Interazioni e destinazioni

Le tre spiegazioni Luogo/Azione/Extra usano bottoni con `aria-expanded` e
`aria-controls`. Il selettore Ambiti è solo illustrativo: da due scelte mostra
40 carte e 15 PV, da tre mostra 60 e 20. Una quarta scelta sostituisce la più
vecchia; le selezioni possono anche essere rimosse. Non certifica disponibilità
di tutti i Mini Deck né crea un mazzo nel servizio.

La CTA apre l'invito Discord già presente nella pagina precedente. La futura
piattaforma pubblica non ha ancora un link: la pagina lo dichiara e non mostra
un falso comando di accesso al gioco. Footer testuale «by **DoubleL**».

## Illustrazioni generate

Strumento: ImageGen integrato, tre generazioni indipendenti, nessuna immagine
demo usata come riferimento o edit target. Gli originali PNG restano nella
cartella `generated_images` della chat. Le copie WebP sono esportate senza
alterare il contenuto, per ridurre il peso della pagina.

Asset finali:

- `public/assets/kritoma/place-art.webp`
- `public/assets/kritoma/action-art.webp`
- `public/assets/kritoma/extra-art.webp`

Prompt comune, seguito dal soggetto specifico:

> Use case: stylized-concept. Asset type: portrait illustration for a fictional strategic trading card, artwork ONLY, no card frame, no lettering, no numbers, no logos. Premium graphic-novel / screenprinted concept art: sculpted flat shapes, crisp ink outlines, rich tactile halftone, dramatic perspective, serious playful personality. Palette: midnight navy #030d25, electric cyan #00e5ed, hot magenta #ff008c, tiny acid yellow #ffeb26 highlights, warm ivory. Portrait 3:4 composition, subject fully contained, dark atmospheric edges. No photorealistic people, no existing characters, no social platform logos.

Luogo:

> A monumental futuristic meeting hall made of interlocking glass speech-bubble-shaped architectural structures. Wide stairs, hovering communication glyphs, tiny anonymous geometric silhouettes for scale. Deep magenta illumination, cyan structural edges. Depict a PLACE, not an interface. Mood: collective intelligence, power gathering before a move.

Azione:

> A forceful diagonal wave of luminous abstract pawn-like avatars and sharp diamond energy shards bursting through a circular gateway. Bold magenta kinetic trail, cyan leading edge, yellow spark at impact. Depict an ACTION, sudden tactical momentum. Clear focal mass, no literal computers, no letters.

Extra:

> An imposing anonymous masked strategist, stylised nonhuman geometric face, asymmetric ivory mask with magenta eye slit, angular cyan collar, floating yellow three-point crown motif above the head. Original character with an elegant theatrical presence, not a copy of any existing mascot or character. Waist-up dominant portrait surrounded by cyan and magenta shards. Depict a powerful EXTRA fighter, triumphant arrival, navy backdrop.

## Verifica

Servire `public/` e aprire `/kritoma/`. La CI controlla presenza degli asset
principali e sintassi dello script. Controllare apertura desktop/mobile,
pausa/ripresa/replay, i tre approfondimenti, selezione e rimozione degli Ambiti,
limite di tre scelte, soglie 40/60 carte e 15/20 PV, ancore e asset locali.

Verificato localmente il 23 ottobre 2026: HTTP 200, sintassi JS, ID unici,
asset e font presenti, riferimenti ARIA e simboli dei dodici Ambiti validi,
assenza di riferimenti alle grafiche demo. Nel browser: approfondimento Azione,
selezione 40 carte/15 PV, aggiunta e sostituzione fino a 60 carte/20 PV, pausa
con avanzamento invariato, ripresa fino a fase Extra e avanzamento 100%.
Controllo visivo desktop e a 390×844, senza scroll orizzontale della pagina.

Aggiornamento 23 ottobre: terreno ricostruito sul modello ufficiale (2 Luoghi,
6 Combattenti, 3 Azioni), Cimitero e Mana coperto. Verificati HTML bilanciato,
ID unici, risorse locali, nomi generici, finale della sequenza e pausa/replay.
Didascalia sotto il campo su desktop e mobile; parallasse disattivata su
viewport stretto per mantenere il campo interamente visibile.
