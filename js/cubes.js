const CubeManager = {
    cubes: new Map(),
    materials: {},
    
    init() {
        this.createMaterials();
    },
    
    createMaterials() {
        this.materials = {
            small: new THREE.MeshPhongMaterial({
                color: 0x00ff88,
                emissive: 0x00ff88,
                emissiveIntensity: 0.1,
                transparent: true,
                opacity: 0.9
            }),
            medium: new THREE.MeshPhongMaterial({
                color: 0x00ff88,
                emissive: 0x00ff88,
                emissiveIntensity: 0.1,
                transparent: true,
                opacity: 0.9
            }),
            large: new THREE.MeshPhongMaterial({
                color: 0x00ff88,
                emissive: 0x00ff88,
                emissiveIntensity: 0.1,
                transparent: true,
                opacity: 0.9
            })
        };
    },
    
    createCube(data) {
        const size = data.size === 'small' ? 0.7 : data.size === 'large' ? 1.5 : 1;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = this.materials[data.size || 'medium'];
        
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(data.position.x, data.position.y, data.position.z);
        
        // Add glow
        const glowGeometry = new THREE.BoxGeometry(size * 1.2, size * 1.2, size * 1.2);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        cube.add(glow);
        
        cube.userData = data;
        Scene.scene.add(cube);
        this.cubes.set(data.id, cube);
        
        // Animate spawn
        cube.scale.set(0, 0, 0);
        this.animateSpawn(cube);
        
        return cube;
    },
    
    animateSpawn(cube) {
        const duration = 500;
        const start = Date.now();
        
        const animate = () => {
            const progress = Math.min((Date.now() - start) / duration, 1);
            cube.scale.setScalar(progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    },
    
    removeCube(id) {
        const cube = this.cubes.get(id);
        if (cube) {
            Scene.scene.remove(cube);
            this.cubes.delete(id);
        }
    },
    
    updateAll(deltaTime) {
        const time = Date.now() * 0.001;
        
        this.cubes.forEach(cube => {
            cube.rotation.x += 0.3 * deltaTime;
            cube.rotation.y += 0.3 * deltaTime;
            
            const float = Math.sin(time + cube.userData.id.charCodeAt(0) * 0.1) * 0.02;
            cube.position.y += float;
        });
    },
    
    getPositionForMode(mode, index, total) {
        switch(mode) {
            case 'galaxy':
                const angle = index * 0.5;
                const radius = 10 + index * 0.5;
                return {
                    x: Math.cos(angle) * radius,
                    y: (Math.random() - 0.5) * 10,
                    z: Math.sin(angle) * radius
                };
            case 'grid':
                const gridSize = Math.ceil(Math.sqrt(total));
                return {
                    x: (index % gridSize - gridSize / 2) * 3,
                    y: Math.floor(index / gridSize) * 3,
                    z: 0
                };
            case 'sphere':
                const phi = Math.acos(1 - 2 * index / total);
                const theta = Math.sqrt(total * Math.PI) * phi;
                return {
                    x: Math.sin(phi) * Math.cos(theta) * 20,
                    y: Math.sin(phi) * Math.sin(theta) * 20,
                    z: Math.cos(phi) * 20
                };
            default:
                return {
                    x: (Math.random() - 0.5) * 40,
                    y: Math.random() * 20,
                    z: (Math.random() - 0.5) * 40
                };
        }
    }
};
