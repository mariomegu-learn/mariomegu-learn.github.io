// ============================================
// Attack Visualizer Module
// Renders attack arcs on the 3D globe
// ============================================

const AttackVisualizer = (function () {
    'use strict';

    let scene, globe;
    const activeAttacks = new Map();
    const MAX_ACTIVE_ATTACKS = 50;
    let enabledThreatTypes = new Set(['malware', 'phishing', 'ddos', 'ransomware', 'web-attack', 'exploit']);

    // Initialize with Three.js scene
    function init(globeScene, globeMesh) {
        scene = globeScene;
        globe = globeMesh;
    }

    // Create attack arc visualization
    function createAttackArc(attack) {
        if (!enabledThreatTypes.has(attack.threat.type)) {
            return null;
        }

        // Limit active attacks for performance
        if (activeAttacks.size >= MAX_ACTIVE_ATTACKS) {
            const oldestKey = activeAttacks.keys().next().value;
            removeAttack(oldestKey);
        }

        const sourcePos = Globe.latLonToVector3(attack.source.lat, attack.source.lon);
        const targetPos = Globe.latLonToVector3(attack.target.lat, attack.target.lon);

        // Create curved path (bezier curve through space)
        const distance = sourcePos.distanceTo(targetPos);
        const midPoint = new THREE.Vector3()
            .addVectors(sourcePos, targetPos)
            .multiplyScalar(0.5);

        // Normalize and extend for arc height
        midPoint.normalize().multiplyScalar(Globe.GLOBE_RADIUS + distance * 0.3);

        // Create curve
        const curve = new THREE.QuadraticBezierCurve3(sourcePos, midPoint, targetPos);
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create material with threat color
        const material = new THREE.LineBasicMaterial({
            color: new THREE.Color(attack.threat.color),
            transparent: true,
            opacity: 0,
            linewidth: 2,
        });

        const arc = new THREE.Line(geometry, material);
        globe.add(arc);

        // Create particle effect at the head of the arc
        const particleGeometry = new THREE.SphereGeometry(2, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(attack.threat.color),
            transparent: true,
            opacity: 0,
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        globe.add(particle);

        // Create pulsing marker at source
        const sourceMarkerGeometry = new THREE.SphereGeometry(3, 8, 8);
        const sourceMarkerMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(attack.threat.color),
            transparent: true,
            opacity: 0.8,
        });
        const sourceMarker = new THREE.Mesh(sourceMarkerGeometry, sourceMarkerMaterial);
        sourceMarker.position.copy(sourcePos);
        globe.add(sourceMarker);

        // Store attack data
        const attackData = {
            id: attack.id,
            arc,
            particle,
            sourceMarker,
            curve,
            points,
            startTime: Date.now(),
            duration: 2000, // 2 seconds animation
            attack,
        };

        activeAttacks.set(attack.id, attackData);
        return attackData;
    }

    // Update all active attacks
    function update() {
        const now = Date.now();
        const toRemove = [];

        activeAttacks.forEach((attackData, id) => {
            const elapsed = now - attackData.startTime;
            const progress = Math.min(elapsed / attackData.duration, 1);

            // Fade in and out
            let opacity;
            if (progress < 0.1) {
                opacity = progress / 0.1; // Fade in
            } else if (progress > 0.9) {
                opacity = (1 - progress) / 0.1; // Fade out
            } else {
                opacity = 1;
            }

            // Update arc opacity
            attackData.arc.material.opacity = opacity * 0.6;

            // Update particle position along curve
            const particleProgress = Math.min(progress * 1.2, 1); // Particle moves slightly faster
            const particlePoint = attackData.curve.getPoint(particleProgress);
            attackData.particle.position.copy(particlePoint);
            attackData.particle.material.opacity = opacity;

            // Pulse source marker
            const pulseScale = 1 + Math.sin(elapsed * 0.01) * 0.3;
            attackData.sourceMarker.scale.set(pulseScale, pulseScale, pulseScale);
            attackData.sourceMarker.material.opacity = opacity * 0.5;

            // Remove completed attacks
            if (progress >= 1) {
                toRemove.push(id);
            }
        });

        // Clean up completed attacks
        toRemove.forEach(id => removeAttack(id));
    }

    // Remove attack visualization
    function removeAttack(id) {
        const attackData = activeAttacks.get(id);
        if (!attackData) return;

        globe.remove(attackData.arc);
        globe.remove(attackData.particle);
        globe.remove(attackData.sourceMarker);

        attackData.arc.geometry.dispose();
        attackData.arc.material.dispose();
        attackData.particle.geometry.dispose();
        attackData.particle.material.dispose();
        attackData.sourceMarker.geometry.dispose();
        attackData.sourceMarker.material.dispose();

        activeAttacks.delete(id);
    }

    // Clear all attacks
    function clear() {
        activeAttacks.forEach((_, id) => removeAttack(id));
    }

    // Set enabled threat types
    function setEnabledThreatTypes(types) {
        enabledThreatTypes = new Set(types);
    }

    // Public API
    return {
        init,
        createAttackArc,
        update,
        clear,
        setEnabledThreatTypes,
        getActiveCount: () => activeAttacks.size,
    };
})();

// Make available globally
window.AttackVisualizer = AttackVisualizer;
