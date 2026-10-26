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

## Rocket motion design — revision 26 October 2026

The speed of the flying rocket is now coupled **1:1 to the real scroll
coordinate**. The old `part / .68` acceleration was removed: a slow drag
tracks the finger and a slow trackpad movement advances the rocket slowly,
without snapping forward after the gesture. Wheel input is accumulated from
actual delta values, with larger sensitivity only for fast bursts; those
bursts are capped to one chapter. Quick mobile flicks may finish the
neighbouring chapter with a short navigation scroll, while slow swipes
remain at the exact position released. Button/keyboard navigation still
provides a concise animated jump.

The former five waypoint S-curves per chapter are gone. There is now
**one cubic Bézier per chapter**, with its control handles positioned
vertically below/above the anchors. This makes entry/exit tangents point
downward and keeps the joins continuous as the virtual world moves down.
The viewport follows the virtual journey at 95% of the document's motion:
the rocket slowly descends on-screen across the six chapters rather than
being teleported back to the top at each join. The trail is a fading
19%-of-a-chapter window behind the current scroll position.

A new, standalone `public/assets/brief2done/rocket-flight.svg` replaces
the two cropped slices of the product PNG. It retains the teal, white and
green language of the mark, with **one solid pointed flame silhouette**
and a separate yellow inner cone. The tip cannot be cut off by the old
body/fire clip paths. The original product lockups elsewhere on the page
remain unchanged.

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

### Follow-up review checklist

- Slowly drag upward on a mobile screen and hold mid-gesture: rocket must stop at the corresponding path point without autonomous catch-up.
- Fast swipe / fast mouse wheel: advance at most one chapter per burst, without a fixed one-second flight.
- All six chapter endpoints: the rocket must point down, with no abrupt upward turn.
- Verify the new rocket SVG's **single pointed orange flame** on mobile and desktop (no old clipping artifacts).
- Drag the browser scrollbar directly: rocket position must match chapter progress exactly.
