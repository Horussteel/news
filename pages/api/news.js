import axios from 'axios';

// Cache simplu în memorie
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 oră

// Retry logic with exponential backoff
async function fetchWithRetry(url, params, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, { 
        params,
        timeout: 10000 // 10 secunde timeout
      });
      return response;
    } catch (error) {
      if (error.response?.status === 429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

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
      // Știri românești - surse multiple
      url = `${baseUrl}/top-headlines`;
      params.country = 'ro';
      
      // Surse românești valide disponibile în NewsAPI
      const romanianSources = [
        'adevarul.ro', 
        'libertatea.ro', 
        'gandul.ro', 
        'hotnews.ro', 
        'protv.ro', 
        'digisport.ro'
      ];
      
      // Selectăm surse în funcție de categorie (doar surse disponibile)
      let selectedSources = romanianSources;
      
      if (category === 'Technology' || category === 'AI' || category === 'Machine Learning') {
        selectedSources = romanianSources; // Folosim toate sursele pentru tech
      } else if (category === 'Business') {
        selectedSources = romanianSources; // Folosim toate sursele pentru business
      } else if (category === 'Sports') {
        selectedSources = ['digisport.ro']; // Doar surse sportive
      } else if (category === 'Entertainment') {
        selectedSources = romanianSources; // Folosim toate sursele pentru entertainment
      }
      
      // Dacă avem categorie specifică, folosim sursele respectivele
      if (category && category !== 'Toate') {
        params.sources = selectedSources.join(',');
        delete params.country; // Nu folosim country când avem surse specifice
      }
      
      if (search) {
        params.q = search;
      }
      
      // Dacă nu avem rezultate cu surse specifice, cădem fără surse
      if (!search && (!category || category === 'Toate')) {
        delete params.sources;
        params.country = 'ro';
      }
    } else {
      // Știri internaționale
      url = `${baseUrl}/everything`;
      params.q = search || 'artificial intelligence OR machine learning';
      params.sortBy = 'publishedAt';
      params.from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Ultimele 7 zile
      
      if (category && category !== 'Toate') {
        params.q += ` ${category}`;
      }
    }

    const response = await fetchWithRetry(url, params);
    
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
    // Log error without exposing sensitive data
    const sanitizedError = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      code: error.code,
      url: error.config?.url,
      params: error.config?.params ? { ...error.config.params, apiKey: 'HIDDEN' } : null
    };
    console.error('News API Error:', sanitizedError);
    
    // Returnăm date mock în caz de eroare
    let errorMessage = 'Unable to fetch news at this time';
    let statusCode = 500;
    
    if (error.response?.status === 429) {
      // Check if it's the specific rate limit message for developer accounts
      if (error.response?.data?.code === 'rateLimited') {
        errorMessage = 'News API rate limit reached. Free developer accounts are limited to 100 requests per day. Please try again in a few hours or consider upgrading to a paid plan.';
      } else {
        errorMessage = 'Too many requests. Please try again later.';
      }
      statusCode = 429;
    } else if (error.response?.status === 401) {
      errorMessage = 'API key invalid or expired. Please check your API key configuration.';
      statusCode = 401;
    } else if (error.response?.status === 426) {
      errorMessage = 'API upgrade required. Please check your API plan.';
      statusCode = 426;
    }
    
    const mockData = {
      articles: [
        {
          title: "AI News Platform Loading...",
          description: errorMessage,
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
      message: errorMessage,
      timestamp: new Date().toISOString()
    };

    res.status(statusCode).json(mockData);
  }
}
