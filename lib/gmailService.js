class GmailService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 2 * 60 * 1000; // 2 minute cache
  }

  // Obține emailurile din Gmail
  async getGmailMessages(accessToken, query = '', maxResults = 20) {
    try {
      const cacheKey = `gmail_${accessToken}_${query}_${maxResults}`;
      
      // Verifică cache-ul
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Face call-ul către Gmail API
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?` +
        `q=${encodeURIComponent(query)}&` +
        `maxResults=${maxResults}&` +
        `orderBy=internalDate&` +
        `labelIds=INBOX`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED');
        } else if (response.status === 403) {
          throw new Error('FORBIDDEN - Gmail API might not be enabled');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const messages = data.messages || [];

      // Obține detalii complete pentru fiecare mesaj
      const detailedMessages = await this.getMessageDetails(accessToken, messages);
      
      // Salvează în cache
      this.cache.set(cacheKey, {
        data: detailedMessages,
        timestamp: Date.now()
      });

      return detailedMessages;
    } catch (error) {
      console.error('Error fetching Gmail messages:', error);
      throw error;
    }
  }

  // Obține detalii complete pentru un mesaj
  async getMessageDetails(accessToken, messages) {
    const messagePromises = messages.map(async (message) => {
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        console.error(`Error fetching message ${message.id}:`, response.status);
        return null;
      }

      const messageData = await response.json();
      return this.parseGmailMessage(messageData);
    });

    const results = await Promise.all(messagePromises);
    return results.filter(message => message !== null);
  }

  // Parsează un mesaj din formatul Gmail
  parseGmailMessage(messageData) {
    const headers = messageData.payload.headers;
    const subjectHeader = headers.find(h => h.name === 'Subject') || {};
    const fromHeader = headers.find(h => h.name === 'From') || {};
    const dateHeader = headers.find(h => h.name === 'Date') || {};
    const toHeader = headers.find(h => h.name === 'To') || {};

    // Extrage numele expeditorului
    const fromMatch = fromHeader.value?.match(/(.+?)\s*<(.+?)>/);
    const senderName = fromMatch ? fromMatch[1].trim().replace(/"/g, '') : fromHeader.value || 'Unknown';
    const senderEmail = fromMatch ? fromMatch[2] : fromHeader.value || '';

    // Verifică dacă e citit
    const isUnread = messageData.labelIds?.includes('UNREAD') || false;

    // Extrage snippet-ul
    const snippet = messageData.snippet || '';

    // Extrage data
    const date = dateHeader.value ? new Date(dateHeader.value) : new Date(parseInt(messageData.internalDate));

    return {
      id: messageData.id,
      threadId: messageData.threadId,
      subject: subjectHeader.value || 'Fără subiect',
      from: {
        name: senderName,
        email: senderEmail,
        avatar: this.generateAvatar(senderEmail)
      },
      to: toHeader.value || '',
      date: date,
      dateFormatted: this.formatDate(date),
      timeFormatted: this.formatTime(date),
      snippet: snippet,
      isUnread: isUnread,
      isImportant: messageData.labelIds?.includes('IMPORTANT') || false,
      isStarred: messageData.labelIds?.includes('STARRED') || false,
      labels: messageData.labelIds || [],
      size: messageData.sizeEstimate || 0
    };
  }

  // Generează avatar bazat pe email
  generateAvatar(email) {
    const colors = [
      '#4285F4', '#EA4335', '#FBBC05', '#34A853',
      '#9C27B0', '#FF5722', '#795548', '#607D8B',
      '#E91E63', '#9E9E9E', '#3F51B5', '#009688'
    ];
    
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    
    const initials = email.split('@')[0]
      .split('.')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return {
      type: 'generated',
      initials: initials || 'NA',
      color: color
    };
  }

  // Formatează data
  formatDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return 'Astăzi';
    } else if (messageDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
      return 'Ieri';
    } else {
      return date.toLocaleDateString('ro-RO', {
        day: 'numeric',
        month: 'short'
      });
    }
  }

  // Formatează ora
  formatTime(date) {
    return date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obține emailurile primite azi
  async getTodayMessages(accessToken) {
    const today = new Date();
    const afterDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const query = `after:${Math.floor(afterDate.getTime() / 1000)}`;
    
    return this.getGmailMessages(accessToken, query, 50);
  }

  // Obține emailurile necitite
  async getUnreadMessages(accessToken) {
    return this.getGmailMessages(accessToken, 'is:unread', 30);
  }

  // Obține emailurile importante
  async getImportantMessages(accessToken) {
    return this.getGmailMessages(accessToken, 'is:important', 20);
  }

  // Obține statistici pentru dashboard
  async getGmailStats(accessToken) {
    try {
      const [todayMessages, unreadMessages] = await Promise.all([
        this.getTodayMessages(accessToken),
        this.getUnreadMessages(accessToken)
      ]);

      const unreadCount = unreadMessages.length;
      const todayCount = todayMessages.length;
      
      // Calculează tendința (comparativ cu ieri)
      const yesterdayQuery = `after:${Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000)} before:${Math.floor(Date.now() / 1000)}`;
      const yesterdayMessages = await this.getGmailMessages(accessToken, yesterdayQuery, 100);
      const yesterdayCount = yesterdayMessages.filter(msg => {
        const msgDate = new Date(msg.date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return msgDate.toDateString() === yesterday.toDateString();
      }).length;

      const trend = todayCount > yesterdayCount ? 'up' : 
                   todayCount < yesterdayCount ? 'down' : 'stable';

      return {
        unreadCount,
        todayCount,
        yesterdayCount,
        trend,
        recentMessages: todayMessages.slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting Gmail stats:', error);
      return {
        unreadCount: 0,
        todayCount: 0,
        yesterdayCount: 0,
        trend: 'stable',
        recentMessages: []
      };
    }
  }

  // Obține preview-uri pentru dashboard
  async getDashboardMessages(accessToken) {
    try {
      const messages = await this.getTodayMessages(accessToken);
      return messages.slice(0, 3); // Primele 3 mesaje pentru dashboard
    } catch (error) {
      console.error('Error getting dashboard messages:', error);
      return [];
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
      console.error('Error validating Gmail token:', error);
      return false;
    }
  }
}

// Exportă o instanță singleton
const gmailService = new GmailService();
export default gmailService;
