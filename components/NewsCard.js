import React from 'react';
import Link from 'next/link';
import styles from './NewsCard.module.css';
import { useUser } from '../contexts/UserContext';

const NewsCard = ({ article }) => {
  const { title, description, url, urlToImage, publishedAt, source } = article;
  const { toggleBookmark, isBookmarked, addToHistory, isAuthenticated } = useUser();
  const bookmarked = isBookmarked(url);

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAuthenticated) {
      toggleBookmark(article);
    }
  };

  const handleArticleClick = () => {
    if (isAuthenticated) {
      addToHistory(article);
    }
  };

  return (
    <div className={styles['news-card']}>
      {urlToImage && (
        <div className={styles['news-card-image']}>
          <img src={urlToImage} alt={title} />
        </div>
      )}
      <div className={styles['news-card-content']}>
        <div className={styles['news-card-header']}>
          <span className={styles['news-source']}>{source?.name}</span>
          <span className={styles['news-date']}>
            {new Date(publishedAt).toLocaleDateString()}
          </span>
        </div>
        <div className={styles['news-card-actions']}>
          <button 
            className={`${styles['bookmark-btn']} ${bookmarked ? styles.bookmarked : ''}`}
            onClick={handleBookmarkClick}
            title={bookmarked ? 'Remove bookmark' : 'Save article'}
          >
            <svg className={styles['bookmark-icon']} viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
        <h3 className={styles['news-title']}>
          <Link 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleArticleClick}
          >
            {title}
          </Link>
        </h3>
        <p className={styles['news-description']}>{description}</p>
        <Link 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles['read-more']}
          onClick={handleArticleClick}
        >
          Citeste mai mult →
        </Link>
      </div>
    </div>
  );
};

export default NewsCard;
