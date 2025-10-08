const API = {
    url: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api/cubes-neon'
        : 'https://cubes.onl/api/cubes-neon',
    
    async loadCubes() {
        try {
            const response = await fetch(this.url);
            return await response.json();
        } catch (error) {
            console.error('Failed to load cubes:', error);
            return { cubes: {}, stats: {} };
        }
    },
    
    async addCube(size) {
        try {
            const response = await fetch(this.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'add', size })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to add cube:', error);
        }
    },
    
    async removeCube(cubeId) {
        try {
            const response = await fetch(this.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'remove', cubeId })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to remove cube:', error);
        }
    }
};
