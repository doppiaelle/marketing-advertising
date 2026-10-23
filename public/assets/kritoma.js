(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const arena = document.querySelector('[data-arena]');
  const pause = document.querySelector('[data-motion-toggle]');
  const replay = document.querySelector('[data-motion-replay]');
  const canvas = arena.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const progress = document.querySelector('.motion-progress');
  const scenes = [
    ['00 / THE HAND', 'Every possibility starts here.', 'Your worlds. Your cards. Your next decision.'],
    ['01 / PLACE', 'Give your fighters a home.', 'A Place, a Creative fighter and its token. Three Mana spent.'],
    ['02 / ACTION', 'Change the equation.', 'An Instant Action creates two tokens, then goes to the Graveyard.'],
    ['03 / EXTRA', 'A different kind of power.', 'One fighter goes to the Graveyard. Two tokens disappear. An Extra arrives.']
  ];
  const starts = [0, 2100, 4900, 8300];
  const duration = 12500;
  let clock = 0, previous = null, frame = 0, step = -1;
  let requested = true, visible = true, finished = false;
  let width = 0, height = 0, particles = [], pulse = null;
  function resize() {
    const box = arena.getBoundingClientRect();
    width = box.width; height = box.height;
    if (innerWidth <= 760) { arena.style.setProperty('--camera-x', '0deg'); arena.style.setProperty('--camera-y', '0deg'); }
    arena.style.setProperty('--arena-scale', Math.min(width / (innerWidth <= 760 ? 1320 : 1180), Math.max(200, height - 25) / 700, 1.2));
    if (!ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint();
  }
  function burst(index) {
    const color = index === 2 ? '#ff008c' : '#ffeb26';
    const x = width * .61, y = height * .38;
    pulse = {born: clock, x, y, color};
    particles = Array.from({length: 44}, (_, i) => {
      const angle = i * 2.39996;
      const speed = 70 + ((i * 37) % 230);
      return {born: clock, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed * .65 - 40, size: 1.5 + i % 4, color: i % 3 === 0 ? '#00e5ed' : color};
    });
  }
  function setScene(index, effects = true) {
    if (step === index) return;
    step = index;
    arena.dataset.step = String(index);
    ['intro', 'place', 'raid', 'extra'].forEach((name, i) => arena.classList.toggle('phase-' + name, i === index));
    arena.classList.toggle('has-place', index >= 1);
    arena.classList.toggle('has-raid', index >= 2);
    arena.classList.toggle('has-extra', index >= 3);
    ['number', 'title', 'description'].forEach((key, i) => { document.querySelector('[data-scene-' + key + ']').textContent = scenes[index][i]; });
    if (effects && index >= 2 && !reduced.matches) burst(index);
  }
  function paint() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    particles = particles.filter(p => clock - p.born < 1700);
    ctx.save();
    particles.forEach(p => {
      const t = (clock - p.born) / 1000;
      const opacity = Math.max(0, 1 - t / 1.7);
      const x = p.x + p.vx * t, y = p.y + p.vy * t + 35 * t * t;
      ctx.globalAlpha = opacity * .8;
      ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 9;
      ctx.beginPath(); ctx.moveTo(x, y - p.size); ctx.lineTo(x + p.size * .6, y); ctx.lineTo(x, y + p.size); ctx.lineTo(x - p.size * .6, y); ctx.closePath(); ctx.fill();
    });
    if (pulse) {
      const age = (clock - pulse.born) / 1400;
      if (age >= 1) pulse = null;
      else {
        ctx.globalAlpha = (1 - age) * .45;
        ctx.strokeStyle = pulse.color; ctx.shadowColor = pulse.color; ctx.shadowBlur = 15;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(pulse.x, pulse.y, 25 + age * width * .45, 15 + age * height * .16, -.3, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.restore();
  }
  function control() {
    pause.disabled = finished;
    pause.innerHTML = finished ? '✓ <span>Sequence complete</span>' : requested ? 'Ⅱ <span>Pause motion</span>' : '▷ <span>Resume motion</span>';
    pause.setAttribute('aria-label', finished ? 'Opening sequence complete' : requested ? 'Pause the opening sequence' : 'Resume the opening sequence');
    pause.setAttribute('aria-pressed', String(!requested));
  }
  function tick(now) {
    frame = 0;
    if (!requested || !visible || document.hidden || reduced.matches || finished) return;
    if (previous === null) previous = now;
    clock = Math.min(duration, clock + Math.max(0, now - previous));
    previous = now;
    let next = 0;
    starts.forEach((time, index) => { if (clock >= time) next = index; });
    setScene(next);
    arena.classList.toggle('action-resolved', clock >= 7350);
    progress.style.setProperty('--progress', clock / duration);
    paint();
    if (clock >= duration) { finished = true; control(); }
    else frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previous = null;
    const stopped = !requested || !visible || document.hidden;
    arena.classList.toggle('motion-paused', stopped);
    if (!stopped && !reduced.matches && !finished) frame = requestAnimationFrame(tick);
  }
  function restart() {
    clock = 0; previous = null; finished = false; requested = true;
    particles = []; pulse = null; step = -1;
    arena.classList.toggle('action-resolved', reduced.matches);
    setScene(reduced.matches ? 3 : 0, false);
    if (reduced.matches) { clock = duration; finished = true; }
    progress.style.setProperty('--progress', clock / duration);
    control(); sync(); paint();
  }
  function showFinal() {
    cancelAnimationFrame(frame); frame = 0;
    finished = true; clock = duration; particles = []; pulse = null;
    arena.classList.add('action-resolved');
    setScene(3, false); progress.style.setProperty('--progress', 1); control(); paint();
  }
  pause.addEventListener('click', () => { requested = !requested; control(); sync(); });
  replay.addEventListener('click', restart);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', event => { if (event.matches) showFinal(); });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(arena);
  else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, {threshold: 0}).observe(arena);
  }
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  arena.addEventListener('pointermove', event => {
    if (reduced.matches || !finePointer.matches || innerWidth <= 760 || !requested) return;
    const box = arena.getBoundingClientRect();
    arena.style.setProperty('--camera-y', ((event.clientX - box.left) / box.width - .5) * 7 + 'deg');
    arena.style.setProperty('--camera-x', -((event.clientY - box.top) / box.height - .5) * 4 + 'deg');
  }, {passive: true});
  arena.addEventListener('pointerleave', () => { arena.style.setProperty('--camera-x', '0deg'); arena.style.setProperty('--camera-y', '0deg'); });
  resize(); restart();

  const chapters = [...document.querySelectorAll('[data-chapter]')];
  function selectChapter(chapter) {
    chapters.forEach(item => {
      const selected = item === chapter;
      item.classList.toggle('active', selected);
      item.querySelector('button').setAttribute('aria-expanded', String(selected));
      document.getElementById('detail-' + item.dataset.chapter).hidden = !selected;
      document.getElementById('card-' + item.dataset.chapter).hidden = !selected;
    });
  }
  chapters.forEach(chapter => chapter.querySelector('button').addEventListener('click', () => selectChapter(chapter)));

  const choices = [...document.querySelectorAll('[data-world]')];
  let selected = ['tech', 'finance', 'media'];
  function updateMix() {
    const list = document.querySelector('[data-selected-decks]');
    list.replaceChildren();
    selected.forEach((key, index) => {
      const choice = choices.find(button => button.dataset.world === key);
      const item = document.createElement('div');
      item.style.setProperty('--deck-color', choice.style.getPropertyValue('--world-color'));
      const number = document.createElement('b'); number.textContent = '0' + (index + 1);
      const name = document.createElement('span'); name.textContent = choice.dataset.name;
      const count = document.createElement('small'); count.textContent = '20 CARDS';
      name.append(count); item.append(number, name); list.append(item);
    });
    choices.forEach(button => button.setAttribute('aria-pressed', String(selected.includes(button.dataset.world))));
    document.querySelector('[data-deck-total]').textContent = String(selected.length * 20);
    document.querySelector('[data-deck-format]').textContent = selected.length === 3 ? 'Full format · 3 Mini Decks · play to 20 VP' : selected.length === 2 ? 'Compact format · 2 Mini Decks · play to 15 VP' : selected.length === 1 ? 'Choose one more world to make a 40-card deck.' : 'Choose two or three worlds to build a deck.';
    document.querySelector('[data-world-status]').textContent = selected.length ? selected.map(key => choices.find(button => button.dataset.world === key).dataset.name).join(', ') + '. ' + selected.length * 20 + ' cards selected.' : 'No worlds selected.';
  }
  choices.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.world;
    if (selected.includes(key)) selected = selected.filter(item => item !== key);
    else { if (selected.length === 3) selected.shift(); selected.push(key); }
    updateMix();
  }));

  const strip = document.querySelector('.statement-strip');
  let scrollFrame = 0;
  function scrollArt() {
    scrollFrame = 0;
    if (reduced.matches) return;
    const box = strip.getBoundingClientRect();
    if (box.bottom > 0 && box.top < innerHeight) strip.style.setProperty('--ticker-x', Math.round(-Math.max(0, innerHeight - box.top) * .2) + 'px');
  }
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(scrollArt); }, {passive: true});
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } });
    }, {threshold: .06});
    document.documentElement.classList.add('js-reveal');
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
})();
