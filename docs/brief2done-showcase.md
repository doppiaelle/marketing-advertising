# Brief2Done showcase — continuous rocket journey

## What changed after the first release

The first guided release fixed the number of steps but incorrectly collapsed
the whole storyboard to **one viewport**. The footer could scroll under the
pinned-looking illustration, and the browser's scrollbar no longer matched
the active chapter. Its single Bézier per chapter also left the brand rocket
visibly detached from the intended swooping route and from the original flame.

This revision restores a **real native document scroll**: the experience is
seven viewport heights (six demo chapters plus the final call-to-action);
`.shell` stays `position: sticky` while the scroll position advances from
chapter zero through chapter six. The scrollbar and the illustration read
from **the same native scroll coordinate**. A user dragging the scrollbar
scrubs the journey instead of moving the footer behind a static animation.
The footer is not exposed until the rocket reaches the closing chapter and
the final card has settled. A direct thumb jump ahead is clamped back to the
closing position while its reveal finishes; keyboard/touch/wheel navigation
remain available.

The existing six chapter sources and mock data are unchanged:
opportunities, people and collaborators, applying, agreeing, delivering and
confirmation. The source React bundle and its CSS are left intact; the same
two persistent iframes receive the original `brief2done:scene`,
`brief2done:frame`, `brief2done:visibility`, and
`brief2done:ready` messages. When crossing a chapter boundary, the old
frame fades out and the next fades in while the rocket flies independently.
The informational title, description and simulated actions keep their
readable pace without being scrubbable into oblivion.

## Rocket motion design

The PNG source `public/assets/brief2done/brief2done-icon.png` is reused as
an SVG image twice with different clip masks: one for the rocket body, the
other for the **original orange/red flame**. No green replacement exhaust.
The separate rocket sprite is smaller on both desktop and mobile.

The flight is **one connected curve sequence**, rather than separate reset
animations. Each chapter is made of six waypoints and Catmull–Rom curves
sampled by travelled length to provide smooth, continuous motion around and
between the panels. Routes alternate left/right and weave several times
over/under the composition, with distinct mobile waypoints. The endpoint
of segment N is exactly the starting point of segment N+1. Motion is
driven by the browser's position within the chapter, but its flight
progress finishes in the first 68% of a transition while the UI has more
time to appear/read. With a normal wheel gesture the document advances
one native chapter over a smooth 1-second scroll; touch gestures advance
the same single chapter. Scrollbar dragging always maps to the same
continuous global flight coordinate.

The SVG trail is a short **sliding window of the recent route**, with a
linear gradient from transparent to pale green. As the rocket moves, older
segments vanish automatically; it does not draw a permanent line across the
whole page. On the final approach it shrinks, returns to the actual closing
brand icon and fades. Motion decorations disappear for the
`prefers-reduced-motion` setting.

## UI and conversion

The large bottom-centred progress/Next bar has been removed. The remaining
controls are small, translucent up/down arrows at the bottom-right corner,
still with accessible button labels, keyboard focus and disabled states.
The persistent **Get started** link and final **Create your account**
link continue opening the actual Brief2Done portal:
`https://brief2done.doppiaelletech.workers.dev/`.
There are no implied guarantees of income; the project and budget samples
inside the mocked screens are illustrations only.

## QA

The dedicated PR workflow checks JS syntax and the updated
`scripts/check-brief2done.mjs` integration assertions.

Manual browser checks recommended before merge:
- Desktop wheel/trackpad: one completed multi-curve rocket flight per gesture,
  no chapter skipping under momentum.
- Scrollbar thumb from beginning to middle to end: the correct screens,
  no permanent black gap and no footer underneath the ongoing animation.
- Mobile touch and browser UI resizing: correct sticky bounds, no jump when
  height changes, smaller rocket and unobtrusive up/down controls.
- Reverse scroll and navigation buttons: rocket follows the connected path
  in both directions with no reset flash.
- Closing scene: flight ends inside the actual brand mark with flame visible,
  final button remains legible, replay and back navigation work.
- Keyboard, skip link, reduced motion, static fallback and screen adapter.

The GitHub Pages deploy workflow still runs only on `main`.
