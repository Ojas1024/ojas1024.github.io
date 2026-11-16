// Washes that crossfade per section, reveal-on-scroll, section progress, gentle parallax, ink on click, typing.
(() => {
  "use strict";
  const motion = document.documentElement.classList.contains("motion");
  // Content is hidden for the reveal animation only once this script is running.
  document.documentElement.classList.add("ready");
  const washes = Object.fromEntries([...document.querySelectorAll(".wash i")].map((i) => [i.dataset.w, i]));
  const inks = { hero: "#d4a32f", research: "#556324", systems: "#4a66a8", products: "#97a24c", about: "#d4a32f" };
  let current = "hero";

  function setWash(name) {
    if (!washes[name] || name === current && washes[name].classList.contains("on")) return;
    Object.values(washes).forEach((w) => w.classList.toggle("on", w.dataset.w === name));
    current = name;
    document.querySelectorAll(".chips a").forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#${name}`));
  }
  setWash("hero");

  // which section owns the middle of the viewport
  const sections = [...document.querySelectorAll("[data-wash]")];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setWash(e.target.dataset.wash); });
  }, { rootMargin: "-45% 0px -45% 0px" });
  sections.forEach((s) => io.observe(s));

  // reveal
  const rev = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rev.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal, .collage").forEach((el) => (motion ? rev.observe(el) : el.classList.add("in")));

  // progress bars in the nav: how far through each chapter we are
  const bars = [...document.querySelectorAll(".progress a")].map((a) => [a, document.getElementById(a.dataset.s)]);
  let ticking = false;
  function progress() {
    ticking = false;
    const mid = innerHeight / 2;
    bars.forEach(([a, sec]) => {
      const r = sec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      a.style.setProperty("--p", p.toFixed(3));
    });
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
  progress();

  if (!motion) return;

  // parallax on the hero collage
  const collage = document.querySelector(".collage");
  const cards = [...collage.querySelectorAll("[data-depth]")];
  collage.closest(".hero").addEventListener("pointermove", (e) => {
    const r = collage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    cards.forEach((c) => { const d = +c.dataset.depth; c.style.transform = `translate(${(-x * d).toFixed(1)}px, ${(-y * d).toFixed(1)}px)`; });
  });

  // a drop of the chapter's ink where blank paper is clicked
  const washEl = document.querySelector(".wash");
  addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button, .card, .tile, pre, input")) return;
    const ink = document.createElement("i");
    ink.className = "ink";
    ink.style.left = `${e.clientX + innerWidth * 0.1}px`;
    ink.style.top = `${e.clientY + innerHeight * 0.1}px`;
    ink.style.setProperty("--ink-c", inks[current] || inks.hero);
    washEl.appendChild(ink);
    setTimeout(() => ink.remove(), 2500);
  });

  // typing in the AetherOS terminal when it scrolls into view
  document.querySelectorAll(".typed").forEach((el) => {
    const text = el.dataset.text;
    const t = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      t.disconnect();
      let i = 0;
      const step = () => { el.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(step, 55 + Math.random() * 60); };
      step();
    }, { threshold: 0.6 });
    t.observe(el);
  });
})();
