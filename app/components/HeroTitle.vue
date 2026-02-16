<template>
    <div class="heroTitleWrap pointer-events-none absolute left-0 right-0 translate-y-[-1.6e] opacity-0">
        <h2
            class="heroTitleText absolute left-0 right-0 mx-auto w-fit font-semibold [font-size:clamp(2.8rem,6vw+1rem,7rem)]">
            {{ text }}
        </h2>

        <h2
            class="heroTitleText heroTitleText--glow absolute left-0 right-0 mx-auto w-fit font-semibold [font-size:clamp(2.8rem,6vw+1rem,7rem)]">
            {{ text }}
        </h2>
    </div>
</template>

<script setup>
defineProps({
    text: { type: String, required: true },
});
</script>

<style scoped>
.heroTitleWrap {
    animation: heroTitleFadeIn 2s ease-in-out 0.6s forwards;
}

@keyframes heroTitleFadeIn {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.heroTitleText {
    color: #9dc3f7;

    background:
        radial-gradient(2em 2em at 50% 50%,
            transparent calc(var(--p) - 2em),
            #fff calc(var(--p) - 1em),
            #fff calc(var(--p) - 0.4em),
            transparent var(--p)),
        linear-gradient(0deg, #bad1f1 30%, #9dc3f7 100%);

    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    text-shadow: 0 2px 16px rgba(174, 207, 242, 0.24);

    --p: 0%;
    transition: --p 3s linear;
    animation: heroTitlePulse 10s linear 1.2s infinite;
}

.heroTitleText--glow {
    background:
        radial-gradient(2em 2em at 50% 50%,
            transparent calc(var(--p) - 2em),
            transparent calc(var(--p) - 1em),
            #fff calc(var(--p) - 1em),
            #fff calc(var(--p) - 0.4em),
            transparent calc(var(--p) - 0.4em),
            transparent var(--p));

    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    filter: blur(16px) opacity(0.4);
}

@keyframes heroTitlePulse {
    0% {
        --p: 0%;
    }

    50% {
        --p: 300%;
    }

    100% {
        --p: 300%;
    }
}

@property --p {
    syntax: "<percentage>";
    inherits: false;
    initial-value: 0%;
}
</style>