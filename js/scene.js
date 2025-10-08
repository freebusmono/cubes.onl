const Scene = {
    scene: null,
    camera: null,
    renderer: null,
    lights: [],
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 1, 200);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 8, 20);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: false,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        
        // Add lights
        this.setupLights();
        
        // Add grid
        this.addGrid();
        
        // Add particles
        this.addParticles();
        
        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    },
    
    setupLights() {
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambient);
        
        const point1 = new THREE.PointLight(0x00ff88, 2, 150);
        point1.position.set(0, 30, 0);
        this.scene.add(point1);
        
        const point2 = new THREE.PointLight(0x00ccff, 1.5, 100);
        point2.position.set(40, 20, 40);
        this.scene.add(point2);
        
        this.lights.push(ambient, point1, point2);
    },
    
    addGrid() {
        const grid = new THREE.GridHelper(100, 50, 0x00ff88, 0x001122);
        grid.material.opacity = 0.1;
        grid.material.transparent = true;
        this.scene.add(grid);
    },
    
    addParticles() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        
        for (let i = 0; i < 1000; i++) {
            vertices.push(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200
            );
            
            const color = new THREE.Color();
            color.setHSL(Math.random(), 0.7, 0.5);
            colors.push(color.r, color.g, color.b);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.3,
            sizeAttenuation: false
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
    },
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    
    updateTheme(isDark) {
        this.renderer.setClearColor(isDark ? 0x000000 : 0xf5f5f5);
        this.scene.fog.color.setHex(isDark ? 0x000000 : 0xf5f5f5);
    }
};
