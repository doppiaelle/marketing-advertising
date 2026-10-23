# ACN hero video

The supplied logo animation replaces the earlier CSS tilt. Only the hero uses
the video; navigation, footer, README and other product pages keep their PNG marks.

## Source and diagnosis

- Source: `Create_looping_logo_animation_20261022235418.mp4`.
- SHA-256: `3aa21e021ec2de10dc2446c46e0f521d4bcd809bda41a4c00c6821ca34adf52d`.
- Original: 8 seconds, 192 frames, 24 fps, 720 × 1280, H.264 plus AAC audio.
- Timestamps are regular: FFmpeg `vfrdet` reports `0/191` variable intervals.
- The strongest adjacent-frame discontinuity is at source frame 148, 6.1667 s.
  The orientation jumps in the generated imagery; it is not a variable-frame-rate
  or site playback problem. The source contains two rotations.

## Processing

The web loop uses the first rotation, avoiding the defective second rotation.
Source frames 4–99 yield a four-second cycle. Its final four frames are blended
with source frames 0–3 using bidirectional optical-flow warping and a smooth
weight curve, rather than joining the two poses with a hard cut.

The empty vertical margins are cropped to `(x=0, y=220, width=720, height=800)`.
The studio backdrop is normalized using a quadratic fit to empty border regions;
the logo's dark surfaces and ground shadow remain. FFmpeg then interpolates
motion to 60 fps, applies mild `hqdn3d` noise reduction, Lanczos scaling and
light sharpening. Extra cyclic look-ahead frames preserve interpolation at the
loop boundary.

Encoding: H.264, `yuv420p`, CRF 19, slow preset, square pixels, fast-start MP4,
240 frames, 1080 × 1200, 4 seconds. There is **no audio stream**. The file is
1,435,186 bytes; the first decoded frame supplies the 52,568-byte WebP poster.

This is interpolation and resampling of the provided imagery, not native
high-resolution regeneration. Compression softness and small geometry changes
already present in the generated source cannot be fully recovered without a
new render or an actual 3D model.

## Component behavior

`public/assets/acn.js` assigns the video's `data-src` only when the hero is in
view, the document is active and reduced motion is off. It keeps `muted`,
`loop` and `playsinline`; a button pauses/resumes playback. Scrolling away or
switching tabs pauses playback without cancelling a user's explicit pause.

The poster reserves the same 9:10 aspect ratio and remains until a `playing`
event. It also covers no JavaScript, media failure, reduced motion and blocked
autoplay. Blocked autoplay offers the resume button. Reduced-motion users do
not download the MP4 on initial load.

## Validation

- Decoded all 240 output frames and checked duration, dimensions and 60 fps.
- Inspected MP4 streams: video only, no AAC/audio stream.
- Compared the loop boundary with ordinary adjacent frames on a 256 × 284
  grayscale sample: mean absolute difference 0.9906 versus median ordinary
  step 1.3588. This checks the boundary; it does not establish perceptual
  quality or recover missing source detail.
- CSS parsing and JavaScript syntax checks accompany browser playback checks.

The site remains static: video processing tools are not needed to serve or
deploy it. GitHub Pages publishes the MP4 and WebP as ordinary local assets.
