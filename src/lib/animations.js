import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { initHeroCanvas } from './heroCanvas.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

let lenis = null;
let stopHeroCanvas = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initLenis(reduceMotion) {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
  if (reduceMotion) return;

  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function initHeaderScroll() {
  const header = document.querySelector('[data-site-header]');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 50);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initHeroSplit(reduceMotion) {
  const heroTitle = document.querySelector('[data-hero-split]');
  if (!heroTitle || reduceMotion) return;
  const split = SplitText.create(heroTitle, { type: 'words', mask: 'words' });
  gsap.from(split.words, {
    yPercent: 120,
    opacity: 0,
    duration: 0.9,
    stagger: 0.06,
    ease: 'power3.out',
    delay: 0.15,
  });
}

function initReveal(reduceMotion) {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (reduceMotion) {
    gsap.set(items, { opacity: 1, y: 0, filter: 'blur(0px)' });
    return;
  }
  ScrollTrigger.batch(items, {
    start: 'top 85%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        overwrite: true,
      }),
  });
}

function initCounters(reduceMotion) {
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.counterSuffix || '';
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    const obj = { value: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          value: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.value) + suffix;
          },
        });
      },
    });
  });
}

function initCardTilt(reduceMotion) {
  if (reduceMotion) return;
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.style.transformPerspective = '700px';
    const rotateX = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power3' });
    const rotateY = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power3' });
    const scale = gsap.quickTo(card, 'scale', { duration: 0.4, ease: 'power3' });

    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rotateY(px * 6);
      rotateX(-py * 6);
      scale(1.02);
    });
    card.addEventListener('mouseleave', () => {
      rotateX(0);
      rotateY(0);
      scale(1);
    });
  });
}

function initMarquee(reduceMotion) {
  document.querySelectorAll('[data-marquee]').forEach((wrapper) => {
    const track = wrapper.querySelector('[data-marquee-track]');
    const content = wrapper.querySelector('[data-marquee-content]');
    if (!track || !content || reduceMotion) return;

    const clone = content.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
    const distance = content.offsetWidth;

    gsap.fromTo(
      track,
      { x: 0 },
      {
        x: -distance,
        duration: Math.max(distance / 55, 12),
        ease: 'none',
        repeat: -1,
      }
    );
  });
}

export function initSiteAnimations() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  if (stopHeroCanvas) {
    stopHeroCanvas();
    stopHeroCanvas = null;
  }

  const reduceMotion = prefersReducedMotion();
  initLenis(reduceMotion);
  initHeaderScroll();
  initHeroSplit(reduceMotion);
  initReveal(reduceMotion);
  initCounters(reduceMotion);
  initCardTilt(reduceMotion);
  initMarquee(reduceMotion);
  stopHeroCanvas = initHeroCanvas();

  ScrollTrigger.refresh();
}

document.addEventListener('astro:page-load', initSiteAnimations);
