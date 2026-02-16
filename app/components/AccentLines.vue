<!-- components/AccentLines.vue -->
<template>
  <div class="accent-lines" :style="rootStyle" aria-hidden="true">
    <!-- horizontals -->
    <div>
      <div v-for="(t, i) in hTopsComputed" :key="`h-${i}`" :style="{ top: t }"></div>
    </div>

    <!-- verticals -->
    <div>
      <div v-for="(pos, i) in vPositionsComputed" :key="`v-${i}`" :style="pos"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

/**
 * This version makes positions proportional to the viewport
 * using vh/vw by default (so it scales with screen size).
 *
 * You can pass arrays as numbers in "percent of the canvas",
 * and it will convert them to vh/vw (or keep strings as-is).
 */
const props = defineProps({
  /** container height (can be "42vh", "50vh", etc). default scales with viewport */
  height: { type: [String, Number], default: "42vh" },

  /** accent color */
  color: { type: String, default: "rgba(186, 215, 247, .18)" },

  /** z-index */
  zIndex: { type: Number, default: -2 },

  /**
   * Horizontal line tops.
   * - If you pass numbers: treated as % of container height (0..100)
   * - If you pass strings: used as-is (e.g. "10vh", "120px", "6em")
   */
  hTops: { type: Array, default: () => [14.2857, 26.1905, 38.0952, 57.1429, 69.0476] },

  /**
   * Vertical positions.
   * You can pass:
   * - numbers => treated as % of container width (0..100) from LEFT
   * - objects => { left: number|string } or { right: number|string }
   *
   * Default approximates your old 24em/34em offsets, but responsive.
   */
  vPositions: {
    type: Array,
    default: () => [
      { left: 30 }, // 30%
      { left: 40 }, // 40%
      { right: 30 }, // 30% from right
      { right: 40 }, // 40% from right
    ],
  },

  /**
   * If true, convert numeric values to vh/vw instead of %
   * (keeps things proportional to viewport even if parent isn’t full width/height).
   *
   * - horizontals: number -> vh
   * - verticals: number -> vw
   */
  useViewportUnits: { type: Boolean, default: true },
});

function cssLenFromPercent(n, axis) {
  // axis: "h" => vertical measure (top) ; "w" => horizontal measure (left/right)
  if (!Number.isFinite(n)) return "0";
  const clamped = Math.max(0, Math.min(100, n));

  if (props.useViewportUnits) {
    return axis === "h" ? `${clamped}vh` : `${clamped}vw`;
  }
  return `${clamped}%`;
}

function normalizeTop(val) {
  if (typeof val === "number") return cssLenFromPercent(val, "h");
  return String(val);
}

function normalizeSide(val, axis /* "w" */) {
  if (typeof val === "number") return cssLenFromPercent(val, axis);
  return String(val);
}

const hTopsComputed = computed(() => (props.hTops || []).map(normalizeTop));

const vPositionsComputed = computed(() => {
  return (props.vPositions || []).map((p) => {
    // number = left percent
    if (typeof p === "number") return { left: normalizeSide(p, "w") };

    // object form
    const out = {};
    if (p.left != null) out.left = normalizeSide(p.left, "w");
    if (p.right != null) out.right = normalizeSide(p.right, "w");
    return out;
  });
});

const rootStyle = computed(() => ({
  height: typeof props.height === "number" ? `${props.height}px` : props.height,
  zIndex: props.zIndex,
  "--accent-lines-clr": props.color,
}));
</script>

<style scoped>
.accent-lines {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: -2;
  --accent-lines-clr: rgba(186, 215, 247, 0.18);
}

.accent-lines>div {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  margin: auto;
  height: 100%;
  width: 100%;
}

/* horizontals */
.accent-lines>div:nth-child(1)>div {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  margin: auto;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-lines-clr), transparent);
  opacity: 0;
  scale: 0;
  animation: accentload 2s ease-out 2.4s forwards;
}

