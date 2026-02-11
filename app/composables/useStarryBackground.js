import { onBeforeUnmount, onMounted, ref, watch } from "vue";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function useStarryBackground(canvasRef, optsRef, fullViewportRef, enabledRef = ref(true)) {
  const isRunning = ref(false);

  let ctx = null;
  let rafId = 0;
  let stars = [];
  let dpr = 1;

  function getTargetSize() {
    if (fullViewportRef.value) return { w: window.innerWidth, h: window.innerHeight };
    const el = canvasRef.value?.parentElement;
    if (!el) return { w: window.innerWidth, h: window.innerHeight };
    const rect = el.getBoundingClientRect();
    return { w: Math.max(1, rect.width), h: Math.max(1, rect.height) };
  }

  function generateStars(w, h) {
    const o = optsRef.value || {};
    const density = o.density ?? 0.55;
    const starMinRadius = o.starMinRadius ?? 0.4;
    const starMaxRadius = o.starMaxRadius ?? 1.6;

    const count = Math.floor(((w * h) / 10000) * density);

    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: rand(starMinRadius, starMaxRadius),
      baseAlpha: rand(0.35, 0.95),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.002, 0.012),
    }));
  }

  function resizeCanvas() {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const { w, h } = getTargetSize();
    dpr = clamp(window.devicePixelRatio || 1, 1, 2);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    generateStars(w, h);
  }

  function drawBackground(w, h) {
    if (!ctx) return;
    const bg = optsRef.value?.bgColor ?? "#050611";

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const g = ctx.createRadialGradient(
      w * 0.5,
      h * 0.45,
      10,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.7
    );
    g.addColorStop(0, "rgba(255,255,255,0.02)");
    g.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function drawStars(w, h, t) {
    if (!ctx) return;

    const o = optsRef.value || {};
    const animate = o.animate ?? true;
    const twinkle = o.twinkle ?? 0.25;

    for (const s of stars) {
      const tw = animate ? (Math.sin(t * s.speed + s.phase) * 0.5 + 0.5) : 0.5;
      const a = clamp(s.baseAlpha + (tw - 0.5) * twinkle, 0.05, 1);

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.shadowColor = `rgba(180,200,255,${a * 0.6})`;
      ctx.shadowBlur = s.r * 6;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function loop(t) {
    const canvas = canvasRef.value;
    if (!canvas || !ctx || !isRunning.value) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    drawBackground(w, h);
    drawStars(w, h, t);

    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (!enabledRef.value) return;
    stop();
    resizeCanvas();
    isRunning.value = true;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(rafId);
    isRunning.value = false;
  }

  onMounted(() => {
    if (typeof window === "undefined") return;

    const onResize = () => {
      if (isRunning.value) resizeCanvas();
    };
    window.addEventListener("resize", onResize, { passive: true });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", onResize);
      stop();
    });

    // start if enabled initially
    if (enabledRef.value) start();
  });

  watch([optsRef, fullViewportRef], () => {
    if (enabledRef.value) start();
  }, { deep: true });

  watch(enabledRef, (on) => {
    if (on) start();
    else stop();
  });

  return { isRunning, start, stop, resizeCanvas };
}