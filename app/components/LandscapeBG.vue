<template>
    <div ref="container" class="landscape-bg"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

const container = ref(null);

let scene, camera, renderer;
let meshFront, meshBack; // PARALLAX
let animationId;
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;


const noise3D = createNoise3D();

function createTerrain({ width, height, segX, segY, color, y, z }) {
    const geometry = new THREE.PlaneGeometry(width, height, segX, segY);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshLambertMaterial({
        vertexColors: true,
    });


    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = y;
    mesh.position.z = z;

    return mesh;
}

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x2f2f2f, 200, 650);

    // Camera
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        500
    );
    camera.position.set(0, 38, 140);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x2a2a2a, 1);

    container.value.appendChild(renderer.domElement);

    // 🔹 PARALLAX BACK LAYER (softer, slower)
    meshBack = createTerrain({
        width: 460,
        height: 240,
        segX: 200,
        segY: 100,
        color: 0x3a3a3a,
        y: -22,
        z: -40,
    });
    scene.add(meshBack);

    // 🔹 FRONT LAYER (existing terrain)
    meshFront = createTerrain({
        width: 420,
        height: 220,
        segX: 240,
        segY: 120,
        color: 0x2a2a2a,
        y: -8,
        z: 0,
    });
    scene.add(meshFront);

    // Lighting (unchanged)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.75);
    keyLight.position.set(0, 150, 100);
    scene.add(keyLight);


    const light = new THREE.DirectionalLight(0xffffff, 0.25);
    light.position.set(0, 200, 100);
    scene.add(light);


    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);



    animate();
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
}

function updateTerrain(mesh, time, scale, amp, speed) {
    const geom = mesh.geometry;
    const pos = geom.attributes.position;

    // Create color attribute once
    if (!geom.attributes.color) {
        const colors = new Float32Array(pos.count * 3);
        geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }

    const colors = geom.attributes.color;

    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);

        const height =
            noise3D(x * scale, z * scale, time * speed) * amp +
            noise3D(x * scale * 2, z * scale * 2, time * speed * 0.8) * (amp * 0.3);

        pos.setY(i, height);

        // 🎨 HEIGHT-BASED LIGHTING
        const shade = THREE.MathUtils.clamp(
            THREE.MathUtils.mapLinear(height, -amp, amp, 0.35, 0.75),
            0,
            1
        );

        colors.setXYZ(i, shade, shade, shade);
    }

    pos.needsUpdate = true;
    colors.needsUpdate = true;
    geom.computeVertexNormals();
}

function animate(time = 0) {
    animationId = requestAnimationFrame(animate);

    // Terrain animation
    updateTerrain(meshBack, time, 0.006, 6, 0.00008);
    updateTerrain(meshFront, time, 0.008, 9, 0.00015);

    // Smooth easing (important)
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    // 🎯 Mouse-based parallax
    camera.position.x = mouseX * 6;
    camera.position.y = 38 + mouseY * 3;

    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}



function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;

    targetX = x;
    targetY = y;
}


onMounted(() => {
    init();
});

onBeforeUnmount(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("mousemove", onMouseMove);

    meshBack.geometry.dispose();
    meshBack.material.dispose();
    meshFront.geometry.dispose();
    meshFront.material.dispose();
    renderer.dispose();
});
</script>

<style>
body::before {
    content: "";
    position: fixed;
    inset: 0;
    opacity: 0.04;
    pointer-events: none;
}

body::after {
    background: radial-gradient(ellipse at top,
            rgba(255, 255, 255, 0.1),
            rgba(0, 0, 0, 0.25) 55%);
}

.landscape-bg {
    position: fixed;
    inset: 0;
    z-index: -1;
    background: #0a0a0a;
}
</style>
