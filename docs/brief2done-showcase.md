# Brief2Done showcase — a continuous falling rocket and rising story

## Intent

One intuitive movement from first scroll to final registration CTA: visitors
follow a small rocket drifting slowly downward in the centre of their screen,
oscillating **right, left, right, left** as real product content rises from
below behind it. No scene is teleported back to the top, no camera shoots back
up, and there are no pauses while the user keeps scrolling.

The marketing page is `public/brief2done/index.html`; the live application
is `https://brief2done.doppiaelletech.workers.dev/`. Example projects and
budgets remain illustrative and are not guaranteed income.

## One native vertical storyboard rail

The page maintains six consecutive product chapters and a closing CTA. A
single `#scenes` rail lays them out at `i * designViewportHeight`, in the
same order as the story. The rail translates upward at
`-scrollProgress * designViewportHeight`. Therefore, the next section is
physically **below** the previous one and enters from the bottom as the
visitor scrolls forward. Reversing scroll replays the same physical
movement backward. No hidden camera handoff or chapter-boundary reposition.

A small opacity transition near the visible scene edges keeps text readable.
The two existing shared iframe demo frames move with the currently selected
chapter. They fade out before their source switches and fade in after the
next chapter becomes active, to avoid a visible snap or extra iframe mounts.

The final CTA is also a real screen entering from below using
`(6 - scrollProgress) * windowHeight`. The usual footer only becomes
reachable after the closing panel has entered and the existing release
condition has been satisfied.

No wheel/touch interception was added; the native scroll coordinate drives
both background movement and rocket travel. Keyboard ArrowUp/ArrowDown,
PageUp/PageDown and Space retain browser-native incremental scrolling.
The small translucent previous/next controls retain explicit chapter jumps.

## The rocket — vertical serpentine, not an infinity symbol

The flying sprite remains the standalone
`public/assets/brief2done/rocket-flight.svg` with its complete orange
cone-shaped flame. It stays hidden at scroll zero, fades in as it leaves
the header icon, and docks into the mark at the end.

The route is one continuous analytic curve. Its horizontal movement is
`x = centre + amplitude * sin(pi * scrollProgress)`, with desktop
amplitude capped at 215 px and tighter oscillations on mobile. Each chapter
makes one half-wave, alternating right and left; the path is smooth at
integer chapter boundaries, without teleports or sharp turns.

The screen-space vertical movement is
`y = viewportHeight * (0.28 + 0.45 * scrollProgress / 6)`.
It grows monotonically from around 28% to 73% of viewport height across
the full story. The rocket remains near the visual centre, *never
visually rises during forward scroll*, and the rising panels communicate
the larger descent through the page. In reverse, y declines with
scrollProgress, the nose points up, the lane mirrors gradually and the
fading short trail follows behind.

The last small portion of the journey aligns the sprite to the actual
closing logo, with a scale/fade docking treatment. It does not restart a
new curve or reset the background.

## Accessibility and tests

Reduced-motion users retain the scrollable product story but have no
decorative rocket/trail. The persistent Get started CTA, closing Create
your account CTA, replay link and static fallback remain available.

`scripts/check-brief2done.mjs` tests the actual production functions for:
- Upward motion of the six real chapter panels.
- Downward monotonic rocket y for desktop (1280×800) and mobile (390×844).
- Alternating right/left half-wave direction and smooth chapter joints.
- Smaller mobile x amplitude, mirrored reverse travel and no x teleports.
- Native input behavior, final panel entering from below and two-frame
  reuse, along with the existing asset and link checks.

Manual QA is required on desktop Safari/Chrome, touchscreens and especially
mobile Safari for sticky layout, the shared iframe handoff, full-scene text
legibility and docking accuracy. The GitHub Actions check is structural, not
a screenshot-based visual certification.

This branch is not deployed by GitHub Pages until merged into `main`.


## Mobile Safari hardening — static story panels and stable toolbar layout

Mobile Safari previously displayed the same two continuously changing,
heavyweight React preview iframes as desktop. When a scene changed they
switched React trees, then updated bounds and transforms while scrolling;
the rail also wrote visibility/opacity to every chapter on every animation
frame. These independent repaints could flicker during both fast and slow
scrolling.

On mobile (`screen-wrap` width below 730px), the six previews are now
**pre-rendered lightweight HTML mockups**, created synchronously along with
the six chapter sections. Their labels and project examples are illustrative.
No preview iframe or React screen application is initialized on a narrow
screen. The mobile rail and the rocket are the only elements that need
scroll-dependent movement: previews are static, with no per-frame fade,
visibility toggling, CSS animations or focusable controls. Desktop retains
the two shared React iframes and their dynamic illustrative flows.

The viewport uses **`100svh`** for the sticky mobile stage and its clipping
frame. Unlike `100dvh`, the small viewport unit does not resize merely
because Safari expands/collapses its bottom URL/navigation bar. The resize
handler also ignores events that do not change the measured stable stage
width or height; rotation and actual layout changes are still supported.
The page cannot disable Safari's browser UI itself, but internal scene
positions, scroll-runway height and rocket coordinates remain stable.

The description panel is elevated above the previews, with a dark
translucent background for contrast. The rocket's bank follows the forward
horizontal tangent correctly; its reversed orientation stays intact. The
trailing glow uses a longer sliding window with a gradient from transparent
at the oldest end to visible green near the rocket. Mobile avoids blur filters
on the trail to reduce frequent GPU re-rasterization.

