<template>
  <section
    class="relative w-full min-h-screen overflow-hidden"
    style="background: #05060f linear-gradient(0deg, rgba(216,236,248,.06), rgba(152,192,239,.06));"
  >
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full block" />
    <div class="relative z-10 min-h-screen grid place-items-center text-white text-center px-6 py-16">
      <slot />
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useSpaceDriftBackground } from "~/composables/useSpaceDriftBackground";

const canvasRef = ref(null);

useSpaceDriftBackground(canvasRef, { density: 1, fullscreen: true });
</script>