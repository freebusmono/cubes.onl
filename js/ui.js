const UI = {
    isDarkMode: true,
    visualMode: 'default',
    
    init() {
        this.setupMenu();
        this.setupSearch();
        this.setupTheme();
        this.checkMobile();
    },
    
    setupMenu() {
        const menuBtn = document.getElementById('menu-btn');
        const menuPanel = document.getElementById('menu-panel');
        
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            menuPanel.classList.toggle('active');
        });
    },
    
    setupSearch() {
        const searchInput = document.getElementById('search');
        
        searchInput.addEventListener('input', (e) => {
            const search = e.target.value.toLowerCase();
            if (search.length < 3) return;
            
            CubeManager.cubes.forEach(cube => {
                const matches = cube.userData.id.toLowerCase().includes(search);
                cube.material.emissive.setHex(matches ? 0xff00ff : 0x00ff88);
                cube.material.emissiveIntensity = matches ? 0.5 : 0.1;
            });
        });
    },
    
    setupTheme() {
        this.isDarkMode = !document.body.classList.contains('light-mode');
    },
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('light-mode');
        Scene.updateTheme(this.isDarkMode);
    },
    
    showCubeDetails(data) {
        const panel = document.getElementById('cube-details');
        document.getElementById('detail-id').textContent = data.id;
        document.getElementById('detail-size').textContent = data.size || 'medium';
        document.getElementById('detail-position').textContent = 
            `${data.position.x.toFixed(1)}, ${data.position.y.toFixed(1)}, ${data.position.z.toFixed(1)}`;
        document.getElementById('detail-created').textContent = 
            new Date(data.createdAt || Date.now()).toLocaleDateString();
        
        panel.classList.add('active');
    },
    
    closeCubeDetails() {
        document.getElementById('cube-details').classList.remove('active');
    },
    
    updateStats(cubeCount, fps) {
        document.getElementById('stat-cubes').textContent = cubeCount;
        document.getElementById('stat-fps').textContent = fps;
    },
    
    checkMobile() {
        const isMobile = window.innerWidth <= 768;
        document.getElementById('mobile-controls').style.display = 
            isMobile ? 'block' : 'none';
    }
};
