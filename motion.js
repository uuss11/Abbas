// Reveal content only when motion is allowed and the browser supports it.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -36px 0px', threshold: 0.04 });
  document.querySelectorAll('.card, details').forEach(element => {
    element.classList.add('reveal');
    revealObserver.observe(element);
  });
}
