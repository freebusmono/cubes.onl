import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  
  if (req.method === 'GET') {
    try {
      // Get all cubes from KV store
      const cubes = await kv.get('cubes') || {};
      const stats = await kv.get('stats') || { wallets: 0, buys: 0, sells: 0, volume: 0 };
      
      res.status(200).json({ cubes, stats });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cubes' });
    }
  }
}
