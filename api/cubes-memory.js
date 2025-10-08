// Backup in-memory storage (if database fails)
let storage = {
  cubes: {},
  stats: { wallets: 0, buys: 0, sells: 0, volume: 0 }
};

// List of allowed origins (same as cubes-neon.js)
const ALLOWED_ORIGINS = [
  'https://cubes.onl',
  'https://www.cubes.onl',
  'http://localhost:8000',
  'http://localhost:3000'
];

export default function handler(req, res) {
  // Get the origin of the request
  const origin = req.headers.origin;
  
  // Only set CORS header if origin is in our allowed list
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // If origin is not allowed, reject the request
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ 
      error: 'Access forbidden: Origin not allowed' 
    });
  }
  
  if (req.method === 'GET') {
    return res.status(200).json(storage);
  }
  
  if (req.method === 'POST') {
    const { action, size, cubeId } = req.body;
    
    if (action === 'add') {
      const id = 'cube_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      storage.cubes[id] = {
        id: id,
        size: size || 'medium',
        position: {
          x: (Math.random() - 0.5) * 30,
          y: Math.random() * 10 + 1,
          z: (Math.random() - 0.5) * 30
        },
        rotation: {
          x: Math.random() * Math.PI,
          y: Math.random() * Math.PI
        },
        color: '#00ff00',
        timestamp: Date.now()
      };
      
      storage.stats.wallets = Object.keys(storage.cubes).length;
      storage.stats.buys++;
      storage.stats.volume += size === 'small' ? 50 : size === 'large' ? 200 : 100;
      
      return res.status(200).json({ 
        success: true, 
        cube: storage.cubes[id], 
        stats: storage.stats 
      });
    }
    
    if (action === 'remove' && cubeId && storage.cubes[cubeId]) {
      delete storage.cubes[cubeId];
      storage.stats.wallets = Object.keys(storage.cubes).length;
      storage.stats.sells++;
      
      return res.status(200).json({ 
        success: true, 
        stats: storage.stats 
      });
    }
    
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
