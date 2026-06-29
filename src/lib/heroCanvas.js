const FOCAL_X = 0.715;
const FOCAL_Y = 0.05;
const ACCENT = [61, 169, 224]; // #3DA9E0

function buildCables() {
  const cables = [];
  const leftN = 11;
  for (let i = 0; i < leftN; i++) {
    const t = i / (leftN - 1);
    cables.push({ ex: 0.04 + t * 0.52, ey: 0.62 + t * 0.3 });
  }
  const rightN = 6;
  for (let i = 0; i < rightN; i++) {
    const t = i / (rightN - 1);
    cables.push({ ex: 0.8 + t * 0.2, ey: 0.34 + t * 0.26 });
  }
  return cables;
}

function buildParticles(count = 56) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.8,
      vy: 0.004 + Math.random() * 0.012,
      vx: (Math.random() - 0.5) * 0.004,
      tw: Math.random() * Math.PI * 2,
      twv: 0.6 + Math.random() * 1.4,
      hue: Math.random(),
    });
  }
  return particles;
}

function drawCables(ctx, w, h, cables) {
  const fx = FOCAL_X * w;
  const fy = FOCAL_Y * h;
  const [ar, ag, ab] = ACCENT;
  for (const cable of cables) {
    const ex = cable.ex * w;
    const ey = cable.ey * h;

    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = 'rgba(190,222,245,0.10)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.12)`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}

/** Cable-stayed bridge cables + drifting light particles, radiating from the pylon focal point. */
export function initHeroCanvas() {
  const canvas = document.querySelector('[data-hero-canvas]');
  if (!canvas) return () => {};
  // Hidden below md (Tailwind 768px) — the cable lines crowd the photo on small screens.
  if (!window.matchMedia('(min-width: 768px)').matches) return () => {};

  const ctx = canvas.getContext('2d');
  const cables = buildCables();
  const particles = buildParticles();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startTime = performance.now();
  let raf = null;
  let width = 0;
  let height = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduceMotion) drawStatic();
  }

  function drawStatic() {
    ctx.clearRect(0, 0, width, height);
    drawCables(ctx, width, height, cables);
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    const [ar, ag, ab] = ACCENT;
    const fx = FOCAL_X * width;
    const fy = FOCAL_Y * height;
    const pulse = 0.5 + 0.5 * Math.sin(time * 1.1);
    const gradient = ctx.createRadialGradient(fx, fy + 6, 0, fx, fy + 6, 150 + pulse * 30);
    gradient.addColorStop(0, `rgba(${ar},${ag},${ab},${0.22 + pulse * 0.12})`);
    gradient.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(fx - 200, fy - 200, 400, 400);

    drawCables(ctx, width, height, cables);

    for (const particle of particles) {
      particle.y -= particle.vy * 0.016;
      particle.x += particle.vx * 0.016;
      if (particle.y < -0.02) {
        particle.y = 1.02;
        particle.x = Math.random();
      }
      const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * particle.twv + particle.tw));
      let color;
      if (particle.hue < 0.6) color = `${ar},${ag},${ab}`;
      else if (particle.hue < 0.85) color = '255,255,255';
      else color = '245,197,24';

      ctx.beginPath();
      ctx.arc(particle.x * width, particle.y * height, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${twinkle * 0.5})`;
      ctx.shadowColor = `rgba(${color},0.6)`;
      ctx.shadowBlur = particle.r * 3;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function loop(now) {
    draw((now - startTime) / 1000);
    raf = requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);

  if (reduceMotion) {
    drawStatic();
  } else {
    raf = requestAnimationFrame(loop);
  }

  return () => {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
}
