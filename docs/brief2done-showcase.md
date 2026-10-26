# Brief2Done showcase — guided journey

## Goal and destination

The static product page is `public/brief2done/index.html`; the application lives
at `https://brief2done.doppiaelletech.workers.dev/`. The showcase is a product
**preview**, not a live account or a promise of payment. All project names,
budgets, collaborators and confirmations shown inside the demo are examples.

The revised version prioritizes understanding and entry: a concise six-step story,
visible Next/Back controls, one chapter per scroll gesture, a persistent
**Get started** app link, and a closing **Create your account** call to action.
The existing catalogue, contact links and redirect from `taskhub/` are preserved.

## Six steps (eight demo stages reduced to six)

| Step | Screen source | What visitors should understand | Run time when active |
| --- | --- | --- | --- |
| Discover opportunities | 0 | Find a brief that suits your skills | 4.0 s |
| Connect and collaborate | 6 | People, companies and collaborators are connected | 4.8 s |
| Pitch your skills | 1 | Apply and show what you can offer | 5.0 s |
| Agree on clear terms | 8 | Set expectations before starting | 4.8 s |
| Deliver your work | 2 | Submit work for review | 5.0 s |
| Get work approved | 5 | Follow the confirmation to the outcome | 5.2 s |
| Call to action | — | Create an account / explore the portal | 3.5 s reveal |

Team formation is explained as part of **Connect**, and separate approval and
confirmation scenes are combined into **Get work approved**. This keeps the
essential process without forcing users through redundant screens. The titles,
short explanations and example product screens are readable independently.

**Timing is now based on actual time, not scroll distance.** Each new chapter
reveals its large opening title, then its one-sentence explanation, then the
illustrative product interaction. The result remains on screen until the visitor
chooses to continue. A continuous wheel/touch movement cannot jump multiple
chapters. During a chapter's early reading window, one queued gesture is
remembered and advances to the next chapter when the opening has settled.
No extra empty runway is required: the stage occupies a single viewport, and
the first meaningful scroll is captured on that stage.

Visitors can navigate with wheel, touch swipes, the visible Previous/Next buttons,
or arrow/PageUp/PageDown/Space keys. At the beginning and the end, native scrolling
remains available to leave the story and reach the normal footer.
The end card is not dependent on reaching an exact scroll position; the keyboard
skip link opens and focuses its call to action immediately.

## The brand rocket

The rocket is **not an unrelated replacement icon**. The flying sprite is the
rocket cropped out of the existing `brief2done-icon.png` artwork via an SVG
`clipPath`; the original PNG is reused unmodified, so there is no additional
network asset or a competing illustration. The rocket is present while the
illustrative demo frames are loading, aligned initially with the rocket in the
header mark. It departs on a curved cubic path, alternates left/right and
above/below the screen composition as chapters advance, and leaves a subtle
green flight trace.

On the closing stage, the destination is calculated from the **actual rendered
position** of `.closing-brand-icon`. The sprite shrinks, aligns to the rocket's
position within that artwork and fades into the fully visible original icon.
Responsive calculations use current stage dimensions, so the flight and docking
are not tied to desktop pixels. Under `prefers-reduced-motion`, the decorative
flight and exhaust disappear while the story and navigation remain usable.

## Stability and accessible fallback

The original demo React bundle, its mock data and screen adapter are unchanged.
Exactly **two persistent iframes** are reused across all active chapters rather
than mounting hidden copies. The parent sends the existing
`brief2done:scene`, `brief2done:frame`, `brief2done:visibility`, and
`brief2done:ready` messages. Frame action progress is sent at most 20 times
per second. Hidden scenes and the end panel are removed from accessibility
navigation using `aria-hidden` / `inert`. In reduced-motion mode the screens
show a settled state without staging motion.

A static fallback supplies readable text and a direct portal link if JavaScript
is unavailable or screen initialization fails. The header link opens the portal
directly without requiring the walkthrough. The app's earning opportunities
are contingent on briefs and approved work; the showcase does not guarantee
earnings or misrepresent example budgets as real offers.

## Verification and manual QA

`node --check public/assets/brief2done/motion.js`,
`node scripts/check-brief2done.mjs` and the repository's other static checks
are intended to run in the PR workflow. Manual browser QA is still required
before merging, especially on physical iOS Safari and low-memory phones.

Reviewer checklist:

- Initial page: the small rocket is visible by the header icon during loading;
  first wheel gesture acts on the walkthrough, not an empty scroll runway.
- Repeated fast wheel events and mobile swipes: one chapter per gesture; no
  double-skips; title and explainer remain visible while reading.
- Previous/Next and keyboard navigation: clear labels and reversible order.
- All six demo screens: router transition settles without stale frames or
  missing progress; test rapid direction reversal.
- Final sequence: rocket lands at the rocket in the center-card icon, then
  disappears; CTA remains visible and opens the correct app destination.
- Desktop, 390px portrait and short landscape: no overlap with step controls,
  browser chrome or bottom CTA.
- Reduced-motion and no-script fallback: no forced decorative flight.
- After the closing chapter, normal scroll continues to the standard footer.

The GitHub Pages publishing workflow still runs only from `main`. This
feature branch includes a separate PR check workflow so verification does
not deploy changes before review.
