# 🚀 Personal Dashboard v3.0.0

Un dashboard personal modern și complet construit cu Next.js, care include agregare de știri, management al productivității, finanțe personale, și multe altele.

## ✅ Features

### 📰 **Conținut & Media**
- **Știri** - Articole din surse internaționale și românești despre AI și tehnologie
- **Videoclipuri YouTube** - Conținut video despre AI și tehnologie
- **Radio Player** - Ascultă muzică și podcasturi online
- **Reading Journal** - Jurnal personal pentru cărți și articole

### 🎯 **Productivitate**
- **Todo List** - Managementul sarcinilor zilnice
- **Pomodoro Timer** - Tehnica Pomodoro pentru focus maxim
- **Habit Tracker** - Monitorizarea și dezvoltarea obiceiurilor
- **Bookmarks** - Manager pentru linkuri și resurse salvate

### 💰 **Finanțe & Analiză**
- **Financial Tracker** - Gestionarea finanțelor personale
- **Analytics Dashboard** - Statistici și vizualizări avansate
- **Data Export** - Export PDF pentru toate datele

### 🎨 **UX & Design**
- **Teme Multiple** - Light/Dark mode cu personalizare
- **Suport Multi-limbă** - Engleză și Română
- **Responsive Design** - Optimizat complet pentru mobil și desktop
- **Efecte Interactive** - Animații smooth la hover și micro-interacțiuni
- **Performance Optimizat** - Caching și lazy loading

### 🔧 **Tehnic**
- **Docker Ready** - Deploy ușor cu containere
- **PM2 Support** - Process management pentru producție
- **API Routes** - Backend integrat cu Next.js

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, CSS-in-JS
- **Backend**: Node.js, Next.js API Routes
- **Styling**: Styled-jsx, Glassmorphism Design
- **State Management**: React Context API
- **APIs**: NewsAPI, YouTube Data API, Radio APIs
- **Export**: jsPDF pentru export PDF
- **Authentication**: NextAuth.js
- **Deployment**: PM2, Docker, Nginx

### 📦 **Versiune Curentă**: **3.0.0** *(19 Octombrie 2025)*

Vezi [CHANGELOG.md](./CHANGELOG.md) pentru istoricul complet al modificărilor.

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
│   ├── HomePage.js     # Dashboard principal cu animații
│   ├── NewsCard.js     # Card pentru articole știri
│   ├── TodoList.js     # Management sarcini
│   ├── PomodoroTimer.js # Timer Pomodoro
│   ├── HabitTracker.js # Monitorizare obiceiuri
│   ├── FinancialTracker.js # Gestionare finanțe
│   ├── RadioPlayer.js  # Player radio online
│   ├── ReadingTracker.js # Jurnal lectură
│   ├── AnalyticsDashboard.js # Panou statistici
│   └── ... # și multe altele
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   │   ├── news.js    # News API endpoint
│   │   ├── youtube.js # YouTube API endpoint
│   │   └── radio-proxy.js # Radio proxy
│   ├── index.js       # Homepage / Dashboard
│   ├── news.js        # Pagina știri
│   ├── todo.js        # Pagina sarcini
│   ├── pomodoro.js    # Pagina Pomodoro
│   ├── habits.js      # Pagina obiceiuri
│   ├── financial.js   # Pagina finanțe
│   ├── reading.js     # Pagina lectură
│   ├── radio.js       # Pagina radio
│   ├── dashboard.js   # Panou control
│   └── settings.js    # Setări aplicație
├── lib/               # Services și utilities
│   ├── todoService.js
│   ├── habitService.js
│   ├── financialService.js
│   ├── pomodoroService.js
│   ├── readingService.js
│   └── ... # servicii pentru toate modulele
├── contexts/          # React Context providers
│   ├── LanguageContext.js
│   ├── ThemeContext.js
│   └── UserContext.js
├── locales/           # Traduceri
│   ├── en.json        # Engleză
│   └── ro.json        # Română
├── styles/            # Global styles
│   └── globals.css    # Main stylesheet
├── CHANGELOG.md       # Istoric modificări
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

## 🆕 What's New in v3.0.0

### ✨ **Enhanced Interactive Experience**
- **Hover Effects**: Efecte de pulsare smooth pentru toate elementele interactive
- **Micro-interactions**: Animații subtile la interacțiunea cu elementele
- **Visual Polish**: Design rafinat cu atenție la detalii

### 🎯 **Focus on User Experience**
- Cursor pointer pentru elementele clicabile
- Animații de 1.5s cu loop infinit pentru efectul de pulsare
- Transiții smooth între stări

---

## 📈 **Dashboard Statistics**

### Module Active:
- ✅ 9 module funcționale complete
- ✅ Suport pentru 2 limbi
- ✅ 2 temi vizuale
- ✅ Export PDF integrat
- ✅ Responsive 100%

### Performance:
- ⚡ Loading time < 2s
- 📱 Mobile optimized
- 🔄 Auto-save local storage
- 🎨 Glassmorphism UI

---

**Built with ❤️ și ☕ folosind Next.js și tehnologii web moderne**

**Versiunea 3.0.0 - Interactivitate și Eleganță**
