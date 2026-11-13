// Move the complete original render as one plane. No mesh or pixel deformation.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const resetters = [];
  document.querySelectorAll('.benefit-card').forEach(card => {
    const frame = card.querySelector('.benefit-art-frame');
    const image = frame?.querySelector('.benefit-art');
    if (!image) return;
    const plane = document.createElement('div');
    plane.className = 'benefit-art-tilt';
    image.before(plane);
    plane.append(image);
    const current = { x: 0, y: 0, lift: 0 };
    const target = { x: 0, y: 0, lift: 0 };
    let raf = 0, previous = 0;
    function tick(time) {
      raf = 0;
      const dt = previous ? Math.min((time - previous) / 1000, .05) : 1 / 60;
      previous = time;
      const ease = 1 - Math.exp(-9 * dt);
      let remaining = 0;
      for (const key of ['x', 'y', 'lift']) {
        current[key] += (target[key] - current[key]) * ease;
        remaining = Math.max(remaining, Math.abs(target[key] - current[key]));
      }
      plane.style.transform = `perspective(900px) translate3d(${current.x * 2}px,${-current.lift * 6}px,0) rotateX(${-current.y * 4}deg) rotateY(${current.x * 5.5}deg)`;
      if (remaining > .002) raf = requestAnimationFrame(tick);
      else {
        previous = 0;
        if (!target.lift) plane.style.transform = 'none';
      }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    function track(event) {
      if (reduced.matches || event.pointerType === 'touch') return;
      const bounds = card.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      target.y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      target.lift = 1;
      kick();
    }
    function leave() { target.x = target.y = target.lift = 0; kick(); }
    function reset() {
      cancelAnimationFrame(raf); raf = previous = 0;
      for (const key of ['x', 'y', 'lift']) current[key] = target[key] = 0;
      plane.style.transform = 'none';
    }
    card.addEventListener('pointerenter', track);
    card.addEventListener('pointermove', track);
    card.addEventListener('pointerleave', leave);
    card.addEventListener('pointercancel', leave);
    new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) reset(); }).observe(card);
    resetters.push(reset);
  });
  reduced.addEventListener('change', () => resetters.forEach(reset => reset()));
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetters.forEach(reset => reset()); });
})();
