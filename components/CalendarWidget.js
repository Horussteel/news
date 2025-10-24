import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import calendarService from '../lib/calendarService';
import { useTranslation } from '../contexts/LanguageContext';

const CalendarWidget = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('📅 Calendar: Session/Status changed:', {
      status,
      hasSession: !!session,
      sessionKeys: session ? Object.keys(session) : [],
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken?.length,
      userEmail: session?.user?.email
    });
    
    if (status === 'authenticated' && session?.accessToken) {
      loadCalendarEvents();
    } else if (status === 'authenticated' && !session?.accessToken) {
      setLoading(false);
      setError('Autentificat, dar lipsește accessToken. Apasă pe "Forțează Re-autentificare".');
    } else if (status === 'unauthenticated') {
      setLoading(false);
      setError('Vă rugăm să vă autentificați pentru a vedea calendarul');
    }
  }, [status, session]);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📅 Calendar: Loading events for session:', {
        hasAccessToken: !!session?.accessToken,
        accessTokenLength: session?.accessToken?.length,
        userEmail: session?.user?.email
      });
      
      const calendarData = await calendarService.getEventsSummary(session.accessToken);
      console.log('📅 Calendar: Data received:', calendarData);
      
      // Verifică dacă avem date valide
      if (calendarData && calendarData.summary) {
        setEvents(calendarData);
        console.log('📅 Calendar: Events loaded successfully');
      } else {
        console.warn('📅 Calendar: No valid data received');
        setEvents({
          today: { total: 0, events: [], hasMore: false },
          tomorrow: { total: 0, events: [], hasMore: false },
          week: { total: 0, events: [], hasMore: false },
          upcoming: [],
          ongoing: [],
          summary: {
            totalToday: 0,
            totalTomorrow: 0,
            totalWeek: 0,
            ongoingCount: 0,
            nextEvent: null
          }
        });
      }
    } catch (error) {
      console.error('📅 Calendar: Error loading events:', error);
      console.error('📅 Calendar: Error details:', {
        message: error.message,
        stack: error.stack,
        status: error.status,
        statusText: error.statusText
      });
      
      if (error.message === 'UNAUTHORIZED') {
        setError('Trebuie să autorizați accesul la calendarul Google. Vă rugăm să vă delogați și să vă autentificați din nou.');
      } else if (error.message.includes('403')) {
        setError('Calendar API nu este activat. Verifică Google Cloud Console.');
      } else if (error.message.includes('401')) {
        setError('Token expirat. Apasă pe "Re-autentificare Calendar".');
      } else {
        setError(`Eroare la încărcarea calendarului: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    calendarService.clearCache();
    loadCalendarEvents();
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
    if (event.attendees.length > 0) return '👥';
    return '🗓️';
  };

  if (status === 'loading') {
    return (
      <div className="calendar-widget">
        <div className="calendar-header">
          <h3>📅 Calendar</h3>
        </div>
        <div className="calendar-loading">
          <div className="calendar-spinner"></div>
          <span>Se încarcă...</span>
        </div>
        <style jsx>{`
          .calendar-widget {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
          }

          .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .calendar-header h3 {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.2rem;
          }

          .calendar-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 20px;
            color: var(--text-secondary);
          }

          .calendar-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid var(--border-color);
            border-top: 2px solid var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (status === 'unauthenticated' || error) {
    return (
      <div className="calendar-widget">
        <div className="calendar-header">
          <h3>📅 Calendar</h3>
        </div>
        <div className="calendar-error">
          <div className="error-icon">🔒</div>
          <div className="error-message">
            {error || 'Conectați-vă pentru a vedea calendarul'}
          </div>
          {status === 'unauthenticated' && (
            <button 
              className="signin-btn"
              onClick={() => window.location.href = '/auth/signin'}
            >
              Conectare Google
            </button>
          )}
          {status === 'authenticated' && (
            <button 
              className="reauth-btn"
              onClick={() => {
                // Clear session and force re-auth to get calendar scope
                fetch('/api/auth/signout', { method: 'POST' })
                  .then(() => {
                    // Clear all session storage and local storage
                    sessionStorage.clear();
                    localStorage.clear();
                    // Force re-auth with consent
                    window.location.href = '/auth/signin?prompt=consent';
                  });
              }}
            >
              🔑 Forțează Re-autentificare
            </button>
          )}
        </div>
        <style jsx>{`
          .calendar-widget {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
          }

          .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .calendar-header h3 {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.2rem;
          }

          .calendar-error {
            text-align: center;
            padding: 20px;
            color: var(--text-secondary);
          }

          .error-icon {
            font-size: 2rem;
            margin-bottom: 10px;
          }

          .error-message {
            margin-bottom: 15px;
            font-size: 0.9rem;
          }

          .signin-btn {
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .signin-btn:hover, .reauth-btn:hover {
            background: #38a169;
          }

          .reauth-btn {
            background: #f59e0b;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            margin-top: 10px;
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="calendar-widget">
        <div className="calendar-header">
          <h3>📅 Calendar</h3>
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄
          </button>
        </div>
        <div className="calendar-loading">
          <div className="calendar-spinner"></div>
          <span>Se încarcă...</span>
        </div>
        <style jsx>{`
          .calendar-widget {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
          }

          .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .calendar-header h3 {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.2rem;
          }

          .refresh-btn {
            background: transparent;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s ease;
          }

          .refresh-btn:hover {
            background: var(--bg-primary);
            border-color: var(--accent-color);
          }

          .calendar-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 20px;
            color: var(--text-secondary);
          }

          .calendar-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid var(--border-color);
            border-top: 2px solid var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <h3>📅 Calendar</h3>
        <button className="refresh-btn" onClick={handleRefresh}>
          🔄
        </button>
      </div>

      {/* Summary Cards */}
      <div className="calendar-summary">
        <div className="summary-card">
          <div className="summary-icon">📅</div>
          <div className="summary-content">
            <div className="summary-value">{events.summary.totalToday}</div>
            <div className="summary-label">Astăzi</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">📆</div>
          <div className="summary-content">
            <div className="summary-value">{events.summary.totalTomorrow}</div>
            <div className="summary-label">Mâine</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <div className="summary-value">{events.summary.totalWeek}</div>
            <div className="summary-label">Săptămâna</div>
          </div>
        </div>
      </div>

      {/* Ongoing Events */}
      {events.ongoing.length > 0 && (
        <div className="calendar-section">
          <h4>🟢 Acum</h4>
          <div className="events-list">
            {events.ongoing.map((event) => (
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
      {events.today.events.length > 0 && (
        <div className="calendar-section">
          <h4>📅 Astăzi</h4>
          <div className="events-list">
            {events.today.events.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-time-badge">
                  {event.isAllDay ? 'Toată ziua' : formatTime(event.start)}
                </div>
                <div className="event-content">
                  <div className="event-title">{event.title}</div>
                  <div className="event-details">
                    {event.location && <span>📍 {event.location}</span>}
                    {event.attendees.length > 0 && (
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
          {events.today.hasMore && (
            <div className="more-events">
              +{events.today.total - 3} evenimente
            </div>
          )}
        </div>
      )}

      {/* Next Event */}
      {events.summary.nextEvent && !events.ongoing.length && (
        <div className="calendar-section">
          <h4>⏰ Următorul eveniment</h4>
          <div className="next-event">
            <div className="next-event-time">
              {events.summary.nextEvent.isAllDay 
                ? 'Toată ziua' 
                : formatTime(events.summary.nextEvent.start)
              }
            </div>
            <div className="next-event-title">{events.summary.nextEvent.title}</div>
            {events.summary.nextEvent.location && (
              <div className="next-event-location">
                📍 {events.summary.nextEvent.location}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tomorrow Events Preview */}
      {events.tomorrow.events.length > 0 && (
        <div className="calendar-section">
          <h4>📆 Mâine</h4>
          <div className="events-list compact">
            {events.tomorrow.events.map((event) => (
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
          {events.tomorrow.hasMore && (
            <div className="more-events">
              +{events.tomorrow.total - 3} evenimente
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .calendar-widget {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .calendar-header h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.2rem;
        }

        .refresh-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          background: var(--bg-primary);
          border-color: var(--accent-color);
        }

        .calendar-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .summary-icon {
          font-size: 1.5rem;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-color);
          color: white;
          border-radius: 6px;
        }

        .summary-content {
          flex: 1;
        }

        .summary-value {
          font-size: 1.2rem;
          font-weight: bold;
          color: var(--text-primary);
          line-height: 1;
        }

        .summary-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .calendar-section {
          margin-bottom: 20px;
        }

        .calendar-section h4 {
          margin: 0 0 12px 0;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .events-list.compact {
          gap: 6px;
        }

        .event-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 8px;
          transition: all 0.3s ease;
          position: relative;
        }

        .event-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .event-item.ongoing {
          background: linear-gradient(135deg, #10B98120, #05966920);
          border: 1px solid #10B98140;
        }

        .event-item.small {
          padding: 8px;
          gap: 8px;
        }

        .event-icon {
          font-size: 1.2rem;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-color);
            color: white;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .event-icon-small {
          font-size: 1rem;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-color);
          color: white;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .event-time-badge {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
            min-width: 60px;
          flex-shrink: 0;
        }

        .event-content {
          flex: 1;
        }

        .event-content-small {
          flex: 1;
        }

        .event-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
          line-height: 1.3;
        }

        .event-title-small {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.9rem;
          margin-bottom: 2px;
          line-height: 1.3;
        }

        .event-time {
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .event-time-small {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .event-location {
          color: var(--accent-color);
        }

        .event-details {
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          gap: 8px;
        }

        .event-color {
          width: 4px;
          background: #4285F4;
          border-radius: 2px;
          position: absolute;
          left: 0;
          top: 12px;
          bottom: 12px;
        }

        .next-event {
          background: var(--bg-primary);
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }

        .next-event-time {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
          font-weight: 500;
        }

        .next-event-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .next-event-location {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .more-events {
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-secondary);
          padding: 8px;
          background: var(--bg-primary);
          border-radius: 6px;
          font-style: italic;
        }

        .calendar-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px;
          color: var(--text-secondary);
        }

        .calendar-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border-color);
          border-top: 2px solid var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .calendar-summary {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .event-item {
            padding: 10px;
            gap: 10px;
          }

          .event-item.small {
            padding: 6px;
            gap: 6px;
          }

          .event-title {
            font-size: 0.9rem;
          }

          .event-title-small {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .calendar-widget {
            padding: 16px;
          }

          .calendar-summary {
            gap: 6px;
          }

          .summary-card {
            padding: 10px;
            gap: 8px;
          }

          .summary-icon {
            width: 32px;
            height: 32px;
            font-size: 1.2rem;
          }

          .event-time-badge {
            min-width: 50px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarWidget;
