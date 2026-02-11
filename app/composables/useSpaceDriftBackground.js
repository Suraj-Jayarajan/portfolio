// composables/useSpaceDriftBackground.js
import { onMounted, onBeforeUnmount, nextTick, watch, ref } from "vue";

export function useSpaceDriftBackground(canvasRef, options = {}, enabledRef = ref(true)) {
  const { density = 1, fullscreen = true } = options;

  let canvas = null;
  let ctx = null;
  let particles = [];
  let particleCount = 0;
  let rafId = null;
  let running = false;

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * (canvas ? canvas.height : 0);
      this.fadeDelay = Math.random() * 600 + 100;
      this.fadeStart = Date.now() + this.fadeDelay;
      this.fadingOut = false;
    }
    reset() {
      if (!canvas) return;
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.speed = Math.random() / 5 + 0.1;
      this.opacity = 1;
      this.fadeDelay = Math.random() * 600 + 100;
      this.fadeStart = Date.now() + this.fadeDelay;
      this.fadingOut = false;
    }
    update() {
      if (!canvas) return;
      this.y -= this.speed;
      if (this.y < 0) this.reset();

      if (!this.fadingOut && Date.now() > this.fadeStart) this.fadingOut = true;

      if (this.fadingOut) {
        this.opacity -= 0.008;
        if (this.opacity <= 0) this.reset();
      }
    }
    draw() {
      if (!ctx) return;
      ctx.fillStyle = `rgba(${255 - (Math.random() * 255) / 2}, 255, 255, ${this.opacity})`;
      ctx.fillRect(this.x, this.y, 0.4, Math.random() * 2 + 1);
    }
  }

  function calculateParticleCount() {
    if (!canvas) return 0;
    const base = Math.floor((canvas.width * canvas.height) / 6000);
    return Math.max(1, Math.floor(base * density));
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
  }

  function setCanvasSize() {
    if (!canvas) return;

    if (fullscreen) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
    }
  }

  function onResize() {
    if (!running || !canvas) return;
    setCanvasSize();
    particleCount = calculateParticleCount();
    initParticles();
  }

  function animate() {
    if (!running || !canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.update();
      p.draw();
    }

    rafId = requestAnimationFrame(animate);
  }

  async function start() {
    if (running) return;
    if (typeof window === "undefined") return; // SSR guard
    if (enabledRef && "value" in enabledRef && !enabledRef.value) return;

    await nextTick(); // ensure template ref is attached
    canvas = canvasRef.value;
    if (!canvas) return;

    ctx = canvas.getContext("2d");
    if (!ctx) return;

    running = true;
    setCanvasSize();
    particleCount = calculateParticleCount();
    initParticles();

    rafId = requestAnimationFrame(animate);
    window.addEventListener("resize", onResize, { passive: true });
  }

  function stop() {
    running = false;
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
    window.removeEventListener("resize", onResize);
    particles = [];
  }

  onMounted(start);
  onBeforeUnmount(stop);

  // optional enable/disable support
  if (enabledRef && "value" in enabledRef) {
    watch(enabledRef, (on) => {
      if (on) start();
      else stop();
    });
  }

  return { start, stop };
}