/* verticals */
.accent-lines>div:nth-child(2)>div {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  margin: auto;
  width: 1px;
  height: 100%;
  background: var(--accent-lines-clr);
  opacity: 0;
  scale: 0;
  animation: accentload 2s ease-out 2s forwards;
}

@keyframes accentload {
  0% {
    opacity: 0;
    scale: 0;
  }

  100% {
    opacity: 1;
    scale: 1;
  }
}

/* ---- The extra accents from your original CSS are tied to nth-child indexes.
   They remain, but their offsets (24em etc) are no longer used.
   If you want these extras proportional too, tell me and I’ll convert them to
   CSS variables derived from props. ---- */

/* dots */
.accent-lines>div:nth-child(1)>div::before,
.accent-lines>div:nth-child(1)>div::after {
  content: "";
  display: none;
  position: absolute;
  width: 0.2em;
  height: 0.2em;
  border-radius: 1em;
  background: #9dc3f7;
  left: 0;
  right: 0;
  margin: auto;
  translate: 0 -1px;

  opacity: 0;
  scale: 0;
  animation: accentload 2s ease-out 4.4s forwards;
}

/* keep the original “show dot” behavior by line index (3,4,5) */
.accent-lines>div:nth-child(1)>div:nth-child(3)::before,
.accent-lines>div:nth-child(1)>div:nth-child(4)::before,
.accent-lines>div:nth-child(1)>div:nth-child(5)::before {
  display: block;
  left: 30vw;
  /* proportional replacement for 24em */
}

.accent-lines>div:nth-child(1)>div:nth-child(3)::after,
.accent-lines>div:nth-child(1)>div:nth-child(4)::after,
.accent-lines>div:nth-child(1)>div:nth-child(5)::after {
  display: block;
  right: 30vw;
  /* proportional replacement for 24em */
}

/* diagonal mini-lines for first two horizontals (proportional replacement) */
.accent-lines>div:nth-child(1)>div:nth-child(2)::before,
.accent-lines>div:nth-child(1)>div:nth-child(2)::after {
  display: block;
  width: 5vw;
  height: 1px;
  border-radius: 0;
  opacity: 0.12;
}

.accent-lines>div:nth-child(1)>div:nth-child(2)::before {
  right: 30vw;
  rotate: 45deg;
  translate: -2.5vw 6vh;
}

.accent-lines>div:nth-child(1)>div:nth-child(2)::after {
  right: 30vw;
  rotate: -45deg;
  translate: -2.5vw 6vh;
}

.accent-lines>div:nth-child(1)>div:nth-child(1)::before,
.accent-lines>div:nth-child(1)>div:nth-child(1)::after {
  display: block;
  width: 5vw;
  height: 1px;
  border-radius: 0;
  opacity: 0.12;
}

.accent-lines>div:nth-child(1)>div:nth-child(1)::before {
  left: 30vw;
  rotate: 45deg;
  translate: 2.5vw 18vh;
}

.accent-lines>div:nth-child(1)>div:nth-child(1)::after {
  left: 30vw;
  rotate: -45deg;
  translate: 2.5vw 18vh;
}

.accent-lines>div:nth-child(1)>div:nth-child(2)::before,
.accent-lines>div:nth-child(1)>div:nth-child(2)::after {
  opacity: 0;
  scale: 0;
  animation: accentload2 2s ease-out 2.4s forwards;
}

.accent-lines>div:nth-child(1)>div:nth-child(1)::before,
.accent-lines>div:nth-child(1)>div:nth-child(1)::after {
  opacity: 0;
  scale: 0;
  animation: accentload3 2s ease-out 2.4s forwards;
}

@keyframes accentload2 {
  0% {
    opacity: 0;
    scale: 0;
    transform: rotate(360deg);
  }

  50% {
    scale: 0;
  }

  100% {
    opacity: 0.12;
    scale: 1;
    transform: rotate(0deg);
  }
}

@keyframes accentload3 {
  0% {
    opacity: 0;
    scale: 0;
    transform: rotate(-360deg);
  }

  50% {
    scale: 0;
  }

  100% {
    opacity: 0.12;
    scale: 1;
    transform: rotate(0deg);
  }
}
</style>