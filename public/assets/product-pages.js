document.documentElement.classList.add('reveal-ready');

const sections = [...document.querySelectorAll('.hero, .section, .hub-intro, .hub-grid')];
const directions = ['reveal-up', 'reveal-left', 'reveal-right'];

sections.forEach((section, index) => {
  section.classList.add('reveal-section', directions[index % directions.length]);
});

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -7% 0px',
  });

  sections.forEach((section) => observer.observe(section));
} else {
  sections.forEach((section) => section.classList.add('is-visible'));
}
