import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'POST') {
    try {
      const { cubeId } = req.body;
      
      // Get current cubes
      const cubes = await kv.get('cubes') || {};
      
      if (cubes[cubeId]) {
        delete cubes[cubeId];
        await kv.set('cubes', cubes);
        
        // Update stats
        const stats = await kv.get('stats') || { wallets: 0, buys: 0, sells: 0, volume: 0 };
        stats.wallets = Math.max(0, stats.wallets - 1);
        stats.sells++;
        await kv.set('stats', stats);
        
        res.status(200).json({ success: true, stats });
      } else {
        res.status(404).json({ error: 'Cube not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove cube' });
    }
  }
}
