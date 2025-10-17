import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const RadioPlayer = ({ station, onStationChange, isMini = false }) => {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVolume, setShowVolume] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [useExternalPlayer, setUseExternalPlayer] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (station) {
      playStation(station);
    } else {
      stopAudio();
    }
  }, [station]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setDebugInfo('');
    setUseExternalPlayer(false);
  };

  const playStation = async (selectedStation) => {
    if (!selectedStation || !selectedStation.url) {
      setError('Invalid station URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDebugInfo(`Attempting to play: ${selectedStation.name}`);
    setUseExternalPlayer(false);

    try {
      await attemptPlay(selectedStation.url);
      setIsLoading(false);
    } catch (err) {
      console.error('Error playing station:', err);
      setError(`Failed to play station. Please try another.`);
      setDebugInfo(`Error: ${err.message}`);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const attemptPlay = async (url) => {
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    // Create new audio element
    const audio = new Audio();
    audioRef.current = audio;

    // Set audio properties
    audio.volume = volume;
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Audio loading timeout'));
      }, 10000);

      const cleanup = () => {
        clearTimeout(timeout);
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('error', onError);
      };

      const onLoadedMetadata = () => {
        setDebugInfo(`Metadata loaded: ${url}`);
      };

      const onCanPlay = () => {
        cleanup();
        audio.play()
          .then(() => {
            setIsPlaying(true);
            setDebugInfo(`Playing successfully: ${url}`);
            resolve();
          })
          .catch(err => {
            console.error('Play error:', err);
            reject(err);
          });
      };

      const onError = (e) => {
        cleanup();
        const errorCode = audio.error ? audio.error.code : 'unknown';
        const errorMessage = audio.error ? audio.error.message : 'Unknown error';
        
        console.error('Audio error:', {
          error: audio.error,
          code: errorCode,
          message: errorMessage,
          src: audio.src,
          networkState: audio.networkState,
          readyState: audio.readyState,
          currentSrc: audio.currentSrc
        });

        reject(new Error(`Audio error (${errorCode}): ${errorMessage}`));
      };

      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('error', onError);

      audio.src = url;
      audio.load();
    });
  };

  const openExternalPlayer = (url) => {
    // Open in new window/tab
    window.open(url, '_blank', 'width=400,height=300,resizable=yes,scrollbars=yes,status=yes');
  };

  const togglePlayPause = () => {
    if (useExternalPlayer && station) {
      openExternalPlayer(station.url);
      return;
    }

    if (!audioRef.current || !station) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setDebugInfo('Paused');
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setDebugInfo('Playing manually');
        })
        .catch(err => {
          console.error('Manual play error:', err);
          if (err.name === 'NotSupportedError' || err.message.includes('format')) {
            setUseExternalPlayer(true);
            setError(`Format not supported. Opening external player.`);
            openExternalPlayer(station.url);
          } else {
            setError(`Manual play failed: ${err.message}`);
            setDebugInfo(`Manual error: ${err.message}`);
          }
        });
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatGenre = (genre) => {
    if (!genre) return '';
    return genre.split(',')[0].trim();
  };

  if (isMini) {
    return (
      <div className="radio-player mini">
        <div className="mini-player-content">
          <div className="mini-station-info">
            <img 
              src={station?.favicon || '/radio-placeholder.png'} 
              alt={station?.name}
              className="mini-favicon"
              onError={(e) => e.target.src = '/radio-placeholder.png'}
            />
            <div className="mini-text">
              <div className="mini-name">{station?.name || 'No Station'}</div>
              <div className="mini-genre">{formatGenre(station?.genre)}</div>
              {useExternalPlayer && (
                <div className="mini-external-indicator">🌐</div>
              )}
            </div>
          </div>
          
          <div className="mini-controls">
            <button 
              onClick={togglePlayPause}
              className={`mini-play-btn ${isPlaying ? 'playing' : ''} ${useExternalPlayer ? 'external' : ''}`}
              disabled={isLoading || !station}
            >
              {isLoading ? (
                <div className="mini-spinner"></div>
              ) : useExternalPlayer ? (
                <span>🌐</span>
              ) : isPlaying ? (
                <span>⏸️</span>
              ) : (
                <span>▶️</span>
              )}
            </button>
            
            <div className="mini-volume-control">
              <button 
                onClick={() => setShowVolume(!showVolume)}
                className="mini-volume-btn"
              >
                <span>{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
              </button>
              
              {showVolume && (
                <div className="mini-volume-slider">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mini-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {debugInfo && process.env.NODE_ENV === 'development' && (
          <div className="mini-debug">
            <span>🐛</span>
            <span>{debugInfo}</span>
          </div>
        )}

        <style jsx>{`
          .radio-player.mini {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 12px 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            z-index: 1000;
            min-width: 280px;
            transition: all 0.3s ease;
          }

          .mini-player-content {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .mini-station-info {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
          }

          .mini-favicon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            object-fit: cover;
            background: var(--bg-tertiary);
          }

          .mini-text {
            flex: 1;
            min-width: 0;
          }

          .mini-name {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .mini-genre {
            font-size: 0.75rem;
            color: var(--text-secondary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .mini-external-indicator {
            font-size: 0.7rem;
            color: var(--accent-color);
            margin-top: 2px;
          }

          .mini-controls {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .mini-play-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--accent-color);
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 14px;
          }

          .mini-play-btn.external {
            background: var(--accent-hover);
          }

          .mini-play-btn:hover:not(:disabled) {
            transform: scale(1.1);
          }

          .mini-play-btn.playing {
            animation: pulse 2s infinite;
          }

          .mini-play-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .mini-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          .mini-volume-control {
            position: relative;
          }

          .mini-volume-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }

          .mini-volume-btn:hover {
            transform: scale(1.1);
          }

          .mini-volume-slider {
            position: absolute;
            bottom: 100%;
            right: 0;
            margin-bottom: 8px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }

          .mini-volume-slider input {
            width: 100px;
            height: 4px;
          }

          .mini-error {
            margin-top: 8px;
            padding: 8px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 6px;
            color: #ef4444;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .mini-debug {
            margin-top: 4px;
            padding: 4px 8px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 4px;
            color: #3b82f6;
            font-size: 0.7rem;
            display: flex;
            align-items: center;
            gap: 4px;
            word-break: break-all;
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
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
    <div className="radio-player">
      <div className="player-header">
        <div className="station-artwork">
          <img 
            src={station?.favicon || '/radio-placeholder.png'} 
            alt={station?.name}
            className={`station-image ${isPlaying ? 'rotating' : ''}`}
            onError={(e) => e.target.src = '/radio-placeholder.png'}
          />
          {isPlaying && (
            <div className="playing-indicator">
              <div className="sound-wave">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
        
        <div className="station-details">
          <h2 className="station-name">{station?.name || 'Select a Station'}</h2>
          <div className="station-meta">
            <span>📍 {station?.country || 'Romania'}</span>
            <span>🎵 {station?.bitrate || 128} kbps</span>
            {useExternalPlayer && (
              <span className="external-indicator">🌐 External Player</span>
            )}
          </div>
          <p className="station-genre">{formatGenre(station?.genre)}</p>
        </div>
      </div>

      <div className="player-controls">
        <button 
          onClick={togglePlayPause}
          className={`play-btn ${isPlaying ? 'playing' : ''} ${useExternalPlayer ? 'external' : ''}`}
          disabled={isLoading || !station}
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : useExternalPlayer ? (
            <span>🌐</span>
          ) : isPlaying ? (
            <span>⏸️</span>
          ) : (
            <span>▶️</span>
          )}
        </button>

        <div className="volume-control">
          <button 
            onClick={() => setShowVolume(!showVolume)}
            className="volume-btn"
          >
            <span>{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
          </button>
          
          {showVolume && (
            <div className="volume-slider">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              />
              <div className="volume-label">{Math.round(volume * 100)}%</div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {debugInfo && process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <span>🐛 Debug:</span>
          <span>{debugInfo}</span>
        </div>
      )}

      <style jsx>{`
        .radio-player {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          max-width: 400px;
          margin: 0 auto;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .player-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .station-artwork {
          position: relative;
          flex-shrink: 0;
        }

        .station-image {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          object-fit: cover;
          background: var(--bg-tertiary);
          transition: transform 0.3s ease;
        }

        .station-image.rotating {
          animation: rotate 20s linear infinite;
        }

        .playing-indicator {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 24px;
          height: 24px;
          background: var(--accent-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0);
          transition: all 0.3s ease;
        }

        .playing-indicator {
          opacity: 1;
          transform: scale(1);
        }

        .sound-wave {
          display: flex;
          gap: 2px;
          height: 12px;
        }

        .sound-wave span {
          width: 2px;
          background: white;
          border-radius: 1px;
          animation: wave 0.6s ease-in-out infinite;
        }

        .sound-wave span:nth-child(1) { animation-delay: 0s; }
        .sound-wave span:nth-child(2) { animation-delay: 0.2s; }
        .sound-wave span:nth-child(3) { animation-delay: 0.4s; }

        .station-details {
          flex: 1;
          min-width: 0;
        }

        .station-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .station-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 4px;
        }

        .station-meta span {
          font-size: 0.8rem;
          color: var(--text-secondary);
          opacity: 0.8;
        }

        .external-indicator {
          font-size: 0.8rem;
          color: var(--accent-color);
          font-weight: 500;
        }

        .station-genre {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .player-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .play-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
          font-size: 24px;
        }

        .play-btn.external {
          background: linear-gradient(135deg, var(--accent-hover), #667eea);
        }

        .play-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
        }

        .play-btn.playing {
          animation: pulse 2s infinite;
        }

        .play-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .volume-control {
          position: relative;
        }

        .volume-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          font-size: 1.2rem;
        }

        .volume-btn:hover {
          transform: scale(1.1);
          border-color: var(--accent-color);
        }

        .volume-slider {
          position: absolute;
          bottom: 100%;
          right: 0;
          margin-bottom: 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          min-width: 120px;
        }

        .volume-slider input {
          width: 100%;
          height: 6px;
          margin-bottom: 8px;
        }

        .volume-label {
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.9rem;
        }

        .debug-info {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 12px;
          padding: 8px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 6px;
          color: #3b82f6;
          font-size: 0.8rem;
          word-break: break-all;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .radio-player {
            padding: 20px;
            margin: 0 16px;
          }

          .station-image {
            width: 60px;
            height: 60px;
          }

          .station-name {
            font-size: 1.1rem;
          }

          .play-btn {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default RadioPlayer;
