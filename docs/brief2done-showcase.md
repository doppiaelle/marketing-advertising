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

## Rocket path — full-height chapter sweep (October 2026)

**What was broken:** the former layout built six flight segments between a header
point and a footer point, dividing their *total* vertical difference by six.
Consequently every chapter had only ~80 pixels of vertical travel on an
800-pixel desktop, although its lateral movement was much larger. That is
why the screenshots showed a rocket gliding horizontally near the top.

**New vertical design:** the world-space route uses six connected cubic Bézier
segments, with the first five covering at least 78% of the viewport height.
On desktop and mobile the vertical sweep is calculated from the live viewport
size and the rocket's actual header position. Each route has one broad arc,
alternating sides. The final segment lands on the actual closing logo.

To make a full-height descent on each screen while preserving continuous
world coordinates, the **last 22%** of each of the first five chapters acts
as a scroll-synchronized *camera handoff*: the virtual camera catches up
with the world route to show the top of the next section. The marketing
screen dissolves while the camera moves. Both the rocket and its fading
trail use precisely the same camera projection, preventing detached traces.
There are no time-based accelerators or intercepted wheel/touch gestures.
The return route remains mirrored and faces upward, using the same
scroll-coordinate geometry and reversed trailing line.

This is a cinematic handoff (there is a brief upward movement **relative to
the viewport** during the camera catch-up), not a teleport between unrelated
curves: the world-space rocket path always descends and the projected
coordinates remain continuous at each chapter boundary. Native scroll
controls the speed both ways, even when dragged slowly.

The standalone vector rocket keeps its intact orange cone flame. It remains
hidden before departure from the header and fades out again on returning.

**Regression tests** execute the actual production cubic and camera functions
with both 1280×800 desktop and 390×844 mobile fixtures. They check that
every chapter travels down at least 46% of its viewport during the visible
sweep, that world-space y never reverses, that projected endpoints remain
continuous between chapters, and that the final destination is the rendered
logo anchor. They also verify the trail and rocket share a camera projection.

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
- Fast or slow scroll through all six steps, then rewind: a large downward arc
  per chapter, continuous cinematic camera handoffs, mirrored return lane,
  nose up on rewind and trailing line behind the rocket.
- Desktop and mobile: confirm the rocket visibly crosses the vertical height
  of **each** chapter, rather than remaining high along a horizontal arc.
  Verify the short camera handoff near the end of each chapter.
- Final CTA and normal footer accessible, including reduced motion and
  keyboard navigation.
- Visual test on iPhone Safari and a real Android phone for sticky scroll,
  SVG rotation and partial-scroll resumes.

The GitHub Pages deploy workflow only publishes changes merged into `main`.
