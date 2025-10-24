class CalendarService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minute cache
  }

  // Obține evenimentele din calendar pentru utilizatorul autentificat
  async getCalendarEvents(accessToken, timeMin = null, timeMax = null, maxResults = 10) {
    try {
      const cacheKey = `calendar_${accessToken}_${timeMin}_${timeMax}_${maxResults}`;
      
      console.log('📅 Service: Getting calendar events', {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length,
        timeMin,
        timeMax,
        maxResults,
        cacheKey: cacheKey.substring(0, 50) + '...'
      });
      
      // Verifică cache-ul
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log('📅 Service: Returning cached data');
          return cached.data;
        }
      }

      // Setează intervale de timp default dacă nu sunt specificate
      const now = new Date();
      const timeMinParam = timeMin || now.toISOString();
      const timeMaxParam = timeMax || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // +7 zile

      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${encodeURIComponent(timeMinParam)}&` +
        `timeMax=${encodeURIComponent(timeMaxParam)}&` +
        `maxResults=${maxResults}&` +
        `singleEvents=true&` +
        `orderBy=startTime`;

      console.log('📅 Service: Making API call to:', url);

      // Face call-ul către Google Calendar API
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📅 Service: API response', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('📅 Service: API error response:', errorText);
        
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED');
        } else if (response.status === 403) {
          throw new Error('FORBIDDEN - Calendar API might not be enabled');
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📅 Service: Raw API data:', {
        itemsCount: data.items?.length || 0,
        hasItems: !!data.items,
        hasNextPageToken: !!data.nextPageToken,
        summary: data.summary
      });
      
      // Procesează evenimentele
      const events = data.items ? data.items.map(event => this.formatEvent(event)) : [];
      console.log('📅 Service: Formatted events:', {
        count: events.length,
        sampleEvent: events[0] || 'No events'
      });
      
      // Salvează în cache
      this.cache.set(cacheKey, {
        data: events,
        timestamp: Date.now()
      });

      return events;
    } catch (error) {
      console.error('📅 Service: Error fetching calendar events:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  // Formatează un eveniment din API-ul Google
  formatEvent(event) {
    const start = this.parseDateTime(event.start);
    const end = this.parseDateTime(event.end);
    const now = new Date();

    return {
      id: event.id,
      title: event.summary || 'Fără titlu',
      description: event.description || '',
      location: event.location || '',
      start: start,
      end: end,
      startTime: start.toLocaleTimeString('ro-RO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      startDate: start.toLocaleDateString('ro-RO'),
      endTime: end.toLocaleTimeString('ro-RO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      endDate: end.toLocaleDateString('ro-RO'),
      isAllDay: event.start.date ? true : false,
      isToday: this.isSameDay(start, now),
      isTomorrow: this.isSameDay(start, new Date(now.getTime() + 24 * 60 * 60 * 1000)),
      isPast: end < now,
      isFuture: start > now,
      isOngoing: start <= now && end >= now,
      color: event.colorId ? this.getColorById(event.colorId) : '#4285F4',
      status: event.status || 'confirmed',
      creator: event.creator ? {
        email: event.creator.email,
        displayName: event.creator.displayName
      } : null,
      attendees: event.attendees || [],
      recurrence: event.recurrence || [],
      visibility: event.visibility || 'default',
      attachments: event.attachments || []
    };
  }

  // Parsează data/ora din formatul Google Calendar
  parseDateTime(dateTime) {
    if (dateTime.date) {
      // All-day event
      return new Date(dateTime.date + 'T00:00:00');
    } else if (dateTime.dateTime) {
      // Specific time event
      return new Date(dateTime.dateTime);
    }
    return new Date();
  }

  // Verifică dacă două date sunt în aceeași zi
  isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  // Obține culoarea după ID-ul culorii din Google Calendar
  getColorById(colorId) {
    const colors = {
      '1': '#7986CB', // Lavender
      '2': '#33B679', // Sage
      '3': '#8E24AA', // Grape
      '4': '#E67C73', // Flamingo
      '5': '#F6BF26', // Banana
      '6': '#F4511E', // Tangerine
      '7': '#039BE5', // Peacock
      '8': '#616161', // Graphite
      '9': '#3F51B5', // Blueberry
      '10': '#0B8043', // Basil
      '11': '#D60000'  // Tomato
    };
    return colors[colorId] || '#4285F4';
  }

  // Obține evenimentele pentru azi
  async getTodayEvents(accessToken) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return this.getCalendarEvents(
      accessToken,
      startOfDay.toISOString(),
      endOfDay.toISOString(),
      20
    );
  }

  // Obține evenimentele pentru următoarele 7 zile
  async getWeekEvents(accessToken) {
    const now = new Date();
    const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.getCalendarEvents(
      accessToken,
      now.toISOString(),
      endOfWeek.toISOString(),
      50
    );
  }

  // Obține evenimentele pentru ziua de mâine
  async getTomorrowEvents(accessToken) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const endOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1);

    return this.getCalendarEvents(
      accessToken,
      startOfTomorrow.toISOString(),
      endOfTomorrow.toISOString(),
      20
    );
  }

  // Grupează evenimentele pe zile
  groupEventsByDay(events) {
    const grouped = {};
    
    events.forEach(event => {
      const dateKey = event.startDate;
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: event.start,
          dateKey: dateKey,
          events: []
        };
      }
      grouped[dateKey].events.push(event);
    });

    // Sortează zilele
    const sortedGroups = Object.values(grouped).sort((a, b) => a.date - b.date);
    
    // Sortează evenimentele din fiecare zi
    sortedGroups.forEach(group => {
      group.events.sort((a, b) => a.start - b.start);
    });

    return sortedGroups;
  }

  // Obține un rezumat al evenimentelor (pentru dashboard)
  async getEventsSummary(accessToken) {
    try {
      const [todayEvents, tomorrowEvents, weekEvents] = await Promise.all([
        this.getTodayEvents(accessToken),
        this.getTomorrowEvents(accessToken),
        this.getWeekEvents(accessToken)
      ]);

      return {
        today: {
          total: todayEvents.length,
          events: todayEvents.slice(0, 3), // Primele 3 evenimente de azi
          hasMore: todayEvents.length > 3
        },
        tomorrow: {
          total: tomorrowEvents.length,
          events: tomorrowEvents.slice(0, 3), // Primele 3 evenimente de mâine
          hasMore: tomorrowEvents.length > 3
        },
        week: {
          total: weekEvents.length,
          events: weekEvents.slice(0, 5), // Primele 5 evenimente din săptămână
          hasMore: weekEvents.length > 5
        },
        upcoming: weekEvents.filter(event => event.isFuture).slice(0, 3),
        ongoing: weekEvents.filter(event => event.isOngoing),
        summary: {
          totalToday: todayEvents.length,
          totalTomorrow: tomorrowEvents.length,
          totalWeek: weekEvents.length,
          ongoingCount: weekEvents.filter(event => event.isOngoing).length,
          nextEvent: weekEvents.find(event => event.isFuture) || null
        }
      };
    } catch (error) {
      console.error('Error getting events summary:', error);
      return {
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
      };
    }
  }

  // Șterge cache-ul
  clearCache() {
    this.cache.clear();
  }

  // Verifică dacă token-ul este valid
  async validateToken(accessToken) {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return response.ok;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
}

// Exportă o instanță singleton
const calendarService = new CalendarService();
export default calendarService;
