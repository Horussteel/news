# 🤖 AI News Hub

O aplicație Next.js modernă pentru agregarea știrilor despre inteligență artificială, machine learning și tehnologie.

## ✅ Features

- 📰 **Știri AI** - Articole din surse internaționale și românești
- 📺 **Videoclipuri YouTube** - Conținut video despre AI și tehnologie
- 🔍 **Căutare avansată** - Filtre multiple și categorii
- 🌍 **Suport multi-limbă** - Engleză și Română
- 📱 **Responsive Design** - Optimizat pentru mobil și desktop
- 🚀 **Performance optimizat** - Caching și lazy loading
- 🐳 **Docker ready** - Deploy ușor cu containere

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18
- **Backend**: Node.js, Next.js API Routes
- **Styling**: CSS-in-JS, Responsive Design
- **APIs**: NewsAPI, YouTube Data API
- **Deployment**: PM2, Docker, Nginx

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/Horussteel/news.git
cd news

# Install dependencies
npm install

# Configure environment variables
cp .env.production .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

### Production Deployment

#### Option 1: PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Build for production
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Option 2: Docker

```bash
# Build Docker image
docker build -t news-app .

# Run container
docker run -p 3000:3000 --env-file .env.production news-app
```

## ⚙️ Configuration

### Environment Variables

```env
# API Keys
NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key

# Server
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Auth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_secret_key
```

### PM2 Configuration

`ecosystem.config.js` includes:
- Cluster mode for maximum performance
- Auto-restart on crashes
- Memory limits and health checks
- Log rotation

## 📁 Project Structure

```
news/
├── components/          # React components
│   ├── NewsCard.js     # News article card
│   ├── SearchBar.js    # Search input component
│   └── VideoCard.js    # YouTube video card
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   │   ├── news.js    # News API endpoint
│   │   └── youtube.js # YouTube API endpoint
│   ├── index.js       # Main homepage
│   └── _app.js        # App wrapper
├── styles/            # Global styles
│   └── globals.css    # Main stylesheet
├── server.js          # Custom Node.js server
├── next.config.js     # Next.js configuration
├── ecosystem.config.js # PM2 configuration
├── Dockerfile         # Docker configuration
└── .env.production    # Production environment
```

## 🔧 API Endpoints

### News API
```
GET /api/news?category=technology&search=AI&language=en
```

### YouTube API
```
GET /api/youtube?search=machine learning&maxResults=20
```

### Health Check
```
GET /health
```

## 📊 Features Details

### Categories Disponibile
- Technology
- Business
- Science
- Health
- Sports
- Entertainment
- General
- AI
- Machine Learning

### Limbi Suportate
- English (EN)
- Română (RO)

### Caching
- News API: 5 minutes
- YouTube API: 10 minutes
- Memory-based cache with automatic cleanup

## 🌐 Deployment Options

### 1. VPS/Cloud Server
- Ubuntu 20.04+ recommended
- Node.js 18+
- Nginx reverse proxy
- PM2 process manager

### 2. Docker Container
- Lightweight Alpine Linux
- Multi-stage build
- Security-focused
- Easy scaling

### 3. PaaS Platforms
- Vercel (recommended for Next.js)
- Heroku
- DigitalOcean App Platform

## 🔒 Security Features

- CORS headers configured
- Environment variable protection
- Input sanitization
- Rate limiting ready
- HTTPS only in production

## 📈 Performance Optimizations

- Image optimization
- Lazy loading
- API response caching
- Code splitting
- Bundle size optimization
- Server-side rendering

## 🐛 Troubleshooting

### Common Issues

1. **API Rate Limits**
   - Check API keys
   - Monitor usage limits
   - Implement caching

2. **Build Errors**
   - Clear node_modules
   - Check Node.js version
   - Verify environment variables

3. **Deployment Issues**
   - Check PM2 logs
   - Verify Nginx configuration
   - Test health endpoint

### Logs and Monitoring

```bash
# PM2 logs
pm2 logs news

# PM2 monitoring
pm2 monit

# Health check
curl http://localhost:3000/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ using Next.js and modern web technologies**
