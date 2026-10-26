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
