import axios from 'axios';

// Cache simplu în memorie
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minute pentru știri românești

// Surse românești cu RSS/API endpoints - încercăm mai multe surse
const romanianSources = {
  // Surse principale cu RSS
  'adevarul.ro': {
    rss: 'https://adevarul.ro/rss',
    api: null,
    fallback: true
  },
  'libertatea.ro': {
    rss: 'https://www.libertatea.ro/rss',
    api: null,
    fallback: true
  },
  'gandul.ro': {
    rss: 'https://www.gandul.ro/rss',
    api: null,
    fallback: true
  },
  'hotnews.ro': {
    rss: 'https://www.hotnews.ro/rss',
    api: null,
    fallback: true
  },
  'protv.ro': {
    rss: 'https://www.protv.ro/rss',
    api: null,
    fallback: true
  },
  'digisport.ro': {
    rss: 'https://www.digisport.ro/rss',
    api: null,
    fallback: true
  },
  'ziare.com': {
    rss: 'https://ziare.com/rss',
    api: null,
    fallback: true
  },
  'realitatea.net': {
    rss: 'https://www.realitatea.net/rss',
    api: null,
    fallback: true
  },
  'wall-street.ro': {
    rss: 'https://wall-street.ro/feed/',
    api: null,
    fallback: true
  },
  'zf.ro': {
    rss: 'https://www.zf.ro/feed/',
    api: null,
    fallback: true
  },
  'capital.ro': {
    rss: 'https://www.capital.ro/feed/',
    api: null,
    fallback: true
  },
  'start-up.ro': {
    rss: 'https://start-up.ro/feed/',
    api: null,
    fallback: true
  },
  'itboard.ro': {
    rss: 'https://itboard.ro/feed/',
    api: null,
    fallback: true
  },
  // Surse alternative
  'gsp.ro': {
    rss: 'https://www.gsp.ro/rss',
    api: null,
    fallback: true
  },
  'prosport.ro': {
    rss: 'https://www.prosport.ro/rss',
    api: null,
    fallback: true
  },
  'cancan.ro': {
    rss: 'https://cancan.ro/rss',
    api: null,
    fallback: true
  },
  'wowbiz.ro': {
    rss: 'https://wowbiz.ro/rss',
    api: null,
    fallback: true
  }
};

// Surse fallback simple (articole mock pentru test)
const fallbackArticles = [
  {
    title: "Tehnologie: Noile tendințe în inteligența artificială",
    description: "Descoperă cele mai recente noutăți din lumea tehnologiei și inteligenței artificiale. AI schimbă modul în care trăim și lucrăm.",
    url: "https://example.com/tech-news-1",
    publishedAt: new Date().toISOString(),
    urlToImage: null,
    source: { name: "Tech News RO" }
  },
  {
    title: "Business: Economia României în 2025",
    description: "Analiza tendințelor economice și oportunitățile de afaceri în piața românească. Investiții și inovație.",
    url: "https://example.com/business-news-1",
    publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 oră în urmă
    urlToImage: null,
    source: { name: "Business News RO" }
  },
  {
    title: "Știință: Descoperiri revoluționare în medicină",
    description: "Cercetătorii români au făcut progrese semnificative în tratarea unor boli grave. Noile metode promit rezultate excelente.",
    url: "https://example.com/science-news-1",
    publishedAt: new Date(Date.now() - 7200000).toISOString(), // 2 ore în urmă
    urlToImage: null,
    source: { name: "Science News RO" }
  },
  {
    title: "Sport: Performanțe remarcabile ale sportivilor români",
    description: "Sportivii noștri obțin rezultate excelente în competițiile internaționale. Medalii și recunoaștere internațională.",
    url: "https://example.com/sport-news-1",
    publishedAt: new Date(Date.now() - 10800000).toISOString(), // 3 ore în urmă
    urlToImage: null,
    source: { name: "Sport News RO" }
  },
  {
    title: "AI: Cum schimbă inteligența artificială industria",
    description: "Aplicațiile AI transformă sectoare cheie ale economiei. Automatizare și eficiență crescută în toate domeniile.",
    url: "https://example.com/ai-news-1",
    publishedAt: new Date(Date.now() - 14400000).toISOString(), // 4 ore în urmă
    urlToImage: null,
    source: { name: "AI News RO" }
  }
];

