# taskhub showcase

## Source and integration

`public/taskhub/index.html` is the dedicated product page, linked from the
Digital workspaces category in `public/index.html`. It follows the catalogue's
English language and retains the existing static GitHub Pages deployment.
The app destination is `https://taskhub.doppiaelletech.workers.dev/`.

The supplied `taskhub-motion-sprint.html` is the visual and motion source.
Its eight selected scenes remain in the same order, with the same illustrative
product screens, copy and green palette. The final previously empty panel now
contains a dark card, the original app mark, product name and call to action.
The footer carries the All products link and DoubleL attribution. The mark
comes from `taskhub/apps/web/public/favicon.svg`.
The app README was used to verify the product description. Screen names,
budgets and projects are demo data; the walkthrough is labelled accordingly.

Fonts and bundled demo React code/CSS were extracted from the supplied file
to `public/assets/taskhub/`. Each iframe loads `frame.html?scene=…` and shares
cached resources, instead of duplicating the complete bundle in `srcdoc`.
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
Visual scroll catch-up is 75 ms; it does not intercept input. The final card finishes entering by 53% of its chapter,
leaving the rest as a stable call to action. It cannot receive focus while hidden.

## Responsive and accessible behaviour

The source's 1280 × 760 and 640 × 940 compositions scale into the available
stage. The stage uses `svh` to reduce mobile browser toolbar jumps. The final
card is independent of the scaled canvas and has compact variants for short
and landscape viewports. The fixed header contains only the right-aligned
Taskhub mark and name. All products is available only in the footer. Progress
information, scroll hints and replay controls are omitted as requested.
A keyboard skip link reaches the final call to action. Arrow Left/Right change
scenes when focus is outside interactive controls;
normal keyboard scrolling is preserved.

Reduced motion removes travel, rotation, cursor effects and scroll catch-up,
while showing each demo's result. Without JavaScript, or after a 20-second
screen-initialisation timeout, a readable summary and direct app link remain.
Inactive scenes and the hidden final panel are excluded from accessibility.

## Verification

- JavaScript syntax checks for both motion and extracted screen code.
- Static asset/link resolution and catalogue category count checks.
- Local browser checks of native scroll, reverse navigation,
  internal screen changes and the final destination link.
- Visual checks on the desktop stage and a narrow, short mobile stage; the
  latter prompted a compact card so the CTA clears the bottom navigation.

No build or additional package installation is required. The GitHub Pages
workflow checks the Taskhub page and its required assets before publication.
