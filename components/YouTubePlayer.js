import { useState } from 'react';

const YouTubePlayer = ({ video, isOpen, onClose }) => {
  if (!isOpen || !video) return null;

  // Extract video ID from YouTube URL
  const getVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(video.url);

  if (!videoId) {
    return null;
  }

  return (
    <div className="youtube-player-overlay" onClick={onClose}>
      <div className="youtube-player-modal" onClick={(e) => e.stopPropagation()}>
        <div className="youtube-player-header">
          <h3>{video.title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="youtube-player-container">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="youtube-iframe"
          />
        </div>
        <div className="youtube-player-info">
          <p className="video-channel">{video.channelTitle}</p>
          <p className="video-date">
            Published: {new Date(video.publishedAt).toLocaleDateString()}
          </p>
          <p className="video-description">{video.description}</p>
        </div>
      </div>

      <style jsx>{`
        .youtube-player-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .youtube-player-modal {
          background: var(--bg-primary);
          border-radius: 12px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .youtube-player-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .youtube-player-header h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.2rem;
          line-height: 1.4;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 2rem;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .youtube-player-container {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          height: 0;
          overflow: hidden;
          background: #000;
        }

        .youtube-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .youtube-player-info {
          padding: 20px;
        }

        .video-channel {
          color: var(--accent-color);
          font-weight: 600;
          margin: 0 0 5px 0;
        }

        .video-date {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0 0 15px 0;
        }

        .video-description {
          color: var(--text-primary);
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 768px) {
          .youtube-player-overlay {
            padding: 10px;
          }

          .youtube-player-header {
            padding: 15px;
          }

          .youtube-player-header h3 {
            font-size: 1rem;
          }

          .close-button {
            font-size: 1.5rem;
            width: 35px;
            height: 35px;
          }

          .youtube-player-info {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default YouTubePlayer;
