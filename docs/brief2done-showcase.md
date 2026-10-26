# brief2done showcase

## Source and integration

`public/brief2done/index.html` is the dedicated product page, linked from the
Digital workspaces category in `public/index.html`. It follows the catalogue's
English language and retains the existing static GitHub Pages deployment.
The app destination is `https://brief2done.doppiaelletech.workers.dev/`.

The supplied `brief2done-motion-sprint.html` is the visual and motion source.
Its eight selected scenes remain in the same order, with the same illustrative
product screens, copy and green palette. The final previously empty panel now
contains a dark card, the original app mark, product name and call to action.
The footer carries the All products link and DoubleL attribution. The mark
comes from `brief2done/apps/web/public/favicon.svg`.
The app README was used to verify the product description. Screen names,
budgets and projects are demo data; the walkthrough is labelled accordingly.

Fonts and bundled demo React code/CSS were extracted from the supplied file
to `public/assets/brief2done/`. Exactly two persistent iframes load `frame.html`
once and share cached resources. Their router changes scenes through the
`brief2done:scene` message; they are never duplicated for hidden chapters or
reloaded/reparented during scrolling. The `screens.js` adapter resets demo
mutations and invalidates the relevant cached queries on each route change.
The demo's fetch mock remains in place: screens do not operate on real app data.
`screens.js` and `screens.css` are extracted bundles; edit the surrounding motion
and showcase files for layout and pacing changes.

## Scroll direction and pacing

The browser retains native wheel, touch, keyboard and scrollbar behaviour.
A sticky stage translates scroll distance into a weighted timeline. Unlike the
original equal ninths, each scene receives its actual duration's share of the
runway. Values below are relative beats, not guaranteed wall-clock seconds.

| Chapter | Beats | Direction |
| --- | ---: | --- |
| Explore | 3.2 | Establish the opportunity; the first frame is already readable. |
| Connect | 4.6 | Hold on people, companies and services separately. |
| Team up | 2.7 | A short, legible overview of complementary roles. |
| Apply | 4.2 | Build the pitch, pause before sending, hold on the outcome. |
| Agree | 3.6 | Central intertitle, then space to read the agreement. |
| Deliver | 3.8 | Show the work taking shape, then its submitted state. |
| Approve | 2.8 | A concise payoff with a clear approved result. |
| Confirm | 4.0 | Read the confirmation and allow the outcome to settle. |
| Your next move | 4.8 | Reveal the green background, raise the card, hold it centred. |

Within each scene, monotonic beat maps pace the existing actions independently
of the entrance and framing. Continuous easing replaces abrupt framing jumps.
Visual scroll catch-up is 75 ms; it does not intercept input. Jumps larger than
two timeline beats move straight to the requested position, avoiding routing
through skipped chapters. Demo action messages are limited to 20 Hz and sent
only when progress changes. The final card finishes entering by 53% of its chapter,
leaving the rest as a stable call to action. It cannot receive focus while hidden.

## Responsive and accessible behaviour

The source's 1280 × 760 and 640 × 940 compositions scale into the available
stage. The stage uses `dvh` to cover the currently visible viewport, including
the footer when mobile browser bars retract. The scroll runway is recalculated
only when viewport width changes; height-only browser-bar events leave its
length intact. The final
card is independent of the scaled canvas and has compact variants for short
and landscape viewports. The fixed header contains only the right-aligned
Brief2Done mark and name, followed by an SVG portal icon linking directly to the
public app with a 44px touch target. All products is available only in the footer. Progress
information, scroll hints and replay controls are omitted as requested.
A keyboard skip link reaches the final call to action. Arrow Left/Right change
scenes when focus is outside interactive controls;
normal keyboard scrolling is preserved.

Reduced motion removes travel, rotation, cursor effects and scroll catch-up,
while showing each demo's result. Without JavaScript, or after a 20-second
screen-initialisation timeout, a readable summary and direct app link remain.
Inactive scenes and the hidden final panel are excluded from accessibility.

## Mobile stability correction

The original implementation mounted sixteen complete React documents, two
per chapter, and kept them reporting measurements while invisible. The shared
pair now caps that number at two, pauses its measurement/action work in the
closing chapter and resumes when scrolling back. Only the active titles and
visible closing card request animation layers. Mobile excerpts avoid backdrop
blur and heavy filters; `frame.css` also disables redundant internal transitions
and backdrop surfaces. Parent transforms retain the original compositions.

The showcase and every catalogue/product arrow use the shared SVG drawing in
`ui-icons.css`, avoiding the platform-dependent emoji presentation of Unicode
arrows. Main assets and the iframe adapter have versioned URLs for old caches.

## Verification

- JavaScript syntax checks for both motion and extracted screen code.
- Static asset/link resolution and catalogue category count checks.
- Local browser checks of native scroll, reverse navigation,
  internal screen changes and the final destination link.
- Visual checks on the desktop stage and a narrow, short mobile stage; the
  latter prompted a compact card so the CTA clears the bottom navigation.
- Rechecked every chapter with the shared pair, including group roles,
  application typing, approval, and the payment confirmation.
- Eight rapid Home/End cycles at 390 × 844: two frame elements throughout,
  unchanged frame URLs, hidden loader, visible final CTA, no fallback activation.
- Height-only resize to 390 × 700: unchanged runway length, stage covering the
  new viewport, and successful return from the final card to the confirmation.
- This environment's browser is Chromium; Safari on a physical iPhone has not
  been directly tested.

No build or additional package installation is required. The GitHub Pages
workflow checks the Brief2Done page and its required assets before publication.
