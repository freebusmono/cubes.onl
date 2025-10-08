const Controls = {
    movement: {
        forward: false,
        backward: false,
        left: false,
        right: false
    },
    
    rotation: {
        x: 0,
        y: 0
    },
    
    mouse: {
        isDown: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0
    },
    
    init() {
        this.setupKeyboard();
        this.setupMouse();
        this.setupTouch();
        this.setupMobileButtons();
    },
    
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w': this.movement.forward = true; break;
                case 's': this.movement.backward = true; break;
                case 'a': this.movement.left = true; break;
                case 'd': this.movement.right = true; break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w': this.movement.forward = false; break;
                case 's': this.movement.backward = false; break;
                case 'a': this.movement.left = false; break;
                case 'd': this.movement.right = false; break;
            }
        });
    },
    
    setupMouse() {
        const canvas = document.getElementById('canvas');
        
        canvas.addEventListener('mousedown', (e) => {
            this.mouse.isDown = true;
            this.mouse.startX = e.clientX;
            this.mouse.startY = e.clientY;
            this.mouse.currentX = e.clientX;
            this.mouse.currentY = e.clientY;
        });
        
        document.addEventListener('mouseup', () => {
            this.mouse.isDown = false;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.mouse.isDown) {
                const deltaX = e.clientX - this.mouse.currentX;
                const deltaY = e.clientY - this.mouse.currentY;
                
                this.rotation.y -= deltaX * 0.005;
                this.rotation.x -= deltaY * 0.005;
                this.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotation.x));
                
                this.mouse.currentX = e.clientX;
                this.mouse.currentY = e.clientY;
            }
        });
    },
    
    setupTouch() {
        const canvas = document.getElementById('canvas');
        let touchStart = null;
        
        canvas.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0];
        });
        
        canvas.addEventListener('touchmove', (e) => {
            if (!touchStart) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStart.clientX;
            const deltaY = touch.clientY - touchStart.clientY;
            
            this.rotation.y -= deltaX * 0.01;
            this.rotation.x -= deltaY * 0.01;
            this.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotation.x));
            
            touchStart = touch;
            e.preventDefault();
        });
        
        canvas.addEventListener('touchend', () => {
            touchStart = null;
        });
    },
    
    setupMobileButtons() {
        document.querySelectorAll('.dpad-btn').forEach(btn => {
            const dir = btn.dataset.dir;
            if (!dir) return;
            
            btn.addEventListener('touchstart', () => {
                const dirs = dir.split('-');
                dirs.forEach(d => {
                    if (this.movement.hasOwnProperty(d)) {
                        this.movement[d] = true;
                    }
                });
            });
            
            btn.addEventListener('touchend', () => {
                Object.keys(this.movement).forEach(key => {
                    this.movement[key] = false;
                });
            });
        });
    },
    
    update(deltaTime) {
        const camera = Scene.camera;
        const moveSpeed = 10 * deltaTime;
        
        // Update rotation
        camera.rotation.order = 'YXZ';
        camera.rotation.y = this.rotation.y;
        camera.rotation.x = this.rotation.x;
        
        // Calculate movement
        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);
        
        forward.applyQuaternion(camera.quaternion);
        right.applyQuaternion(camera.quaternion);
        forward.y = 0;
        right.y = 0;
        forward.normalize();
        right.normalize();
        
        if (this.movement.forward) camera.position.addScaledVector(forward, moveSpeed);
        if (this.movement.backward) camera.position.addScaledVector(forward, -moveSpeed);
        if (this.movement.left) camera.position.addScaledVector(right, -moveSpeed);
        if (this.movement.right) camera.position.addScaledVector(right, moveSpeed);
        
        camera.position.y = Math.max(0.5, camera.position.y);
    }
};