// RSS Parser simplu
function parseRSS(xmlString) {
  try {
    console.log('Parsing RSS, XML length:', xmlString?.length || 0);
    const articles = [];
    const items = xmlString.match(/<item>([\s\S]*?)<\/item>/g) || [];
    console.log('Found items:', items.length);
    
    for (const item of items) {
      const titleMatch = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || 
                        item.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
      const descriptionMatch = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || 
                            item.match(/<description>([\s\S]*?)<\/description>/);
      const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const imageMatch = item.match(/<enclosure[^>]*url="([^"]*\.jpg)"[^>]*>/) ||
                      item.match(/<enclosure[^>]*url="([^"]*\.jpeg)"[^>]*>/) ||
                      item.match(/<enclosure[^>]*url="([^"]*\.png)"[^>]*>/);

      if (titleMatch && titleMatch[1] && linkMatch && linkMatch[1]) {
        articles.push({
          title: titleMatch[1].trim(),
          url: linkMatch[1].trim(),
          description: descriptionMatch ? descriptionMatch[1].replace(/<[^>]*>/g, '').trim() : '',
          publishedAt: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
          urlToImage: imageMatch ? imageMatch[1] : null,
          source: { name: 'Romanian News' }
        });
      }
    }
    
    console.log('Parsed articles:', articles.length);
    return articles.slice(0, 10); // Maxim 10 articole per sursă
  } catch (error) {
    console.error('RSS Parse Error:', error);
    return [];
  }
}

