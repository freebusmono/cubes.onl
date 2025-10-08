const app = {
    lastFrameTime: Date.now(),
    frameCount: 0,
    fps: 0,
    fpsUpdateTime: Date.now(),
    
    async init() {
        // Initialize all modules
        Scene.init();
        CubeManager.init();
        Controls.init();
        UI.init();
        
        // Start loading data
        await this.loadData();
        
        // Start animation loop
        this.animate();
        
        // Start polling for updates
        setInterval(() => this.loadData(), 5000);
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
        }, 1000);
    },
    
    async loadData() {
        const data = await API.loadCubes();
        
        // Sync cubes
        Object.values(data.cubes || {}).forEach(cubeData => {
            if (!CubeManager.cubes.has(cubeData.id)) {
                CubeManager.createCube(cubeData);
            }
        });
        
        // Update stats
        UI.updateStats(CubeManager.cubes.size, this.fps);
    },
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Calculate delta time
        const now = Date.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        
        // Update FPS
        this.updateFPS();
        
        // Update systems
        Controls.update(deltaTime);
        CubeManager.updateAll(deltaTime);
        
        // Render
        Scene.renderer.render(Scene.scene, Scene.camera);
    },
    
    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        
        if (now - this.fpsUpdateTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.fpsUpdateTime));
            this.frameCount = 0;
            this.fpsUpdateTime = now;
            
            UI.updateStats(CubeManager.cubes.size, this.fps);
        }
    },
    
    // Public methods for UI
    async simulateActivity() {
        const sizes = ['small', 'medium', 'large'];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        await API.addCube(randomSize);
        await this.loadData();
    },
    
    changeVisualMode() {
        const modes = ['default', 'galaxy', 'grid', 'sphere'];
        const currentIndex = modes.indexOf(UI.visualMode);
        UI.visualMode = modes[(currentIndex + 1) % modes.length];
        
        let index = 0;
        CubeManager.cubes.forEach(cube => {
            const target = CubeManager.getPositionForMode(
                UI.visualMode, 
                index++, 
                CubeManager.cubes.size
            );
            this.animateToPosition(cube, target);
        });
    },
    
    animateToPosition(object, target) {
        const start = {
            x: object.position.x,
            y: object.position.y,
            z: object.position.z
        };
        const startTime = Date.now();
        const duration = 1000;
        
        const update = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            object.position.x = start.x + (target.x - start.x) * eased;
            object.position.y = start.y + (target.y - start.y) * eased;
            object.position.z = start.z + (target.z - start.z) * eased;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        update();
    },
    
    resetView() {
        Scene.camera.position.set(0, 8, 20);
        Scene.camera.lookAt(0, 0, 0);
        Controls.rotation.x = 0;
        Controls.rotation.y = 0;
    },
    
    toggleTheme() {
        UI.toggleTheme();
    },
    
    closeCubeDetails() {
        UI.closeCubeDetails();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => app.init());
