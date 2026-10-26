# Brief2Done showcase — native scroll, forward descent and mirrored rewind

## Overview

The public showcase is a six-chapter static demonstration followed by a
registration CTA. It uses the existing two persistent demo iframes and
`brief2done:scene`/`brief2done:ready`/`brief2done:frame`/`brief2done:visibility`
protocol. The demo does not represent real available work or guaranteed
earnings. The live destination is
`https://brief2done.doppiaelletech.workers.dev/`.

## Scroll physics — October 2026 follow-up

The earlier implementation separately handled wheel bursts and touch swipes.
It clamped each burst to a chapter boundary for 290 ms, so subsequent wheel
events could be consumed without moving the rocket. This caused the observed
one- or two-scroll pauses.

**The new version no longer prevents or handles native wheel/touch events.**
All scroll input — including slow touch drags, trackpad inertia, scrollbar
thumb dragging and fast wheel motion — modifies the browser document scroll
directly. The scroll event and animation frame sample exactly the same
`scrollProgress()` value. There is no gesture cap, input deadline, auto-snap,
separate scroll position or first-scroll delay. The small chapter up/down
buttons and ArrowLeft/Right are the only programmatic navigation gestures.

The story remains six screen-height chapters plus a closing chapter, with a
sticky full-viewport stage. The footer remains gated until the final CTA is
visible. Chapter changes no longer trigger dramatic title lifts or panel
whips: titles and compositions settle immediately, while chapter transitions
use a scroll-dependent dissolve. Demo action animations may still take time,
but they never hold or block the rocket.

## Rocket path

The rocket sprite is `public/assets/brief2done/rocket-flight.svg`, a small
standalone vector with an unbroken orange flame.

The rocket's original world/camera formula nearly cancelled vertical travel:
the route descended one viewport per chapter, while the camera moved down by
95% of that distance. The rocket therefore hovered at almost the same
height and barely moved at the section boundaries.

The replacement builds **one large cubic per chapter in real viewport
coordinates**, with progressively lower joins ending at the closing
Brief2Done mark. The final lockup is displayed below the primary CTA on
taller screens so the visual path can genuinely descend farther down the
page. Control points alternate around the left/right chapter endpoints,
keeping x/y positions continuous and derivatives matched at joins.
The geometry has no camera subtraction and therefore never stalls due to
cancellation. The rocket moves precisely with the user's actual scroll
position and naturally stops only when the user stops scrolling.

At the initial position the header logo is the *only* visible rocket. The
flying version starts just outside that icon and fades in over the first
small portion of scroll. On rewind it fades away again into that exact
header area, avoiding a second rocket overlapping the brand before scrolling.

**Reverse scroll** preserves the real chapter order and demonstration states.
It also changes the nose to face up and makes the trailing line follow the
actual backward direction. An alternate mirrored cubic lane is blended in
gradually on direction changes, so it shares all chapter endpoints with
the forward track and cannot teleport at a join. The line remains a short,
progressively fading segment behind the moving rocket.

Under `prefers-reduced-motion`, the decorative rocket and trail are hidden;
native scrolling, the chapter content and CTAs remain available. The static
fallback still works if the demo frame fails.

## Navigation and conversion

The small translucent arrows at bottom right remain available with accessible
labels. The always-visible Get started link and the final Create your account
CTA go to the Brief2Done app. No new account/payments logic is implemented in
this marketing repository.

## Verification

`scripts/check-brief2done.mjs` verifies integration and uses the actual
pure cubic geometry functions from `motion.js` to check both forward and
mirrored lanes at 101 positions per chapter, continuity, matched tangents,
positive downward motion and non-zero velocity at all chapter joins.

Manual browser review before merge is still important:
- Initial load: no floating duplicate near the brand logo.
- Slow mobile swipe, small wheel deltas and scrollbar dragging: immediate
  proportional rocket motion without input-consuming pauses.
- Fast scroll through all six steps, then rewind: correctly ordered chapters,
  continuous flight, nose up while returning and trail behind the rocket.
- Tall desktop/mobile: the rocket traverses from the header toward the
  lower final brand lockup; short viewports keep the compact closing layout.
- Final CTA and normal footer accessible, including reduced motion and
  keyboard navigation.
- Visual test on iPhone Safari and a real Android phone for sticky scroll,
  SVG rotation and partial-scroll resumes.

The GitHub Pages deploy workflow only publishes changes merged into `main`.
