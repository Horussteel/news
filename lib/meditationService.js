class MeditationService {
  constructor() {
    this.initializeStorage();
    this.timers = new Map(); // Store active timers
    this.audioContext = null;
    this.sounds = {};
  }

  initializeStorage() {
    if (typeof window === 'undefined') return;
    
    if (!localStorage.getItem('meditationSettings')) {
      localStorage.setItem('meditationSettings', JSON.stringify({
        defaultDuration: 10, // minutes
        soundEnabled: true,
        selectedSound: 'rain',
        autoCompleteHabits: true,
        reminderEnabled: false,
        reminderTime: '08:00'
      }));
    }

    if (!localStorage.getItem('meditationSessions')) {
      localStorage.setItem('meditationSessions', JSON.stringify({}));
    }

    if (!localStorage.getItem('meditationStats')) {
      localStorage.setItem('meditationStats', JSON.stringify({
        totalSessions: 0,
        totalMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteDuration: 10,
        averageSessionLength: 0
      }));
    }
  }

  // Get meditation settings
  getMeditationSettings() {
    if (typeof window === 'undefined') return {};
    try {
      const settings = localStorage.getItem('meditationSettings');
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('❌ MeditationService: Error getting settings:', error);
      return {};
    }
  }

  // Save meditation settings
  saveMeditationSettings(settings) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('meditationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving meditation settings:', error);
    }
  }

  // Update meditation setting
  updateMeditationSetting(key, value) {
    const settings = this.getMeditationSettings();
    settings[key] = value;
    this.saveMeditationSettings(settings);
    return settings;
  }

  // Get available meditation durations
  getDurations() {
    return [
      { minutes: 3, label: '3 minute', description: 'Scurtă pauză' },
      { minutes: 5, label: '5 minute', description: 'Respirare rapidă' },
      { minutes: 10, label: '10 minute', description: 'Sesiune standard' },
      { minutes: 15, label: '15 minute', description: 'Relaxare profundă' },
      { minutes: 20, label: '20 minute', description: 'Meditare completă' },
      { minutes: 30, label: '30 minute', description: 'Sesiune lungă' }
    ];
  }

  // Get available ambient sounds
  getAmbientSounds() {
    return [
      { 
        id: 'rain', 
        name: 'Ploaie', 
        description: 'Sunet de ploaie calmantă',
        icon: '🌧️',
        color: '#3b82f6'
      },
      { 
        id: 'ocean', 
        name: 'Ocean', 
        description: 'Valuri oceanice',
        icon: '🌊',
        color: '#06b6d4'
      },
      { 
        id: 'forest', 
        name: 'Pădure', 
        description: 'Sunete de pădure',
        icon: '🌲',
        color: '#10b981'
      },
      { 
        id: 'fire', 
        name: 'Foc de tabără', 
        description: 'Crăpat de foc',
        icon: '🔥',
        color: '#f59e0b'
      },
      { 
        id: 'birds', 
        name: 'Păsări', 
        description: 'Ciripit de păsări',
        icon: '🐦',
        color: '#84cc16'
      },
      { 
        id: 'white_noise', 
        name: 'Zgomot alb', 
        description: 'Zgomot alb relaxant',
        icon: '📻',
        color: '#6b7280'
      },
      { 
        id: 'bells', 
        name: 'Clopoței', 
        description: 'Clopoței tibetani',
        icon: '🔔',
        color: '#8b5cf6'
      },
      { 
        id: 'silence', 
        name: 'Liniște', 
        description: 'Fără sunet',
        icon: '🤫',
        color: '#9ca3af'
      }
    ];
  }

  // Initialize audio context
  initAudioContext() {
    if (typeof window === 'undefined') return null;
    
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    return this.audioContext;
  }

  // Create ambient sound using Web Audio API
  createAmbientSound(type) {
    const audioContext = this.initAudioContext();
    if (!audioContext) return null;

    // Create different sound types using oscillators and noise
    switch (type) {
      case 'rain':
        return this.createRainSound(audioContext);
      case 'ocean':
        return this.createOceanSound(audioContext);
      case 'forest':
        return this.createForestSound(audioContext);
      case 'fire':
        return this.createFireSound(audioContext);
      case 'white_noise':
        return this.createWhiteNoise(audioContext);
      case 'bells':
        return this.createBellsSound(audioContext);
      default:
        return null;
    }
  }

  // Create rain sound using filtered noise
  createRainSound(audioContext) {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    
    // Create filter for rain effect
    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    // Create gain for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.1;
    
    // Connect nodes
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    return {
      source: whiteNoise,
      gain: gainNode,
      stop: () => whiteNoise.stop()
    };
  }

  // Create ocean sound using low-frequency oscillators
  createOceanSound(audioContext) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.15;
    
    // Create multiple oscillators for ocean waves
    const oscillators = [];
    const frequencies = [100, 150, 200, 250];
    
    frequencies.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      oscGain.gain.value = 0.3 / (index + 1);
      
      // Add some modulation
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.frequency.value = 0.1 + (index * 0.05);
      lfoGain.gain.value = 10;
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      
      osc.start();
      lfo.start();
      
      oscillators.push({ osc, lfo });
    });
    
    gainNode.connect(audioContext.destination);
    
    return {
      gain: gainNode,
      stop: () => {
        oscillators.forEach(({ osc, lfo }) => {
          osc.stop();
          lfo.stop();
        });
      }
    };
  }

  // Create forest sound with bird-like chirps
  createForestSound(audioContext) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.1;
    
    // Create base ambient sound
    const ambientOsc = audioContext.createOscillator();
    const ambientGain = audioContext.createGain();
    
    ambientOsc.frequency.value = 200;
    ambientOsc.type = 'triangle';
    ambientGain.gain.value = 0.2;
    
    ambientOsc.connect(ambientGain);
    ambientGain.connect(gainNode);
    
    // Create bird chirps
    const chirps = [];
    const createChirp = () => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.frequency.value = 800 + Math.random() * 1200;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(gainNode);
      
      osc.start();
      osc.stop(audioContext.currentTime + 0.1);
      
      return { osc, gain };
    };
    
    // Schedule random chirps
    const scheduleChirps = () => {
      if (chirps.length < 3) {
        chirps.push(createChirp());
      }
      setTimeout(scheduleChirps, 1000 + Math.random() * 3000);
    };
    
    scheduleChirps();
    ambientOsc.start();
    gainNode.connect(audioContext.destination);
    
    return {
      gain: gainNode,
      stop: () => {
        ambientOsc.stop();
        chirps.forEach(({ osc }) => osc.stop());
      }
    };
  }

  // Create fire sound using noise and modulation
  createFireSound(audioContext) {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    // Generate noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    // Create filter for fire crackle
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 10;
    
    // Create gain with modulation
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.08;
    
    // Add modulation for crackling effect
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 8;
    lfoGain.gain.value = 0.05;
    
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noise.start();
    lfo.start();
    
    return {
      gain: gainNode,
      stop: () => {
        noise.stop();
        lfo.stop();
      }
    };
  }

  // Create white noise
  createWhiteNoise(audioContext) {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.05;
    
    whiteNoise.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    whiteNoise.start();
    
    return {
      gain: gainNode,
      stop: () => whiteNoise.stop()
    };
  }

  // Create bells sound
  createBellsSound(audioContext) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.1;
    
    const createBell = (frequency, delay) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.frequency.value = frequency;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, audioContext.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 2);
      
      osc.connect(gain);
      gain.connect(gainNode);
      
      osc.start(audioContext.currentTime + delay);
      osc.stop(audioContext.currentTime + delay + 2);
    };
    
    // Create multiple bells with different frequencies
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (octave higher)
    
    frequencies.forEach((freq, index) => {
      createBell(freq, index * 0.5);
    });
    
    gainNode.connect(audioContext.destination);
    
    return {
      gain: gainNode,
      stop: () => {} // Bells stop automatically
    };
  }

  // Start meditation timer
  startMeditation(duration, soundType = 'silence', onComplete = null) {
    const timerId = Date.now().toString();
    const startTime = Date.now();
    const endTime = startTime + (duration * 60 * 1000);
    
    let ambientSound = null;
    
    // Start ambient sound if not silence
    if (soundType !== 'silence') {
      try {
        ambientSound = this.createAmbientSound(soundType);
      } catch (error) {
        console.error('Error creating ambient sound:', error);
      }
    }
    
    const timer = {
      id: timerId,
      duration: duration,
      startTime: startTime,
      endTime: endTime,
      soundType: soundType,
      ambientSound: ambientSound,
      onComplete: onComplete,
      remainingTime: duration * 60, // in seconds
      isActive: true,
      isPaused: false,
      pausedTime: 0
    };
    
    // Start the timer interval
    timer.interval = setInterval(() => {
      if (!timer.isPaused) {
        const elapsed = Date.now() - startTime - timer.pausedTime;
        timer.remainingTime = Math.max(0, duration * 60 - Math.floor(elapsed / 1000));
        
        // Check if timer is complete
        if (timer.remainingTime <= 0) {
          this.completeMeditation(timerId);
        }
      }
    }, 1000);
    
    this.timers.set(timerId, timer);
    
    return timerId;
  }

  // Pause meditation timer
  pauseMeditation(timerId) {
    const timer = this.timers.get(timerId);
    if (timer && timer.isActive) {
      timer.isPaused = true;
      timer.pauseStartTime = Date.now();
      
      // Pause ambient sound
      if (timer.ambientSound && timer.ambientSound.gain) {
        timer.ambientSound.gain.gain.value = 0;
      }
    }
  }

  // Resume meditation timer
  resumeMeditation(timerId) {
    const timer = this.timers.get(timerId);
    if (timer && timer.isActive && timer.isPaused) {
      timer.isPaused = false;
      timer.pausedTime += Date.now() - timer.pauseStartTime;
      
      // Resume ambient sound
      if (timer.ambientSound && timer.ambientSound.gain) {
        timer.ambientSound.gain.gain.value = 0.1;
      }
    }
  }

  // Stop meditation timer
  stopMeditation(timerId) {
    const timer = this.timers.get(timerId);
    if (timer) {
      // Clear interval
      if (timer.interval) {
        clearInterval(timer.interval);
      }
      
      // Stop ambient sound
      if (timer.ambientSound) {
        try {
          timer.ambientSound.stop();
        } catch (error) {
          // Sound might have already stopped
        }
      }
      
      timer.isActive = false;
      this.timers.delete(timerId);
    }
  }

  // Complete meditation session
  completeMeditation(timerId) {
    const timer = this.timers.get(timerId);
    if (timer) {
      // Stop the timer
      this.stopMeditation(timerId);
      
      // Record the session
      this.recordMeditationSession(timer);
      
      // Play completion sound
      this.playCompletionSound();
      
      // Call completion callback
      if (timer.onComplete) {
        timer.onComplete(timer);
      }
      
      // Auto-complete habits if enabled
      const settings = this.getMeditationSettings();
      if (settings.autoCompleteHabits) {
        this.autoCompleteMeditationHabits();
      }
    }
  }

  // Record meditation session
  recordMeditationSession(timer) {
    const sessions = this.getMeditationSessions();
    const today = new Date().toISOString().split('T')[0];
    
    if (!sessions[today]) {
      sessions[today] = [];
    }
    
    const session = {
      id: timer.id,
      duration: timer.duration,
      soundType: timer.soundType,
      startTime: new Date(timer.startTime).toISOString(),
      endTime: new Date().toISOString(),
      completed: true,
      date: today
    };
    
    sessions[today].push(session);
    this.saveMeditationSessions(sessions);
    
    // Update stats
    this.updateMeditationStats();
  }

  // Get meditation sessions
  getMeditationSessions() {
    if (typeof window === 'undefined') return {};
    try {
      const sessions = localStorage.getItem('meditationSessions');
      return sessions ? JSON.parse(sessions) : {};
    } catch (error) {
      console.error('❌ MeditationService: Error getting sessions:', error);
      return {};
    }
  }

  // Save meditation sessions
  saveMeditationSessions(sessions) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('meditationSessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving meditation sessions:', error);
    }
  }

  // Get meditation statistics
  getMeditationStats() {
    if (typeof window === 'undefined') return {};
    try {
      const stats = localStorage.getItem('meditationStats');
      return stats ? JSON.parse(stats) : {};
    } catch (error) {
      console.error('❌ MeditationService: Error getting stats:', error);
      return {};
    }
  }

  // Save meditation statistics
  saveMeditationStats(stats) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('meditationStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving meditation stats:', error);
    }
  }

  // Update meditation statistics
  updateMeditationStats() {
    const sessions = this.getMeditationSessions();
    const stats = this.getMeditationStats();
    
    let totalSessions = 0;
    let totalMinutes = 0;
    const sessionDates = [];
    const durations = [];
    
    // Calculate totals
    Object.values(sessions).forEach(daySessions => {
      daySessions.forEach(session => {
        if (session.completed) {
          totalSessions++;
          totalMinutes += session.duration;
          sessionDates.push(session.date);
          durations.push(session.duration);
        }
      });
    });
    
    // Calculate current streak
    const currentStreak = this.calculateCurrentStreak(sessionDates);
    
    // Calculate longest streak
    const longestStreak = this.calculateLongestStreak(sessionDates);
    
    // Calculate favorite duration
    const favoriteDuration = this.calculateFavoriteDuration(durations);
    
    // Calculate average session length
    const averageSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    
    // Update stats
    const updatedStats = {
      ...stats,
      totalSessions,
      totalMinutes,
      currentStreak,
      longestStreak,
      favoriteDuration,
      averageSessionLength,
      lastUpdated: new Date().toISOString()
    };
    
    this.saveMeditationStats(updatedStats);
    return updatedStats;
  }

  // Calculate current streak
  calculateCurrentStreak(dates) {
    if (dates.length === 0) return 0;
    
    const sortedDates = [...new Set(dates)].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (sortedDates[i] === expectedDateStr || (i === 0 && sortedDates[i] === today)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Calculate longest streak
  calculateLongestStreak(dates) {
    if (dates.length === 0) return 0;
    
    const sortedDates = [...new Set(dates)].sort();
    let longestStreak = 0;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    return Math.max(longestStreak, currentStreak);
  }

  // Calculate favorite duration
  calculateFavoriteDuration(durations) {
    if (durations.length === 0) return 10;
    
    const frequency = {};
    durations.forEach(duration => {
      frequency[duration] = (frequency[duration] || 0) + 1;
    });
    
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b, 10);
  }

  // Play completion sound
  playCompletionSound() {
    try {
      const audioContext = this.initAudioContext();
      if (!audioContext) return;
      
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Create a pleasant completion chime
      osc.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      osc.start();
      osc.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing completion sound:', error);
    }
  }

  // Auto-complete meditation habits
  autoCompleteMeditationHabits() {
    // Import habitService dynamically to avoid circular dependencies
    const habitService = require('./habitService').default;
    const habits = habitService.getHabits();
    const today = new Date().toISOString().split('T')[0];
    
    habits.forEach(habit => {
      // Check if this is a meditation-related habit
      const isMeditationHabit = habit.name.toLowerCase().includes('medit') ||
                              habit.name.toLowerCase().includes('relax') ||
                              habit.name.toLowerCase().includes('mindfulness') ||
                              habit.category === 'mindfulness';
      
      if (isMeditationHabit && !habit.isArchived) {
        // Mark as completed if not already completed
        if (!habitService.isHabitCompleted(habit.id, today)) {
          habitService.markHabitCompletedWithGamification(habit.id, today);
        }
      }
    });
  }

  // Get active timer
  getActiveTimer(timerId) {
    return this.timers.get(timerId);
  }

  // Get all active timers
  getAllActiveTimers() {
    return Array.from(this.timers.values());
  }

  // Clear all meditation data
  clearAllData() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('meditationSettings');
      localStorage.removeItem('meditationSessions');
      localStorage.removeItem('meditationStats');
      this.initializeStorage();
    } catch (error) {
      console.error('Error clearing meditation data:', error);
    }
  }

  // Export meditation data
  exportMeditationData() {
    const settings = this.getMeditationSettings();
    const sessions = this.getMeditationSessions();
    const stats = this.getMeditationStats();
    
    return {
      settings,
      sessions,
      stats,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Import meditation data
  importMeditationData(data) {
    try {
      if (data.settings && typeof data.settings === 'object') {
        this.saveMeditationSettings(data.settings);
      }
      
      if (data.sessions && typeof data.sessions === 'object') {
        this.saveMeditationSessions(data.sessions);
      }
      
      if (data.stats && typeof data.stats === 'object') {
        this.saveMeditationStats(data.stats);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing meditation data:', error);
      return false;
    }
  }
}

export default new MeditationService();
