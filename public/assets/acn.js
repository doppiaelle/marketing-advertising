// Load and run the silent loop only when motion is allowed and the hero is
// visible. The poster also covers blocked autoplay, media errors and no-JS use.
const logoMedia = document.querySelector('.hero-logo-media');
const logoVideo = document.querySelector('.hero-logo-video');
const motionToggle = document.querySelector('.motion-toggle');
if (logoMedia && logoVideo && motionToggle) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let requested = true;
  let inView = !('IntersectionObserver' in window);
  let failed = false;
  logoVideo.muted = true;
  logoVideo.defaultMuted = true;

  const updateControl = () => {
    motionToggle.hidden = failed || reducedMotion.matches;
    motionToggle.setAttribute('aria-pressed', String(!requested));
    motionToggle.setAttribute('aria-label', requested ? 'Pause logo animation' : 'Resume logo animation');
    motionToggle.textContent = requested ? 'Pause motion Ⅱ' : 'Resume motion ▷';
  };
  const shouldPlay = () => requested && inView && !document.hidden && !reducedMotion.matches && !failed;
  const syncPlayback = async () => {
    updateControl();
    if (!shouldPlay()) {
      logoVideo.pause();
      if (reducedMotion.matches || failed) logoMedia.classList.remove('video-ready');
      return;
    }
    if (!logoVideo.getAttribute('src')) logoVideo.src = logoVideo.dataset.src;
    try {
      await logoVideo.play();
      // A visibility/preference change can arrive while play() is pending.
      if (!shouldPlay()) logoVideo.pause();
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        requested = false;
        updateControl();
      }
      // A pending play interrupted by pause is expected; retain the poster.
    }
  };
  logoVideo.addEventListener('playing', () => {
    if (shouldPlay()) logoMedia.classList.add('video-ready');
  });
  logoVideo.addEventListener('error', () => {
    failed = true;
    void syncPlayback();
  });
  motionToggle.addEventListener('click', () => {
    requested = !requested;
    void syncPlayback();
  });
  reducedMotion.addEventListener('change', () => { void syncPlayback(); });
  document.addEventListener('visibilitychange', () => { void syncPlayback(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
      void syncPlayback();
    }, { threshold: 0.05 });
    observer.observe(logoMedia);
  }
  void syncPlayback();
}

// Deterministic protocol explainer. No network calls or automatic execution.
const stages = [...document.querySelectorAll('[data-stage]')];
const panels = [...document.querySelectorAll('[data-stage-panel]')];
const next = document.getElementById('next-stage');
let active = 0;
function selectStage(index) {
  active = index;
  stages.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  panels.forEach((panel, i) => { panel.hidden = i !== index; });
  document.querySelector('.trace-progress').textContent = `${String(index + 1).padStart(2, '0')} — 05`;
  next.innerHTML = index === stages.length - 1 ? "Replay lifecycle <svg class=\"ui-arrow\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M3 10a9 9 0 1 1 2 9M3 4v6h6\"/></svg>" : "Next transition <svg class=\"ui-arrow\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 12h14m-6-6 6 6-6 6\"/></svg>";
}
if (stages.length && panels.length && next) {
  stages.forEach((button, i) => button.addEventListener('click', () => selectStage(i)));
  next.hidden = false;
  next.addEventListener('click', () => selectStage((active + 1) % stages.length));
  selectStage(0);
}
document.querySelectorAll('[data-copy]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = 'Copy example'; }, 1800);
    } catch {
      button.textContent = 'Select code to copy';
    }
  });
});
