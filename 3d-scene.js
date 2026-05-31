/**
 * 3D Scene - Three.js Constellation / Node Network
 * Represents keyframes, timeline tracks, and nodes in DaVinci Fusion and After Effects.
 */

(function () {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    let scene, camera, renderer;
    let particleSystem, particlePositions, particleColors;
    let connectionsGeometry, connectionsLines;
    let floatingMeshes = [];
    
    const maxParticles = 130; // Increased from 70
    const meshCount = 8;      // 3D keyframe meshes
    const particles = [];
    const connectionPositions = new Float32Array(maxParticles * maxParticles * 6);
    
    // Interaction states
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let scrollY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    // Palette (Matching CSS theme)
    const colors = [
        new THREE.Color(0x9d4edd), // Purple
        new THREE.Color(0xc77dff), // Light purple
        new THREE.Color(0x38bdf8), // Blue
        new THREE.Color(0xffffff)  // White
    ];

    init();
    animate();

    function init() {
        // Scene & Camera
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x030008, 0.012);

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 150;

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // Generate Particles (Nodes)
        const particleGeometry = new THREE.BufferGeometry();
        particlePositions = new Float32Array(maxParticles * 3);
        particleColors = new Float32Array(maxParticles * 3);

        for (let i = 0; i < maxParticles; i++) {
            // Random position in 3D box
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 150;
            const z = (Math.random() - 0.5) * 120 - 40;

            particles.push({
                x: x, y: y, z: z,
                baseX: x, baseY: y, baseZ: z,
                vx: (Math.random() - 0.5) * 0.35, // Increased speed
                vy: (Math.random() - 0.5) * 0.35,
                vz: (Math.random() - 0.5) * 0.25,
                size: Math.random() * 3 + 1.5
            });

            particlePositions[i * 3] = x;
            particlePositions[i * 3 + 1] = y;
            particlePositions[i * 3 + 2] = z;

            // Pick a color from our professional palette
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            particleColors[i * 3] = randomColor.r;
            particleColors[i * 3 + 1] = randomColor.g;
            particleColors[i * 3 + 2] = randomColor.b;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

        // Create canvas texture for smooth round glowing points
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 16;
        pCanvas.height = 16;
        const pCtx = pCanvas.getContext('2d');
        const gradient = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.3, 'rgba(199,125,255,0.8)');
        gradient.addColorStop(1, 'rgba(13,5,26,0)');
        pCtx.fillStyle = gradient;
        pCtx.fillRect(0, 0, 16, 16);
        const pointTexture = new THREE.CanvasTexture(pCanvas);

        const particleMaterial = new THREE.PointsMaterial({
            size: 4.5,
            map: pointTexture,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
            opacity: 0.95
        });

        particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);

        // Connections (Lines between close nodes)
        connectionsGeometry = new THREE.BufferGeometry();
        connectionsGeometry.setAttribute('position', new THREE.BufferAttribute(connectionPositions, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x9d4edd,
            transparent: true,
            opacity: 0.32, // Increased from 0.18
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        connectionsLines = new THREE.LineSegments(connectionsGeometry, lineMaterial);
        scene.add(connectionsLines);

        // Generate 3D Keyframe Shapes (Octahedrons like After Effects keyframes)
        const meshGeo = new THREE.OctahedronGeometry(3.5, 0);
        
        for (let i = 0; i < meshCount; i++) {
            const meshMat = new THREE.MeshPhongMaterial({
                color: colors[i % colors.length],
                emissive: 0x3d0066,
                shininess: 100,
                flatShading: true,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const mesh = new THREE.Mesh(meshGeo, meshMat);
            mesh.position.set(
                (Math.random() - 0.5) * 180,
                (Math.random() - 0.5) * 120,
                (Math.random() - 0.5) * 80 - 30
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            
            mesh.userData = {
                vx: (Math.random() - 0.5) * 0.28,
                vy: (Math.random() - 0.5) * 0.28,
                vz: (Math.random() - 0.5) * 0.2,
                rotX: (Math.random() - 0.5) * 0.015,
                rotY: (Math.random() - 0.5) * 0.015
            };
            
            scene.add(mesh);
            floatingMeshes.push(mesh);
        }

        // Lights
        const ambientLight = new THREE.AmbientLight(0x180a30, 2.0);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xc77dff, 1.5, 300);
        pointLight1.position.set(50, 50, 50);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x38bdf8, 1.2, 300);
        pointLight2.position.set(-50, -50, 50);
        scene.add(pointLight2);

        // Event Listeners
        window.addEventListener('resize', onWindowResize);
        document.addEventListener('mousemove', onMouseMove);
        window.addEventListener('scroll', onWindowScroll);
    }

    function onMouseMove(event) {
        targetMouseX = (event.clientX - windowHalfX) * 0.25;
        targetMouseY = (event.clientY - windowHalfY) * 0.25;
    }

    function onWindowScroll() {
        scrollY = window.scrollY;
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);

        const time = Date.now() * 0.0003;

        // Dampen mouse movement
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Camera positioning
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.position.z = 150 + scrollY * 0.06;
        camera.lookAt(scene.position);

        const fadeFactor = Math.max(0, 1 - scrollY / 650);

        // Animate 3D Keyframe Meshes
        for (let i = 0; i < meshCount; i++) {
            const mesh = floatingMeshes[i];
            mesh.position.x += mesh.userData.vx;
            mesh.position.y += mesh.userData.vy;
            mesh.position.z += mesh.userData.vz;
            
            mesh.rotation.x += mesh.userData.rotX;
            mesh.rotation.y += mesh.userData.rotY;
            
            if (mesh.position.x < -100 || mesh.position.x > 100) mesh.userData.vx *= -1;
            if (mesh.position.y < -80 || mesh.position.y > 80) mesh.userData.vy *= -1;
            if (mesh.position.z < -90 || mesh.position.z > 20) mesh.userData.vz *= -1;

            mesh.material.opacity = 0.6 * fadeFactor;
        }

        // Animate particles
        let connectionIndex = 0;
        const positions = particleSystem.geometry.attributes.position.array;
        const mouse3D = new THREE.Vector3(mouseX * 0.35, -mouseY * 0.35, 0);

        for (let i = 0; i < maxParticles; i++) {
            const p = particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;

            if (p.x < -120 || p.x > 120) p.vx *= -1;
            if (p.y < -95 || p.y > 95) p.vy *= -1;
            if (p.z < -120 || p.z > 40) p.vz *= -1;

            // Repelled by mouse
            const dx = p.x - mouse3D.x;
            const dy = p.y - mouse3D.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 50) {
                const force = (50 - dist) * 0.006;
                p.x += dx * force;
                p.y += dy * force;
            } else {
                p.x += (p.baseX + (p.x - p.baseX) * 0.98 - p.x) * 0.025;
                p.y += (p.baseY + (p.y - p.baseY) * 0.98 - p.y) * 0.025;
            }

            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
        }
        
        particleSystem.geometry.attributes.position.needsUpdate = true;

        // Connections logic
        for (let i = 0; i < maxParticles; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < maxParticles; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dz = p1.z - p2.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < 36) { // Increased threshold from 32
                    connectionPositions[connectionIndex++] = p1.x;
                    connectionPositions[connectionIndex++] = p1.y;
                    connectionPositions[connectionIndex++] = p1.z;
                    
                    connectionPositions[connectionIndex++] = p2.x;
                    connectionPositions[connectionIndex++] = p2.y;
                    connectionPositions[connectionIndex++] = p2.z;
                }
            }
        }

        connectionsLines.geometry.attributes.position.needsUpdate = true;
        connectionsLines.geometry.setDrawRange(0, connectionIndex);

        connectionsLines.material.opacity = 0.32 * fadeFactor;
        particleSystem.material.opacity = 0.95 * fadeFactor;

        // Auto-rotation over time to make it dynamic
        scene.rotation.y = time * 0.15;
        scene.rotation.x = time * 0.05;

        renderer.render(scene, camera);
    }
})();