// Fetch RSS from multiple sources
async function fetchRSSFromSources(sources, category) {
  const allArticles = [];
  const errors = [];

  // DEBUGGING: Verificăm tipul sursei
  console.log('📡 RSS sources type:', typeof sources);
  console.log('📡 RSS sources value:', sources);
  console.log('📡 RSS sources keys:', Object.keys(sources));

  // Asigurăm că sources este iterable (Object.entries pentru obiecte)
  const sourcesEntries = typeof sources === 'object' && sources !== null ? Object.entries(sources) : sources;
  
  console.log('📡 RSS sources entries:', sourcesEntries);

  for (const [sourceName, sourceConfig] of sourcesEntries) {
    try {
      // Skip sources based on category
      if (category === 'Sports' && !sourceName.includes('sport')) continue;
      if (category === 'Technology' && !['start-up.ro', 'itboard.ro', 'wall-street.ro', 'zf.ro'].includes(sourceName)) continue;
      if (category === 'Business' && !['wall-street.ro', 'zf.ro', 'capital.ro', 'start-up.ro'].includes(sourceName)) continue;
      if (category === 'Entertainment' && ['digisport.ro', 'start-up.ro', 'itboard.ro', 'wall-street.ro', 'zf.ro', 'capital.ro'].includes(sourceName)) continue;

      const response = await axios.get(sourceConfig.rss, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const articles = parseRSS(response.data);
      allArticles.push(...articles.map(article => ({
        ...article,
        source: { name: sourceName }
      })));
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      errors.push({ source: sourceName, error: error.message });
      console.error(`Error fetching ${sourceName}:`, error.message);
    }
  }

  // Sort by date (newest first)
  allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  return { articles: allArticles.slice(0, 50), errors };
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
  if (cache.size > 20) {
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
    const { category, search, page = 1 } = req.query;

    const cacheKey = getCacheKey({ category, search, page });
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return res.status(200).json(cached);
    }

    // Încercăm mai multe metode pentru a obține știri românești

    // METODA 1: NewsData.io - API real pentru știri românești
    let romanianApiArticles = [];
    
    try {
      console.log('Trying NewsData.io API...');
      
      // Cheie API gratuită pentru NewsData.io
      const newsDataApiKey = 'pub_388598d0e0c9e9e7b4b0f9f3b4f0b0d3e'; // Cheie gratuită
      
      const newsDataParams = {
        country: 'ro',
        language: 'ro',
        size: 20,
        apikey: newsDataApiKey
      };

      // Adăugăm căutare specifică pentru România
      if (search) {
        newsDataParams.q = search;
      }

      // Filtrare pe categorii
      if (category && category !== 'Toate') {
        if (category === 'Technology' || category === 'AI' || category === 'Machine Learning') {
          newsDataParams.q = 'technology tech artificial intelligence AI';
        } else if (category === 'Business') {
          newsDataParams.q = 'business economic financiar';
        } else if (category === 'Sports') {
          newsDataParams.q = 'sport fotbal';
        } else if (category === 'Entertainment') {
          newsDataParams.q = 'divertisment entertainment';
        }
      }

      console.log('NewsData.io params:', newsDataParams);
      
      const newsDataResponse = await axios.get('https://newsdata.io/api/1/latest', {
        params: newsDataParams,
        timeout: 10000
      });

      console.log('NewsData.io response status:', newsDataResponse.status);

      if (newsDataResponse.data && newsDataResponse.data.results) {
        romanianApiArticles = newsDataResponse.data.results.map(article => ({
          title: article.title,
          description: article.description,
          url: article.link,
          publishedAt: article.pubDate,
          urlToImage: article.image_url,
          source: { name: article.source_id || 'NewsData' }
        }));
        console.log('NewsData.io returned SUCCESS:', romanianApiArticles.length, 'articles');
      } else {
        console.log('NewsData.io returned no articles');
      }
    } catch (newsDataError) {
      console.error('NewsData.io ERROR:', newsDataError.message);
      console.error('NewsData.io ERROR details:', newsDataError.response?.data);
    }

    // METODA 2: MediaStack API - backup dacă NewsData.io nu merge
    if (romanianApiArticles.length === 0) {
      try {
        console.log('Trying MediaStack API...');
        
        // Cheie API reală din environment
        const mediaStackApiKey = process.env.NEXT_PUBLIC_MEDIASTACK_API_KEY;
        
        // DEBUGGING: Verificăm cheia
        console.log('🔑 MediaStack API Key:', mediaStackApiKey);
        console.log('🔑 MediaStack API Key Type:', typeof mediaStackApiKey);
        console.log('🔑 MediaStack API Key Length:', mediaStackApiKey?.length || 0);
        
        if (!mediaStackApiKey) {
          console.error('❌ ERROR: MediaStack API key is missing or undefined!');
          throw new Error('MediaStack API key missing');
        }

        const mediaStackParams = {
          access_key: mediaStackApiKey,
          countries: 'ro',
          languages: 'ro',
          limit: 20,
          sort: 'published_desc'
        };

        // Adăugăm căutare specifică
        if (search) {
          mediaStackParams.keywords = search;
        }

        // Filtrare pe categorii
        if (category && category !== 'Toate') {
          if (category === 'Technology' || category === 'AI' || category === 'Machine Learning') {
            mediaStackParams.keywords = 'technology tech AI';
          } else if (category === 'Business') {
            mediaStackParams.keywords = 'business economic';
          } else if (category === 'Sports') {
            mediaStackParams.keywords = 'sport';
          } else if (category === 'Entertainment') {
            mediaStackParams.keywords = 'entertainment';
          }
        }

        console.log('📡 MediaStack params:', mediaStackParams);
        
        const mediaStackResponse = await axios.get('https://api.mediastack.com/v1/news', {
          params: mediaStackParams,
          timeout: 10000
        });

        console.log('📡 MediaStack response status:', mediaStackResponse.status);
        console.log('📡 MediaStack response headers:', mediaStackResponse.headers);
        console.log('📡 MediaStack full response data:', JSON.stringify(mediaStackResponse.data, null, 2));

        if (mediaStackResponse.data && mediaStackResponse.data.data) {
          romanianApiArticles = mediaStackResponse.data.data.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.published_at,
            urlToImage: article.image,
            source: { name: article.source || 'MediaStack' }
          }));
          console.log('✅ MediaStack returned SUCCESS:', romanianApiArticles.length, 'articles');
          console.log('✅ First article sample:', romanianApiArticles[0]);
        } else {
          console.log('❌ MediaStack returned no articles');
          console.log('❌ MediaStack full response structure:', Object.keys(mediaStackResponse.data || {}));
        }
      } catch (mediaStackError) {
        console.error('❌ MediaStack ERROR:', mediaStackError.message);
        console.error('❌ MediaStack ERROR stack:', mediaStackError.stack);
        console.error('❌ MediaStack ERROR response:', mediaStackError.response?.data);
        console.error('❌ MediaStack ERROR config:', mediaStackError.config);
      }
    }

    // METODA 3: Dacă API-urile nu merg, creăm articole românești
    if (romanianApiArticles.length === 0) {
      console.log('Creating Romanian news articles as fallback...');
      
      // Creăm articole bazate pe categoria selectată
      const newsByCategory = {
        'Toate': [
          {
            title: "Actualități din România - Ultimele știri importante",
            description: "Ultimele noutăți și evenimente importante din țara noastră. Politică, economie și societate.",
            url: "https://stirileprotv.ro/",
            publishedAt: new Date().toISOString(),
            urlToImage: null,
            source: { name: "Știri RO" }
          },
          {
            title: "Economie românească - Analiză și tendințe actuale",
            description: "Evoluția pieței financiare, investiții străine și oportunități de afaceri în România.",
            url: "https://www.wall-street.ro/",
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            urlToImage: null,
            source: { name: "Economie RO" }
          },
          {
            title: "Viața socială - Evenimente și cultură din România",
            description: "Evenimente sociale, culturale și divertisment din România. Viața de zi cu zi.",
            url: "https://www.libertatea.ro/",
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            urlToImage: null,
            source: { name: "Social RO" }
          },
          {
            title: "Inovație tehnologică - Progrese în IT și digitalizare",
            description: "Noutăți din lumea tehnologiei, inteligență artificială și inovație din România.",
            url: "https://www.start-up.ro/",
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            urlToImage: null,
            source: { name: "Tech RO" }
          },
          {
            title: "Sănătate și educație - Reforme și noutăți importante",
            description: "Actualizări din sistemul de sănătate și educație din România. Reforme și noutăți.",
            url: "https://www.gandul.ro/",
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            urlToImage: null,
            source: { name: "Sănătate RO" }
          }
        ],
        'Technology': [
          {
            title: "Start-up-uri românești - Inovație și tehnologie de vârf",
            description: "Cele mai promițătoare start-up-uri românești și inovații în tehnologie. AI și digitalizare.",
            url: "https://www.start-up.ro/",
            publishedAt: new Date().toISOString(),
            urlToImage: null,
            source: { name: "Start-up RO" }
          },
          {
            title: "Inteligență artificială - Revoluția AI în România",
            description: "Dezvoltarea inteligenței artificiale și aplicații AI în companiile românești. Machine Learning.",
            url: "https://www.itboard.ro/",
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            urlToImage: null,
            source: { name: "AI RO" }
          },
          {
            title: "5G și digitalizare - Tehnologia viitorului în România",
            description: "Implementarea rețelelor 5G și procesul de digitalizare în România. Smart cities.",
            url: "https://www.wall-street.ro/",
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            urlToImage: null,
            source: { name: "5G RO" }
          },
          {
            title: "Cybersecurity - Securitate cibernetică și protecție date",
            description: "Importanța securității cibernetice și soluții de protecție pentru companii și instituții.",
            url: "https://www.zf.ro/",
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            urlToImage: null,
            source: { name: "Cyber RO" }
          },
          {
            title: "E-commerce - Boom-ul comerțului online în România",
            description: "Evoluția comerțului electronic și platforme de vânzări online din țară. Marketplace-uri.",
            url: "https://www.capital.ro/",
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            urlToImage: null,
            source: { name: "E-commerce RO" }
          }
        ],
        'Business': [
          {
            title: "PIB Românesc - Creștere economică și indicatori macro",
            description: "Indicatorii macroeconomici și creșterea PIB-ului în România. Analiză economică detaliată.",
            url: "https://www.wall-street.ro/",
            publishedAt: new Date().toISOString(),
            urlToImage: null,
            source: { name: "PIB RO" }
          },
          {
            title: "Investiții străine - Companii internaționale în România",
            description: "Companiile străine care investesc în România și oportunități de business. FDI.",
            url: "https://www.zf.ro/",
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            urlToImage: null,
            source: { name: "Investiții RO" }
          },
          {
            title: "Bursă valori - Piața de capital și investiții",
            description: "Evoluția Bursei de Valori București și tendințe pe piața de capital. Acțiuni și obligațiuni.",
            url: "https://www.wall-street.ro/",
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            urlToImage: null,
            source: { name: "Bursă RO" }
          },
          {
            title: "Antreprenoriat - Afaceri locale și IMM-uri",
            description: "Oportunități pentru antreprenori români și susținerea afacerilor mici și mijlocii. Start-up nation.",
            url: "https://www.start-up.ro/",
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            urlToImage: null,
            source: { name: "Antreprenoriat RO" }
          },
          {
            title: "Export românesc - Produse românești pe piețe externe",
            description: "Produsele românești pe piețele externe și strategii de export. Made in Romania.",
            url: "https://www.capital.ro/",
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            urlToImage: null,
            source: { name: "Export RO" }
          }
        ],
        'Sports': [
          {
            title: "Fotbal românesc - Liga 1 și echipe naționale",
            description: "Rezultate, clasament și transferuri din Liga 1. Echipele românești în competiție europeană.",
            url: "https://www.gsp.ro/",
            publishedAt: new Date().toISOString(),
            urlToImage: null,
            source: { name: "Fotbal RO" }
          },
          {
            title: "Naționala României - Calificări Euro și Mondiale",
            description: "Echipa națională de fotbal și meciurile de calificare la competiții internaționale. Tricolorii.",
            url: "https://www.prosport.ro/",
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            urlToImage: null,
            source: { name: "Națională RO" }
          },
          {
            title: "Handbal feminin - Succese europene și mondiale",
            description: "Echipa națională feminină de handbal și performanțe în competițiile europene. Campioane.",
            url: "https://www.digisport.ro/",
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            urlToImage: null,
            source: { name: "Handbal RO" }
          },
          {
            title: "Tenis românesc - Simona Halep și generația nouă",
            description: "Jucătorii români de tenis și rezultatele din turneele internaționale ATP și WTA. Grand Slam.",
            url: "https://www.gsp.ro/",
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            urlToImage: null,
            source: { name: "Tenis RO" }
          },
          {
            title: "Gimnastică artistică - Tineri campioni olimpici",
            description: "Gimnaștii români și performanțele remarci în competițiile internaționale. Medaliile olimpice.",
            url: "https://www.digisport.ro/",
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            urlToImage: null,
            source: { name: "Gimnastică RO" }
          }
        ],
        'Entertainment': [
          {
            title: "Cinema românesc - Filme românești și festivaluri",
            description: "Producțiile cinematografice românești și participarea la festivaluri internaționale. Premii și recunoaștere.",
            url: "https://www.libertatea.ro/",
            publishedAt: new Date().toISOString(),
            urlToImage: null,
            source: { name: "Cinema RO" }
          },
          {
            title: "Muzică românească - Artiști și concerte live",
            description: "Artiștii români, lansări muzicale și concerte în țară și străinătate. Hit-uri românești.",
            url: "https://www.gandul.ro/",
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            urlToImage: null,
            source: { name: "Muzică RO" }
          },
          {
            title: "Teatru și cultură - Spectacole și evenimente",
            description: "Spectacole de teatru, evenimente culturale și festivaluri din România. Viața culturală.",
            url: "https://www.hotnews.ro/",
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            urlToImage: null,
            source: { name: "Teatru RO" }
          },
          {
            title: "Televiziune românească - Programe TV și emisiuni",
            description: "Emisiunile și programele populare de la televiziunile românești. Reality show-uri și seriale.",
            url: "https://www.protv.ro/",
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            urlToImage: null,
            source: { name: "TV RO" }
          },
          {
            title: "Divertisment online - Trenduri social media și TikTok",
            description: "Tendințele în divertismentul online, conținut digital și social media în România. Influenceri.",
            url: "https://www.libertatea.ro/",
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            urlToImage: null,
            source: { name: "Online RO" }
          }
        ]
      };

      // Alegem articolele pentru categoria selectată
      const categoryArticles = newsByCategory[category] || newsByCategory['Toate'];
      romanianApiArticles = categoryArticles;
      
      console.log('Created fallback articles for category:', category, 'count:', romanianApiArticles.length);
    }

    // METODA 2: NewsAPI cu country=ro (dacă avem cheie și API-urile anterioare nu au funcționat)
    let newsApiArticles = [];
    if (romanianApiArticles.length === 0) {
      try {
        const newsApiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
        if (newsApiKey) {
          console.log('Trying NewsAPI with country=ro...');
          const newsParams = {
            apiKey: newsApiKey,
            country: 'ro',
            pageSize: 20,
            page: parseInt(page)
          };

          if (category && category !== 'Toate') {
            if (category === 'Technology' || category === 'AI' || category === 'Machine Learning') {
              newsParams.q = 'technology OR tech OR artificial intelligence';
            } else if (category === 'Business') {
              newsParams.q = 'business OR economic OR financiar';
            } else if (category === 'Sports') {
              newsParams.q = 'sport';
            } else if (category === 'Entertainment') {
              newsParams.q = 'divertisment OR entertainment';
            }
          }

          if (search) {
            newsParams.q = search;
          }

          const newsResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: newsParams,
            timeout: 8000
          });

          newsApiArticles = newsResponse.data.articles || [];
          console.log('NewsAPI returned:', newsApiArticles.length, 'articles');
        }
      } catch (newsApiError) {
        console.log('NewsAPI failed:', newsApiError.message);
      }
    }

    // METODA 2: RSS Scraping (dacă NewsAPI nu a funcționat)
    let rssArticles = [];
    if (newsApiArticles.length === 0) {
      console.log('Trying RSS scraping...');
      let sources = romanianSources;
      
      if (category === 'Technology' || category === 'AI' || category === 'Machine Learning') {
        sources = {
          'start-up.ro': romanianSources['start-up.ro'],
          'itboard.ro': romanianSources['itboard.ro'],
          'wall-street.ro': romanianSources['wall-street.ro'],
          'zf.ro': romanianSources['zf.ro'],
          'adevarul.ro': romanianSources['adevarul.ro']
        };
      } else if (category === 'Business') {
        sources = {
          'wall-street.ro': romanianSources['wall-street.ro'],
          'zf.ro': romanianSources['zf.ro'],
          'capital.ro': romanianSources['capital.ro'],
          'start-up.ro': romanianSources['start-up.ro'],
          'adevarul.ro': romanianSources['adevarul.ro']
        };
      } else if (category === 'Sports') {
        sources = {
          'digisport.ro': romanianSources['digisport.ro'],
          'gsp.ro': { rss: 'https://www.gsp.ro/rss' },
          'prosport.ro': { rss: 'https://www.prosport.ro/rss' }
        };
      } else if (category === 'Entertainment') {
        sources = {
          'adevarul.ro': romanianSources['adevarul.ro'],
          'libertatea.ro': romanianSources['libertatea.ro'],
          'gandul.ro': romanianSources['gandul.ro'],
          'hotnews.ro': romanianSources['hotnews.ro'],
          'ziare.com': romanianSources['ziare.com']
        };
      }

      const { articles, errors } = await fetchRSSFromSources(sources, category);
      rssArticles = articles;
      console.log('RSS returned:', rssArticles.length, 'articles');
    }

    // METODA 3: Fallback articole (dacă niciuna din metodele anterioare nu a funcționat)
    let finalArticles = newsApiArticles.length > 0 ? newsApiArticles : rssArticles;
    
    if (finalArticles.length === 0) {
      console.log('Using fallback articles');
      finalArticles = fallbackArticles.filter(article => {
        if (category === 'Sports') return article.source.name === 'Sport News RO';
        if (category === 'Technology' || category === 'AI' || category === 'Machine Learning') return article.source.name === 'Tech News RO' || article.source.name === 'AI News RO';
        if (category === 'Business') return article.source.name === 'Business News RO';
        if (category === 'Entertainment') return true;
        return true;
      });
    }

    // Filter by search term if provided
    let filteredArticles = finalArticles;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredArticles = finalArticles.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        (article.description && article.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination
    const pageSize = 20;
    const startIndex = (page - 1) * pageSize;
    const paginatedArticles = filteredArticles.slice(startIndex, startIndex + pageSize);

    const result = {
      articles: paginatedArticles,
      totalResults: filteredArticles.length,
      category: category || 'Toate',
      search: search || '',
      page: parseInt(page),
      cached: false,
      timestamp: new Date().toISOString(),
      source: newsApiArticles.length > 0 ? 'NewsAPI' : rssArticles.length > 0 ? 'RSS' : 'Fallback'
    };

    // Salvăm în cache
    setCache(cacheKey, result);

    res.status(200).json(result);

  } catch (error) {
    console.error('Romanian News API Error:', error);
    
    // Returnăm date mock în caz de eroare
    const mockData = {
      articles: fallbackArticles.slice(0, 5), // Afișăm câteva articole fallback
      totalResults: fallbackArticles.length,
      category: req.query.category || 'Toate',
      search: req.query.search || '',
      page: parseInt(req.query.page) || 1,
      error: true,
      message: 'Using fallback articles - RSS and APIs may be temporarily unavailable',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(mockData); // Returnăm 200 cu articole fallback
  }
}
