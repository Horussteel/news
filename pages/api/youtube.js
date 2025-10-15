import axios from 'axios';

// Cache simplu în memorie
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minute pentru YouTube

function getCacheKey(query) {
  return JSON.stringify(query);
}

function getFromCache(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
  
  // Curățăm cache-ul vechi
  if (cache.size > 50) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { search, page = 1, maxResults = 20 } = req.query;
    
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YouTube API key not configured');
    }

    const cacheKey = getCacheKey({ search, page, maxResults });
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return res.status(200).json(cached);
    }

    // Construim query-ul pentru căutare
    const defaultQuery = 'artificial intelligence OR machine learning OR AI technology OR deep learning';
    const romanianQuery = 'inteligență artificială OR AI OR tehnologie OR machine learning OR deep learning';
    const query = search || (req.query.language === 'ro' ? romanianQuery : defaultQuery);
    
    const params = {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: Math.min(parseInt(maxResults), 25), // Maxim 25 rezultate
      order: 'relevance',
      videoDefinition: 'any',
      videoDuration: 'any',
      key: apiKey,
      pageToken: page > 1 ? `page${page}` : undefined
    };

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params,
      timeout: 10000 // 10 secunde timeout
    });
    
    // Procesăm rezultatele
    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    const result = {
      videos,
      totalResults: response.data.pageInfo?.totalResults || 0,
      search,
      page: parseInt(page),
      maxResults: parseInt(maxResults),
      cached: false,
      timestamp: new Date().toISOString()
    };

    // Salvăm în cache
    setCache(cacheKey, result);

    res.status(200).json(result);

  } catch (error) {
    console.error('YouTube API Error:', error);
    
    // Returnăm date mock în caz de eroare
    const mockData = {
      videos: [
        {
          id: "demo",
          title: "AI Videos Loading...",
          description: "Unable to fetch YouTube videos at this time. Please try again later.",
          thumbnail: null,
          channelTitle: "AI News",
          publishedAt: new Date().toISOString(),
          url: "#"
        }
      ],
      totalResults: 0,
      search: search || '',
      page: parseInt(page) || 1,
      maxResults: parseInt(maxResults) || 20,
      error: true,
      message: 'Unable to fetch YouTube videos at this time',
      timestamp: new Date().toISOString()
    };

    res.status(500).json(mockData);
  }
}
