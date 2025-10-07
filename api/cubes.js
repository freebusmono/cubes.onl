export async function GET(request) {
  try {
    const { kv } = await import('@vercel/kv');
    
    const cubes = await kv.get('cubes') || {};
    const stats = await kv.get('stats') || { wallets: 0, buys: 0, sells: 0, volume: 0 };
    
    return new Response(JSON.stringify({ cubes, stats }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch cubes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    const { kv } = await import('@vercel/kv');
    const body = await request.json();
    
    if (body.action === 'add') {
      const cubeId = 'cube_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const cubeData = {
        id: cubeId,
        size: body.size || 'medium',
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
      
      const cubes = await kv.get('cubes') || {};
      cubes[cubeId] = cubeData;
      await kv.set('cubes', cubes);
      
      const stats = await kv.get('stats') || { wallets: 0, buys: 0, sells: 0, volume: 0 };
      stats.wallets++;
      stats.buys++;
      stats.volume += body.size === 'small' ? 50 : body.size === 'large' ? 200 : 100;
      await kv.set('stats', stats);
      
      return new Response(JSON.stringify({ success: true, cube: cubeData, stats }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } else if (body.action === 'remove') {
      const cubes = await kv.get('cubes') || {};
      
      if (cubes[body.cubeId]) {
        delete cubes[body.cubeId];
        await kv.set('cubes', cubes);
        
        const stats = await kv.get('stats') || { wallets: 0, buys: 0, sells: 0, volume: 0 };
        stats.wallets = Math.max(0, stats.wallets - 1);
        stats.sells++;
        await kv.set('stats', stats);
        
        return new Response(JSON.stringify({ success: true, stats }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
