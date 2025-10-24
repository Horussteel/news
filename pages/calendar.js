import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import calendarService from '../lib/calendarService';
import { useTranslation } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const CalendarPage = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [animatedElements, setAnimatedElements] = useState([]);
  const [googleEvents, setGoogleEvents] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
    // Trigger animations on mount
    setTimeout(() => {
      setAnimatedElements(['hero', 'calendar', 'stats', 'actions']);
    }, 100);
  }, []);

  useEffect(() => {
    // Load Google Calendar events if authenticated
    if (status === 'authenticated') {
      loadGoogleCalendarEvents();
    } else {
      setGoogleEvents(null);
      setEventsLoading(false);
    }
  }, [status]);

  const loadGoogleCalendarEvents = async () => {
    if (!session) {
      console.log('No session, skipping calendar load');
      return;
    }
    
    console.log('Loading Google Calendar events...');
    setEventsLoading(true);
    try {
      // Import calendarService dynamically to avoid SSR issues
      const calendarModule = await import('../lib/calendarService');
      const calendarService = calendarModule.default;
      
      console.log('Calendar service loaded, calling getEventsSummary...');
      const eventsData = await calendarService.getEventsSummary(session.accessToken);
      console.log('Events data loaded:', eventsData);
      
      setGoogleEvents(eventsData);
    } catch (error) {
      console.error('Error loading Google Calendar events:', error);
      setGoogleEvents(null);
    } finally {
      setEventsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatEventTime = (event) => {
    if (event.isAllDay) {
      return 'Toată ziua';
    }
    return `${formatTime(event.start)} - ${formatTime(event.end)}`;
  };

  const getEventIcon = (event) => {
    if (event.isOngoing) return '🟢';
    if (event.isToday) return '📅';
    if (event.isTomorrow) return '📆';
    if (event.location) return '📍';
    if (event.attendees && event.attendees.length > 0) return '👥';
    return '🗓️';
  };

  if (status === 'loading') {
    return (
      <div className="calendar-page">
        <div className="calendar-loading">
          <div className="loading-orb"></div>
          <div className="loading-pulse"></div>
          <span>Se încarcă Calendarul...</span>
        </div>
        <style jsx>{`
          .calendar-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .calendar-loading {
            text-align: center;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 30px;
            position: relative;
          }

          .loading-orb {
            width: 80px;
            height: 80px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2));
            border-radius: 50%;
            position: relative;
            animation: orbFloat 2s ease-in-out infinite;
          }

          .loading-orb::before {
            content: '';
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            background: radial-gradient(circle, transparent 30%, rgba(255, 255, 255, 0.1) 70%);
            border-radius: 50%;
            animation: orbPulse 2s ease-in-out infinite;
          }

          .loading-pulse {
            width: 120px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            position: relative;
            overflow: hidden;
          }

          .loading-pulse::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
            animation: pulseSweep 1.5s ease-in-out infinite;
          }

          .calendar-loading span {
            font-size: 1.3rem;
            font-weight: 500;
            letter-spacing: 0.5px;
            animation: textGlow 2s ease-in-out infinite;
          }

          @keyframes orbFloat {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-10px) scale(1.1); }
          }

          @keyframes orbPulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 1; }
          }

          @keyframes pulseSweep {
            0% { left: -100%; }
            100% { left: 100%; }
          }

          @keyframes textGlow {
            0%, 100% { opacity: 0.7; text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
            50% { opacity: 1; text-shadow: 0 0 20px rgba(255, 255, 255, 0.6); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      {/* Animated Background */}
      <div className="calendar-background">
        <div className="floating-shapes">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`shape shape-${i + 1}`} />
          ))}
        </div>
        <div className="gradient-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
      </div>

      {/* Header Section */}
      <header className={`calendar-header ${animatedElements.includes('hero') ? 'animate-in' : ''}`}>
        {/* Back Navigation */}
        <div className="back-navigation">
          <button 
            className="back-btn"
            onClick={() => window.location.href = '/dashboard'}
          >
            <span className="back-icon">←</span>
            <span className="back-text">Dashboard</span>
          </button>
          <button 
            className="back-btn"
            onClick={() => window.location.href = '/google'}
          >
            <span className="back-icon">🔍</span>
            <span className="back-text">Google Admin</span>
          </button>
        </div>

        <div className="calendar-hero">
          <div className="hero-content">
            <div className="calendar-logo">
              <div className="logo-icon">📅</div>
              <h1 className="hero-title">Google Calendar</h1>
            </div>
            <p className="hero-subtitle">
              Organizează-ți timpul cu eleganță și eficiență
            </p>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-number">{eventsLoading ? '...' : (googleEvents?.summary?.totalToday || 0)}</div>
                <div className="stat-label">Evenimente azi</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📆</div>
              <div className="stat-content">
                <div className="stat-number">{eventsLoading ? '...' : (googleEvents?.summary?.totalTomorrow || 0)}</div>
                <div className="stat-label">Evenimente mâine</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">{eventsLoading ? '...' : (googleEvents?.summary?.totalWeek || 0)}</div>
                <div className="stat-label">Săptămâna curentă</div>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="refresh-section">
          <button 
            className="refresh-btn"
            onClick={() => {
              calendarService.clearCache();
              loadGoogleCalendarEvents();
            }}
          >
            <span className="refresh-icon">🔄</span>
            <span className="refresh-text">Reîncarcă Evenimente</span>
          </button>
        </div>
      </header>

      {/* Main Calendar Section */}
      <main className={`calendar-main ${animatedElements.includes('calendar') ? 'animate-in' : ''}`}>
        {status === 'unauthenticated' ? (
          <div className="calendar-auth-error">
            <div className="error-icon">🔒</div>
            <div className="error-message">
              Conectați-vă pentru a vedea calendarul
            </div>
            <button 
              className="signin-btn"
              onClick={() => window.location.href = '/auth/signin'}
            >
              Conectare Google
            </button>
          </div>
        ) : eventsLoading ? (
          <div className="calendar-loading-events">
            <div className="loading-spinner"></div>
            <span>Se încarcă evenimentele...</span>
          </div>
        ) : !googleEvents ? (
          <div className="calendar-error">
            <div className="error-icon">❌</div>
            <div className="error-message">
              Nu s-au putut încărca evenimentele. Încercați din nou.
            </div>
            <button 
              className="retry-btn"
              onClick={loadGoogleCalendarEvents}
            >
              Reîncearcă
            </button>
          </div>
        ) : (
          <div className="events-container">
            {/* Summary Cards */}
            <div className="calendar-summary">
              <div className="summary-card">
                <div className="summary-icon">📅</div>
                <div className="summary-content">
                  <div className="summary-value">{googleEvents.summary.totalToday}</div>
                  <div className="summary-label">Astăzi</div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon">📆</div>
                <div className="summary-content">
                  <div className="summary-value">{googleEvents.summary.totalTomorrow}</div>
                  <div className="summary-label">Mâine</div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon">📊</div>
                <div className="summary-content">
                  <div className="summary-value">{googleEvents.summary.totalWeek}</div>
                  <div className="summary-label">Săptămâna</div>
                </div>
              </div>
            </div>

            {/* Ongoing Events */}
            {googleEvents.ongoing && googleEvents.ongoing.length > 0 && (
              <div className="calendar-section">
                <h3>🟢 Acum</h3>
                <div className="events-list">
                  {googleEvents.ongoing.map((event) => (
                    <div key={event.id} className="event-item ongoing">
                      <div className="event-icon">{getEventIcon(event)}</div>
                      <div className="event-content">
                        <div className="event-title">{event.title}</div>
                        <div className="event-time">
                          {formatEventTime(event)}
                          {event.location && (
                            <span className="event-location"> 📍 {event.location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today Events */}
            {googleEvents.today && googleEvents.today.events && googleEvents.today.events.length > 0 && (
              <div className="calendar-section">
                <h3>📅 Astăzi</h3>
                <div className="events-list">
                  {googleEvents.today.events.map((event) => (
                    <div key={event.id} className="event-item">
                      <div className="event-time-badge">
                        {event.isAllDay ? 'Toată ziua' : formatTime(event.start)}
                      </div>
                      <div className="event-content">
                        <div className="event-title">{event.title}</div>
                        <div className="event-details">
                          {event.location && <span>📍 {event.location}</span>}
                          {event.attendees && event.attendees.length > 0 && (
                            <span>👥 {event.attendees.length}</span>
                          )}
                        </div>
                      </div>
                      <div 
                        className="event-color"
                        style={{ backgroundColor: event.color }}
                      ></div>
                    </div>
                  ))}
                </div>
                {googleEvents.today.hasMore && (
                  <div className="more-events">
                    +{googleEvents.today.total - 3} evenimente
                  </div>
                )}
              </div>
            )}

            {/* Next Event */}
            {googleEvents.summary && googleEvents.summary.nextEvent && (!googleEvents.ongoing || googleEvents.ongoing.length === 0) && (
              <div className="calendar-section">
                <h3>⏰ Următorul eveniment</h3>
                <div className="next-event">
                  <div className="next-event-time">
                    {googleEvents.summary.nextEvent.isAllDay 
                      ? 'Toată ziua' 
                      : formatTime(googleEvents.summary.nextEvent.start)
                    }
                  </div>
                  <div className="next-event-title">{googleEvents.summary.nextEvent.title}</div>
                  {googleEvents.summary.nextEvent.location && (
                    <div className="next-event-location">
                      📍 {googleEvents.summary.nextEvent.location}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tomorrow Events Preview */}
            {googleEvents.tomorrow && googleEvents.tomorrow.events && googleEvents.tomorrow.events.length > 0 && (
              <div className="calendar-section">
                <h3>📆 Mâine</h3>
                <div className="events-list compact">
                  {googleEvents.tomorrow.events.map((event) => (
                    <div key={event.id} className="event-item small">
                      <div className="event-icon-small">{getEventIcon(event)}</div>
                      <div className="event-content-small">
                        <div className="event-title-small">{event.title}</div>
                        <div className="event-time-small">
                          {formatEventTime(event)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {googleEvents.tomorrow.hasMore && (
                  <div className="more-events">
                    +{googleEvents.tomorrow.total - 3} evenimente
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Events */}
            {googleEvents.upcoming && googleEvents.upcoming.length > 0 && (
              <div className="calendar-section">
                <h3>🗓️ Următoarele evenimente</h3>
                <div className="events-list">
                  {googleEvents.upcoming.map((event) => (
                    <div key={event.id} className="event-item">
                      <div className="event-date-badge">
                        {event.start.toLocaleDateString('ro-RO', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="event-content">
                        <div className="event-title">{event.title}</div>
                        <div className="event-details">
                          {event.isAllDay ? 'Toată ziua' : formatEventTime(event)}
                          {event.location && <span> 📍 {event.location}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Events Message */}
            {(!googleEvents.ongoing || googleEvents.ongoing.length === 0) && 
             (!googleEvents.today || !googleEvents.today.events || googleEvents.today.events.length === 0) && 
             (!googleEvents.summary || !googleEvents.summary.nextEvent) && (
              <div className="no-events-message">
                <div className="no-events-icon">📅</div>
                <div className="no-events-text">
                  Nu există evenimente în perioada următoare
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .calendar-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow-x: hidden;
        }

        /* Animated Background */
        .calendar-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }

        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: float 20s ease-in-out infinite;
        }

        .shape-1 {
          width: 80px;
          height: 80px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 25s;
        }

        .shape-2 {
          width: 120px;
          height: 120px;
          top: 70%;
          left: 80%;
          animation-delay: 2s;
          animation-duration: 30s;
        }

        .shape-3 {
          width: 60px;
          height: 60px;
          top: 40%;
          left: 60%;
          animation-delay: 4s;
          animation-duration: 20s;
        }

        .shape-4 {
          width: 100px;
          height: 100px;
          top: 80%;
          left: 20%;
          animation-delay: 6s;
          animation-duration: 35s;
        }

        .shape-5 {
          width: 40px;
          height: 40px;
          top: 20%;
          left: 70%;
          animation-delay: 8s;
          animation-duration: 25s;
        }

        .shape-6 {
          width: 90px;
          height: 90px;
          top: 50%;
          left: 40%;
          animation-delay: 10s;
          animation-duration: 30s;
        }

        .gradient-orbs {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          animation: orbFloat 15s ease-in-out infinite;
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          top: -150px;
          left: -150px;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.4), transparent 70%);
          animation-delay: 0s;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          bottom: -200px;
          right: -200px;
          background: radial-gradient(circle, rgba(118, 75, 162, 0.4), transparent 70%);
          animation-delay: 5s;
        }

        .orb-3 {
          width: 250px;
          height: 250px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent 70%);
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(90deg); }
          50% { transform: translateY(10px) rotate(180deg); }
          75% { transform: translateY(-15px) rotate(270deg); }
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        /* Header */
        .calendar-header {
          padding: 40px 20px;
          position: relative;
          z-index: 10;
          opacity: 0;
          transform: translateY(30px);
        }

        .calendar-header.animate-in {
          animation: slideInFade 0.8s ease forwards;
        }

        .back-navigation {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .back-icon {
          font-size: 1.1rem;
        }

        .calendar-hero {
          text-align: center;
          margin-bottom: 40px;
        }

        .hero-content {
          margin-bottom: 30px;
        }

        .calendar-logo {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .logo-icon {
          font-size: 3rem;
          animation: iconBounce 2s ease-in-out infinite;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          color: white;
          margin: 0;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          background: linear-gradient(45deg, #ffffff, #e0e7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 10px 0 0 0;
          font-weight: 300;
        }

        .quick-stats {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: all 0.3s ease;
          min-width: 150px;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        }

        .stat-icon {
          font-size: 2rem;
          animation: iconPulse 2s ease-in-out infinite;
        }

        .stat-content {
          text-align: left;
        }

        .stat-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          line-height: 1;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .refresh-section {
          display: flex;
          justify-content: center;
        }

        .refresh-btn {
          background: linear-gradient(135deg, #4CAF50, #45a049);
          border: none;
          color: white;
          padding: 12px 25px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .refresh-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.4s ease;
        }

        .refresh-btn:hover::before {
          width: 300px;
          height: 300px;
        }

        .refresh-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 10px 30px rgba(76, 175, 80, 0.4);
        }

        .refresh-icon {
          font-size: 1.2rem;
        }

        /* Main Calendar */
        .calendar-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 40px;
          position: relative;
          z-index: 5;
          opacity: 0;
          transform: translateY(30px);
        }

        .calendar-main.animate-in {
          animation: slideInFade 0.8s ease 0.2s forwards;
        }

        .events-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .events-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
          background: rgba(255, 255, 255, 0.98);
        }

        /* Calendar Summary */
        .calendar-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: linear-gradient(135deg, #f8f9ff, #e8ecff);
          border-radius: 16px;
          transition: all 0.3s ease;
          border: 2px solid #e0e7ff;
        }

        .summary-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
          border-color: #667eea;
        }

        .summary-icon {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .summary-content {
          flex: 1;
        }

        .summary-value {
          font-size: 2rem;
          font-weight: 700;
          color: #667eea;
          line-height: 1;
          margin-bottom: 5px;
        }

        .summary-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        /* Calendar Sections */
        .calendar-section {
          margin-bottom: 30px;
        }

        .calendar-section h3 {
          margin: 0 0 20px 0;
          color: #667eea;
          font-size: 1.3rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .events-list.compact {
          gap: 8px;
        }

        .event-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          transition: all 0.3s ease;
          position: relative;
          border: 2px solid #e0e7ff;
        }

        .event-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
          background: linear-gradient(135deg, #ffffff, #f8f9ff);
        }

        .event-item.ongoing {
          background: linear-gradient(135deg, #10B98120, #05966920);
          border: 2px solid #10B98140;
        }

        .event-item.small {
          padding: 15px;
          gap: 12px;
        }

        .event-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .event-icon-small {
          font-size: 1.2rem;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .event-time-badge {
          font-size: 0.9rem;
          color: #667eea;
          font-weight: 600;
          min-width: 80px;
          flex-shrink: 0;
          padding: 8px 12px;
          background: #f0f4ff;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e0e7ff;
        }

        .event-date-badge {
          font-size: 0.85rem;
          color: white;
          font-weight: 600;
          min-width: 60px;
          flex-shrink: 0;
          padding: 8px 12px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 8px;
          text-align: center;
        }

        .event-content {
          flex: 1;
        }

        .event-content-small {
          flex: 1;
        }

        .event-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 6px;
          line-height: 1.3;
          font-size: 1.1rem;
        }

        .event-title-small {
          font-weight: 500;
          color: #333;
          font-size: 0.95rem;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .event-time {
          font-size: 0.85rem;
          color: #666;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .event-time-small {
          font-size: 0.8rem;
          color: #666;
        }

        .event-location {
          color: #667eea;
          font-weight: 500;
        }

        .event-details {
          font-size: 0.85rem;
          color: #666;
          display: flex;
          gap: 12px;
          margin-top: 4px;
        }

        .event-color {
          width: 4px;
          background: #4285F4;
          border-radius: 2px;
          position: absolute;
          left: 0;
          top: 20px;
          bottom: 20px;
        }

        .next-event {
          background: linear-gradient(135deg, #f8f9ff, #e8ecff);
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          border: 2px solid #e0e7ff;
          transition: all 0.3s ease;
        }

        .next-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }

        .next-event-time {
          font-size: 1rem;
          color: #667eea;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .next-event-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 12px;
        }

        .next-event-location {
          font-size: 0.9rem;
          color: #666;
        }

        .more-events {
          text-align: center;
          font-size: 0.85rem;
          color: #666;
          padding: 12px;
          background: #f8f9ff;
          border-radius: 8px;
          font-style: italic;
          border: 1px dashed #e0e7ff;
          margin-top: 10px;
        }

        /* Error and Loading States */
        .calendar-auth-error, .calendar-error, .calendar-loading-events {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .error-icon, .no-events-icon {
          font-size: 3rem;
          margin-bottom: 20px;
          animation: iconBounce 2s ease-in-out infinite;
        }

        .error-message, .no-events-text {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 25px;
          font-weight: 500;
        }

        .signin-btn, .retry-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .signin-btn:hover, .retry-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .calendar-loading-events {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          color: #667eea;
          font-weight: 500;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e0e7ff;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .no-events-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          border: 2px dashed #e0e7ff;
          text-align: center;
        }

        /* Animations */
        @keyframes slideInFade {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .calendar-logo {
            flex-direction: column;
            gap: 10px;
          }

          .logo-icon {
            font-size: 2rem;
          }

          .quick-stats {
            flex-direction: column;
            align-items: center;
          }

          .stat-card {
            min-width: 200px;
          }

          .calendar-summary {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .summary-card {
            padding: 15px;
            gap: 12px;
          }

          .summary-icon {
            width: 40px;
            height: 40px;
            font-size: 1.5rem;
          }

          .summary-value {
            font-size: 1.5rem;
          }

          .event-item {
            padding: 15px;
            gap: 12px;
          }

          .event-item.small {
            padding: 12px;
            gap: 10px;
          }

          .event-title {
            font-size: 1rem;
          }

          .event-title-small {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .calendar-header {
            padding: 20px 15px;
          }

          .back-navigation {
            flex-direction: column;
            gap: 10px;
          }

          .back-btn {
            width: 100%;
            justify-content: center;
          }

          .hero-title {
            font-size: 2rem;
          }

          .refresh-btn {
            padding: 10px 20px;
            font-size: 0.9rem;
          }

          .events-container {
            padding: 20px;
            border-radius: 16px;
          }

          .calendar-main {
            padding: 0 15px 30px;
          }

          .event-icon {
            width: 32px;
            height: 32px;
            font-size: 1.2rem;
          }

          .event-icon-small {
            width: 28px;
            height: 28px;
            font-size: 1rem;
          }

          .event-time-badge {
            min-width: 60px;
            font-size: 0.8rem;
            padding: 6px 8px;
          }

          .next-event {
            padding: 20px;
          }

          .next-event-title {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;
