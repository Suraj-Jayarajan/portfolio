<template>
    <!-- design inspired by https://www.authkit.com/ -->
    <div class="header">
        <h2><a href="https://codepen.io/RAFA3L" target="_blank" rel="noopener noreferrer"></a></h2>
        <div class="mid-spot" onclick="document.body.classList.toggle('gold');"></div>
        <button class="contact-btn">
            <span class="glow"></span>
            <span class="contact-btn-content">Contact Me</span>
        </button>

        <div class="spotlight">
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>

    <canvas ref="particleCanvas"></canvas>

    <div class="accent-lines">
        <div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
        <div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
    <div class="heroSubP">
        <p>Engineering with intent</p>
    </div>
    <div class="hero">
        <div class="heroT">
            <h2>Suraj Jayarajan</h2>
            <h2>Suraj Jayarajan</h2>
        </div>
    </div>
    <p class="heroP">Senior Full-Stack Developer<br>
        Laravel · Vue · Nuxt · n8n · AWS · FastAPI</br>
    </p>
    <div class="mountains">
        <div></div>
        <div></div>
        <div></div>
    </div>
    <div class="hero-spacer"></div>

    <div class="content-section">
        <div class="content-acc">
            <div></div>
            <div></div>
        </div>
        <p class="subt">Build With Me</p>
        <h3 class="title"> Flexible by Design.<br>
            Scalable by Nature.</h3>

        <div class="">
            <p class="subp">
                I architect and ship production systems—clean backend foundations, modern frontends, and cloud
                infrastructure that won’t limit growth
            </p>
            <div class="subp proofbar mt-4">
                <ul>
                    <li><strong>7+ years</strong> building in production</li>
                    <li><strong>16 projects</strong> shipped</li>
                    <li><strong>Backend + frontend + infra</strong> ownership</li>
                    <li><strong>Automation-first</strong> mindset (n8n)</li>
                </ul>
            </div>
        </div>

    </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';

const particleCanvas = ref(null);

onMounted(() => {
    const canvas = particleCanvas.value;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    let particleCount = calculateParticleCount();

    class Particle {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height;
            this.fadeDelay = Math.random() * 600 + 100;
            this.fadeStart = Date.now() + this.fadeDelay;
            this.fadingOut = false;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.speed = Math.random() / 5 + 0.1;
            this.opacity = 1;
            this.fadeDelay = Math.random() * 600 + 100;
            this.fadeStart = Date.now() + this.fadeDelay;
            this.fadingOut = false;
        }

        update() {
            this.y -= this.speed;
            if (this.y < 0) {
                this.reset();
            }

            if (!this.fadingOut && Date.now() > this.fadeStart) {
                this.fadingOut = true;
            }

            if (this.fadingOut) {
                this.opacity -= 0.008;
                if (this.opacity <= 0) {
                    this.reset();
                }
            }
        }

        draw() {
            ctx.fillStyle = `rgba(${255 - (Math.random() * 255 / 2)}, 255, 255, ${this.opacity})`;
            ctx.fillRect(this.x, this.y, 0.4, Math.random() * 2 + 1);
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animate);
    }

    function calculateParticleCount() {
        return Math.floor((canvas.width * canvas.height) / 6000);
    }

    function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particleCount = calculateParticleCount();
        initParticles();
    }

    window.addEventListener('resize', onResize);

    initParticles();
    animate();
});
</script>