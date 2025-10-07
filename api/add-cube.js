import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'POST') {
    try {
      const { size } = req.body;
      
      // Create cube data
      const cubeId = 'cube_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const cubeData = {
        id: cubeId,
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
      
      // Get current cubes
      const cubes = await kv.get('cubes') || {};
      cubes[cubeId] = cubeData;
      
      // Update cubes
      await kv.set('cubes', cubes);
      
      // Update stats
      const stats = await kv.get('stats') || { wallets: 0, buys: 0, sells: 0, volume: 0 };
      stats.wallets++;
      stats.buys++;
      stats.volume += size === 'small' ? 50 : size === 'large' ? 200 : 100;
      await kv.set('stats', stats);
      
      // Send update to all clients
      res.status(200).json({ success: true, cube: cubeData, stats });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add cube' });
    }
  }
}