### Mobile QA

- iPhone Safari, URL bar expanded: start at chapter one and drag slowly.
  Panel titles and mockups must be visible immediately, with no flickering
  at chapter boundaries.
- Safari toolbar collapses on the first downward swipe and expands on
  upward swipes: the page may naturally change its browser chrome, but the
  composition, panels and rocket should not resize or jump.
- Fast flick forward/reverse: the six *already-rendered* static panels flow
  past as a vertical rail, while the rocket follows the native scroll position.
- Mobile landscape/orientation change: geometry should remeasure when the
  stable viewport genuinely changes.
- Desktop remains visually unchanged except restored description-layer
  contrast, corrected rocket heading and longer visible trailing glow.
- Reduced-motion retains readable static previews but hides decorative
  rocket/trail.

**Verification limit:** this development environment cannot operate a
physical iPhone or a physical Safari installation. CI runs the real
JavaScript in a simulated DOM for desktop and mobile viewport sizes, including
a synthetic Safari toolbar height-change event. Actual Safari device testing
remains a release review requirement, not a claimed result.


## Wider flight, clearer payment and Safari edge fades — October 2026

The centre-to-side swing of the serpentine route is now calculated as
`min(width * 0.29, 390px)` on desktop and
`min(width * 0.225, 125px)` on mobile. These are **real screen coordinates**:
the rocket travels farther horizontally without clipping the viewport.
Forward and reverse share the same geometry and orientation rules.

Chapter 06's **static mobile card** depicts the actual distinction between
an approved delivery and payment confirmation. It displays a **€450 illustrative
payment**, the status **Reported by client**, an explanatory note that payment
is made outside the service, and **Confirm receipt** as the next step only
after the collaborator has actually received it. No payment is promised or
claimed to have been collected automatically.

A pair of *fixed* gradients along the clipped top/bottom edges of the
story viewport now supplies a subtle fade as each preloaded panel enters from
below and leaves above. Unlike per-section opacity animations, the gradients
do not trigger chapter repaints; the panel rail remains a static stack moving
with `transform: translate3d`. The closing screen is not obscured.

When `visualViewport.height` changes at constant width and at a constant
`100svh` stage height — typical when Safari reveals/hides the URL toolbar —
the animation suspends optional banking/mirror interpolation for roughly
220 milliseconds. **Position, trail and page scroll remain continuously
coupled to actual scroll input.** The mobile rendering loop avoids idle
60-FPS DOM/SVG rewrites except when a reverse-path morph still needs to
settle. We do not and cannot hide the browser's own address bar.

Automated checks cover the increased path amplitude at 390px and 1280px,
the payment information present in the sixth static panel, the fixed edge
fade styles, and a simulated visualViewport-height change where banking
pauses while the rocket position keeps responding to scroll.

Before merge, check the larger lateral movement on desktop/mobile, the
readability of the sixth payment mock on iPhone Safari and Android Chrome,
the fade at both scene edges, and the first down/up scroll that changes
browser chrome. Real physical-device visual QA is not available in this
connector environment, so the tests above are *not* a claim of a live Safari
pass.

## PR follow-up: real mobile fade, calmer desktop arc and slower scroll — October 2026

### Why the mobile scene fade was missing

The earlier solution placed gradients at the **outer mobile viewport edges**
while the 640×940 storyboard canvas was *scaled and vertically centered* inside
that viewport. The gradients were therefore detached from the actual artwork.
Worse, inactive chapters still inherited `.scene {opacity:0}`; they abruptly
became visible only when the `.active` class changed near each midpoint.

The six static HTML panels now remain painted (both active and inactive
`opacity:1`). They sit in one upward-scrolling `#scenes` rail within a
**stationary `.scene-viewport`**. Two static, dark-to-transparent edge overlays
at the top and bottom of that fixed design-size viewport cause *every* panel
to fade in from below and fade out above. These overlays never animate or
repaint chapter opacity; native scrolling changes only the rail transform.
The closing CTA still appears separately, and the rocket, its scia and the
fixed header are outside those overlays.

### Flight geometry and scroll pacing

- Desktop horizontal swing reduced from `min(width × .29, 390px)` to
  `min(width × .225, 300px)`. This removes the near-horizontal, wide
  lateral excursions while keeping alternating left/right bends.
- Mobile keeps its approved `min(width × .225, 125px)` swing.
- Vertical rocket movement grows from `28–73%` of the visible height to
  `16–84%` across the full six-part route. Forward world/screen Y remains
  strictly increasing and reverse scroll rewinds the same positions; no
  per-chapter return-to-top was introduced.
- Each chapter requires **1.18 times the former native-scroll distance**.
  `scrollProgress`, chapter arrow targets, runway height, footer unlock
  limit and resize restoration all use that *same* factor. The rail and rocket
  therefore slow down together without wheel/touch interception, timer locks
  or inert gestures. Optional chapter-button interpolation increases from
  460ms to 520ms.

### Verification

GitHub Actions should run syntax, integration/geometry checks and a real
JavaScript startup smoke test. The smoke test verifies the extended runway,
halfway native-scroll progress, preloaded panels and forward/reverse travel.
Geometry tests verify the reduced desktop width, retained mobile width,
larger strictly downward travel and contiguous chapter joins.

A physical Safari/Chrome test is still required to validate visual fades,
fast scrolling, URL-bar transitions and the CTA. DOM mocks and CSS assertions
cannot establish actual mobile rendering performance.
