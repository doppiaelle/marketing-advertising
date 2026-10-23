(() => {
  'use strict';
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const scanner = document.querySelector('#scanner');
  const left = document.querySelector('#beam-left');
  const right = document.querySelector('#beam-right');
  const status = document.querySelector('#scan-status');
  const scene = document.querySelector('.scanner-scene');
  const robot = document.querySelector('.robot');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const automatic = window.matchMedia('(max-width: 760px), (hover: none), (pointer: coarse)');
  const origin = [34, -34];
  // Sweep, converge, turn back and return to the original spread without a jump.
  const poses = [
    [0, 34, -34], [.18, 18, 4], [.36, -22, -30],
    [.55, 0, 0], [.74, 30, 22], [1, 34, -34],
  ];
  const loopDuration = 8400;
  let activated = false;
  let heroVisible = true;
  let animationFrame = 0;
  let previousTime = 0;
  let loopTime = 0;
  let target = [...origin];
  let current = [...origin];
  let latestPointer = null;
  const canAnimate = () => !reduced.matches && !document.hidden && heroVisible;
  const paint = () => {
    left.setAttribute('transform', `rotate(${current[0].toFixed(3)})`);
    right.setAttribute('transform', `rotate(${current[1].toFixed(3)})`);
  };
  const activate = () => {
    activated = true;
    hero.classList.add('activated');
    scanner.classList.add('is-scanning');
    status.textContent = automatic.matches
      ? 'Scansione automatica attiva.'
      : 'Scansione attiva. Il prossimo passo è tuo.';
  };
  const tick = (time) => {
    animationFrame = 0;
    if (!canAnimate()) return;
    const elapsed = Math.min(time - (previousTime || time - 16), 64);
    previousTime = time;
    let moving = false;
    if (automatic.matches) {
      loopTime = (loopTime + elapsed) % loopDuration;
      const phase = loopTime / loopDuration;
      const end = poses.findIndex((pose, index) => index > 0 && phase <= pose[0]);
      const before = poses[end - 1];
      const after = poses[end];
      const progress = (phase - before[0]) / (after[0] - before[0]);
      const ease = (1 - Math.cos(progress * Math.PI)) / 2;
      current = [1, 2].map((index) => before[index] + (after[index] - before[index]) * ease);
      const turn = Math.sin(phase * Math.PI * 2);
      scene.style.setProperty('--robot-yaw', `${(turn * 7).toFixed(3)}deg`);
      scene.style.setProperty('--robot-roll', `${(turn * 1.1).toFixed(3)}deg`);
      scene.style.setProperty('--robot-lift', `${(-3 * (1 - Math.cos(phase * Math.PI * 4))).toFixed(3)}px`);
      moving = true;
    } else {
      const factor = 1 - Math.exp(-elapsed / 105);
      current = current.map((angle, index) => {
        const next = angle + (target[index] - angle) * factor;
        if (Math.abs(next - target[index]) > .02) { moving = true; return next; }
        return target[index];
      });
    }
    paint();
    if (moving) animationFrame = requestAnimationFrame(tick);
  };
  const animate = () => {
    if (!animationFrame && canAnimate()) {
      previousTime = 0;
      animationFrame = requestAnimationFrame(tick);
    }
  };
  const reset = () => { latestPointer = null; target = [...origin]; animate(); };
  const syncScene = () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousTime = 0;
    if (automatic.matches) activate();
    else {
      ['--robot-yaw', '--robot-roll', '--robot-lift'].forEach((property) => scene.style.removeProperty(property));
      current = [...origin];
      target = [...origin];
      paint();
      scanner.classList.toggle('is-scanning', activated);
    }
    if (reduced.matches) {
      current = [...origin];
      paint();
      ['--robot-yaw', '--robot-roll', '--robot-lift'].forEach((property) => scene.style.removeProperty(property));
    }
    animate();
  };
  const track = (event) => {
    if (automatic.matches || event.pointerType === 'touch' || !canAnimate()) return;
    activate();
    latestPointer = { x: event.clientX, y: event.clientY };
    const box = robot.getBoundingClientRect();
    const x = (event.clientX - box.left) * 1379 / box.width;
    const y = (event.clientY - box.top) * 1141 / box.height;
    // +/-34 degrees plus the 18.3-degree half aperture preserves the original upper limits.
    target = [525, 854].map((eyeX) => {
      if (y <= 532) return eyeX === 525 ? 34 : -34;
      return Math.max(-34, Math.min(34, Math.atan2(-(x - eyeX), y - 532) * 180 / Math.PI));
    });
    animate();
  };
  hero.addEventListener('pointermove', track, { passive: true });
  hero.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('scroll', () => {
    if (!automatic.matches && window.scrollY > 3) activate();
    if (!automatic.matches) reset();
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (latestPointer) track({ clientX: latestPointer.x, clientY: latestPointer.y });
  }, { passive: true });
  document.addEventListener('visibilitychange', syncScene);
  reduced.addEventListener('change', syncScene);
  automatic.addEventListener('change', syncScene);
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      syncScene();
    }, { threshold: 0 });
    heroObserver.observe(hero);
    const sections = document.querySelectorAll('.scan-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target: section }) => {
        if (isIntersecting) { section.classList.add('is-visible'); observer.unobserve(section); }
      });
    }, { threshold: .06 });
    sections.forEach((section) => observer.observe(section));
    root.classList.add('reveal-ready');
  }
  const tabs = [...document.querySelectorAll('[data-view]')];
  const selectTab = (tab) => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.querySelector(`#panel-${item.dataset.view}`).hidden = !selected;
    });
    document.querySelectorAll('[data-nav]').forEach((item) => item.classList.toggle('active', item.dataset.nav === tab.dataset.view));
    document.querySelector('#preview-location').textContent = tab.textContent.toUpperCase();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(tabs[next]); tabs[next].focus(); }
    });
  });
  // Static fallback exposes every illustrative view when JavaScript is disabled.
  root.classList.add('secura-enhanced');
  syncScene();
})();
