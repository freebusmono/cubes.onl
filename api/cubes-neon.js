import { neon } from '@neondatabase/serverless';

// List of allowed origins (websites that can access this API)
const ALLOWED_ORIGINS = [
  'https://cubes.onl',
  'https://www.cubes.onl',
  'http://localhost:8000',
  'http://localhost:3000'
];

export default async function handler(req, res) {
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
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    if (req.method === 'GET') {
      const cubes = await sql`SELECT * FROM cubes`;
      const stats = await sql`SELECT * FROM stats WHERE id = 1`;
      
      const cubesObj = {};
      cubes.forEach(cube => {
        cubesObj[cube.id] = {
          id: cube.id,
          size: cube.size,
          position: {
            x: parseFloat(cube.position_x),
            y: parseFloat(cube.position_y),
            z: parseFloat(cube.position_z)
          },
          rotation: {
            x: parseFloat(cube.rotation_x),
            y: parseFloat(cube.rotation_y)
          },
          color: cube.color
        };
      });
      
      return res.status(200).json({
        cubes: cubesObj,
        stats: stats[0] || { wallets: 0, buys: 0, sells: 0, volume: 0 }
      });
    }
    
    if (req.method === 'POST') {
      const { action, size, cubeId } = req.body;
      
      if (action === 'add') {
        const id = 'cube_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const px = (Math.random() - 0.5) * 30;
        const py = Math.random() * 10 + 1;
        const pz = (Math.random() - 0.5) * 30;
        const rx = Math.random() * Math.PI;
        const ry = Math.random() * Math.PI;
        
        await sql`
          INSERT INTO cubes (id, size, position_x, position_y, position_z, rotation_x, rotation_y, color)
          VALUES (${id}, ${size || 'medium'}, ${px}, ${py}, ${pz}, ${rx}, ${ry}, ${'#00ff00'})
        `;
        
        const volumeAdd = size === 'small' ? 50 : size === 'large' ? 200 : 100;
        await sql`
          UPDATE stats 
          SET wallets = wallets + 1, 
              buys = buys + 1, 
              volume = volume + ${volumeAdd}
          WHERE id = 1
        `;
        
        const stats = await sql`SELECT * FROM stats WHERE id = 1`;
        
        return res.status(200).json({
          success: true,
          cube: {
            id: id,
            size: size || 'medium',
            position: { x: px, y: py, z: pz },
            rotation: { x: rx, y: ry },
            color: '#00ff00'
          },
          stats: stats[0]
        });
      }
      
      if (action === 'remove' && cubeId) {
        const deleted = await sql`DELETE FROM cubes WHERE id = ${cubeId} RETURNING id`;
        
        if (deleted.length > 0) {
          await sql`
            UPDATE stats 
            SET wallets = GREATEST(0, wallets - 1),
                sells = sells + 1
            WHERE id = 1
          `;
          
          const stats = await sql`SELECT * FROM stats WHERE id = 1`;
          return res.status(200).json({ success: true, stats: stats[0] });
        }
        
        return res.status(404).json({ error: 'Cube not found' });
      }
      
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database error', 
      details: error.message 
    });
  }
}
