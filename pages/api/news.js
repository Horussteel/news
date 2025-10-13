import axios from 'axios';

// Cache simplu în memorie
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minute

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
  if (cache.size > 100) {
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
    const { category, search, page = 1, language = 'en' } = req.query;
    
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    if (!apiKey) {
      throw new Error('NewsAPI key not configured');
    }

    const cacheKey = getCacheKey({ category, search, page, language });
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return res.status(200).json(cached);
    }

    // Construim URL-ul API
    let baseUrl = 'https://newsapi.org/v2';
    let url, params = {
      apiKey,
      page: parseInt(page),
      pageSize: 20,
      language
    };

    if (language === 'ro') {
      // Știri românești
      url = `${baseUrl}/top-headlines`;
      params.country = 'ro';
      if (category && category !== 'Toate') {
        params.category = category.toLowerCase();
      }
      if (search) {
        params.q = search;
      }
    } else {
      // Știri internaționale
      url = `${baseUrl}/everything`;
      params.q = search || 'AI OR artificial intelligence OR machine learning OR "deep learning" OR "neural networks" OR robotics';
      params.sortBy = 'publishedAt';
      params.from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Ultimele 7 zile
      
      if (category && category !== 'Toate') {
        params.q += ` ${category}`;
      }
    }

    const response = await axios.get(url, { 
      params,
      timeout: 10000 // 10 secunde timeout
    });
    
    const result = {
      articles: response.data.articles || [],
      totalResults: response.data.totalResults || 0,
      category,
      search,
      page: parseInt(page),
      language,
      cached: false,
      timestamp: new Date().toISOString()
    };

    // Salvăm în cache
    setCache(cacheKey, result);

    res.status(200).json(result);

  } catch (error) {
    console.error('News API Error:', error);
    
    // Returnăm date mock în caz de eroare
    const mockData = {
      articles: [
        {
          title: "AI News Platform Loading...",
          description: "Unable to fetch latest news. Please try again later.",
          url: "#",
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          source: { name: "AI News" }
        }
      ],
      totalResults: 0,
      category: category || 'General',
      search: search || '',
      page: parseInt(page) || 1,
      language: language || 'en',
      error: true,
      message: 'Unable to fetch news at this time',
      timestamp: new Date().toISOString()
    };

    res.status(500).json(mockData);
  }
}
