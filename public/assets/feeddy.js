(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('[data-feeddy-motion]');
  const skip = document.querySelector('[data-intro-skip]');
  const pause = document.querySelector('[data-intro-pause]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let pausedByVisitor = false;
  let inView = true;
  function ready() {
    document.documentElement.classList.add('hero-ready');
    skip.hidden = true;
    pause.hidden = true;
  }
  stage.addEventListener('feeddy:ready', ready);
  function finishIntro() {
    stage.feeddyMotion?.showFinal();
    ready();
  }
  skip.addEventListener('click', () => { finishIntro(); document.querySelector('.hero-actions a').focus(); });
  pause.addEventListener('click', () => {
    pausedByVisitor = !pausedByVisitor;
    syncPlayback();
    pause.textContent = pausedByVisitor ? 'Riprendi animazione' : 'Pausa animazione';
  });
  function syncPlayback() {
    const motion = stage.feeddyMotion;
    if (!motion || motion.finished) return;
    if (document.hidden || !inView || pausedByVisitor) motion.pause();
    else motion.resume();
  }
  document.addEventListener('visibilitychange', syncPlayback);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncPlayback(); }, {threshold: 0}).observe(hero);
  }
  reduced.addEventListener('change', event => { if (event.matches) finishIntro(); });
  // Visitors can keep scrolling or use navigation while the intro is playing.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => { if (!stage.feeddyMotion?.finished) finishIntro(); });
  });
  if (reduced.matches || stage.classList.contains('is-revealing') || !stage.feeddyMotion) ready();

  const tabs = [...document.querySelectorAll('[data-tab]')];
  const captions = {
    editor: 'Componi foto, caroselli e video. Nello studio creativo trovi formati, ritaglio, testi, audio e sottotitoli. Controlli il risultato prima di usarlo.',
    calendar: 'Passa da Mese a Settimana o Agenda. Filtra per canale, lingua, formato e stato; nel tool puoi spostare le bozze e rivedere il piano prima dell’approvazione.',
    results: 'Ritrova metriche dei profili e dei contenuti, secondo i dati disponibili dai canali. L’inbox raccoglie commenti e richieste: il contesto resta vicino alle risposte.'
  };
  function selectTab(tab) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    document.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== tab.dataset.tab; });
    document.querySelectorAll('[data-menu]').forEach(item => { item.classList.toggle('active', item.dataset.menu === tab.dataset.tab); });
    document.querySelector('[data-demo-caption]').textContent = captions[tab.dataset.tab];
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(tabs[next]);
      tabs[next].focus();
    });
  });
  if ('IntersectionObserver' in window && !reduced.matches) {
    document.documentElement.classList.add('js-reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
      });
    }, {threshold: .08});
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
})();
