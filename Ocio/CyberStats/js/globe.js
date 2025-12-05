// ============================================
// Globe Module
// 3D Earth visualization with Three.js
// ============================================

const Globe = (function () {
    'use strict';

    let scene, camera, renderer, globe, atmosphere;
    let isRotating = true;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };
    const GLOBE_RADIUS = 200;

    // Initialize Three.js scene
    function init(container) {
        const canvas = container.querySelector('#globe-canvas');
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene setup
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0a0e27, 500, 1500);

        // Camera setup
        camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
        camera.position.z = 600;

        // Renderer setup
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x0a0e27, 0);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(200, 500, 300);
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x00d9ff, 0.5, 1000);
        pointLight.position.set(-200, 0, 300);
        scene.add(pointLight);

        // Create Earth
        createGlobe();

        // Create atmosphere glow
        createAtmosphere();

        // Event listeners
        setupEventListeners(canvas);

        // Handle window resize
        window.addEventListener('resize', () => handleResize(container));

        return { scene, camera, renderer };
    }

    // Create the Earth globe
    function createGlobe() {
        const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);

        // Create a simple Earth-like texture using canvas
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = 2048;
        textureCanvas.height = 1024;
        const ctx = textureCanvas.getContext('2d');

        // Ocean blue background
        const gradient = ctx.createLinearGradient(0, 0, 0, textureCanvas.height);
        gradient.addColorStop(0, '#1a2332');
        gradient.addColorStop(0.5, '#0d1b2a');
        gradient.addColorStop(1, '#1a2332');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

        // Add some continent-like shapes (simplified)
        ctx.fillStyle = '#2d4a3e';
        ctx.globalAlpha = 0.8;

        // North America
        ctx.beginPath();
        ctx.ellipse(300, 300, 150, 120, 0, 0, Math.PI * 2);
        ctx.fill();

        // South America
        ctx.beginPath();
        ctx.ellipse(400, 600, 80, 140, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Europe/Africa
        ctx.beginPath();
        ctx.ellipse(1024, 350, 200, 180, 0, 0, Math.PI * 2);
        ctx.fill();

        // Asia
        ctx.beginPath();
        ctx.ellipse(1500, 300, 250, 150, 0, 0, Math.PI * 2);
        ctx.fill();

        // Australia
        ctx.beginPath();
        ctx.ellipse(1600, 650, 100, 80, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add grid lines
        ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;

        // Latitude lines
        for (let i = 0; i < 9; i++) {
            const y = (textureCanvas.height / 8) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(textureCanvas.width, y);
            ctx.stroke();
        }

        // Longitude lines
        for (let i = 0; i < 17; i++) {
            const x = (textureCanvas.width / 16) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, textureCanvas.height);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(textureCanvas);
        texture.needsUpdate = true;

        const material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpScale: 2,
            shininess: 10,
            specular: new THREE.Color(0x333333),
        });

        globe = new THREE.Mesh(geometry, material);
        globe.rotation.y = Math.PI; // Start with a good view
        scene.add(globe);
    }

    // Create atmospheric glow effect
    function createAtmosphere() {
        const geometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.15, 64, 64);

        const material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.0, 0.85, 1.0, 1.0) * intensity;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true,
        });

        atmosphere = new THREE.Mesh(geometry, material);
        scene.add(atmosphere);
    }

    // Setup mouse/touch event listeners
    function setupEventListeners(canvas) {
        // Mouse events
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseUp);

        // Wheel zoom
        canvas.addEventListener('wheel', onWheel, { passive: false });

        // Touch events
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd);
    }

    function onMouseDown(e) {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
        rotationVelocity = { x: 0, y: 0 };
    }

    function onMouseMove(e) {
        if (!isDragging) return;

        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        rotationVelocity.y = deltaX * 0.005;
        rotationVelocity.x = deltaY * 0.005;

        globe.rotation.y += rotationVelocity.y;
        globe.rotation.x += rotationVelocity.x;

        // Clamp X rotation to prevent flipping
        globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x));

        previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    function onMouseUp() {
        isDragging = false;
    }

    function onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY * 0.5;
        camera.position.z = Math.max(350, Math.min(1000, camera.position.z + delta));
    }

    let touchStartDistance = 0;

    function onTouchStart(e) {
        e.preventDefault();

        if (e.touches.length === 1) {
            isDragging = true;
            previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else if (e.touches.length === 2) {
            isDragging = false;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchStartDistance = Math.sqrt(dx * dx + dy * dy);
        }
    }

    function onTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1 && isDragging) {
            const deltaX = e.touches[0].clientX - previousMousePosition.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.y;

            globe.rotation.y += deltaX * 0.005;
            globe.rotation.x += deltaY * 0.005;
            globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x));

            previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const delta = (touchStartDistance - distance) * 2;
            camera.position.z = Math.max(350, Math.min(1000, camera.position.z + delta));
            touchStartDistance = distance;
        }
    }

    function onTouchEnd() {
        isDragging = false;
    }

    function handleResize(container) {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // Animation loop
    function animate() {
        // Auto-rotation when not dragging
        if (isRotating && !isDragging) {
            globe.rotation.y += 0.001;
        }

        // Apply velocity damping
        if (!isDragging) {
            rotationVelocity.x *= 0.95;
            rotationVelocity.y *= 0.95;

            globe.rotation.y += rotationVelocity.y;
            globe.rotation.x += rotationVelocity.x;
        }

        // Sync atmosphere rotation
        if (atmosphere) {
            atmosphere.rotation.copy(globe.rotation);
        }

        renderer.render(scene, camera);
    }

    // Convert lat/lon to 3D position on globe
    function latLonToVector3(lat, lon, radius = GLOBE_RADIUS) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
    }

    // Public API
    return {
        init,
        animate,
        getScene: () => scene,
        getGlobe: () => globe,
        getCamera: () => camera,
        getRenderer: () => renderer,
        latLonToVector3,
        toggleRotation: () => { isRotating = !isRotating; return isRotating; },
        resetView: () => {
            camera.position.set(0, 0, 600);
            globe.rotation.set(0, Math.PI, 0);
            rotationVelocity = { x: 0, y: 0 };
        },
        GLOBE_RADIUS,
    };
})();

// Make available globally
window.Globe = Globe;
