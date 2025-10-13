import React from 'react';
import Link from 'next/link';

const NewsCard = ({ article }) => {
  const { title, description, url, urlToImage, publishedAt, source } = article;

  return (
    <div className="news-card">
      {urlToImage && (
        <div className="news-card-image">
          <img src={urlToImage} alt={title} />
        </div>
      )}
      <div className="news-card-content">
        <div className="news-card-header">
          <span className="news-source">{source?.name}</span>
          <span className="news-date">
            {new Date(publishedAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="news-title">
          <Link href={url} target="_blank" rel="noopener noreferrer">
            {title}
          </Link>
        </h3>
        <p className="news-description">{description}</p>
        <Link href={url} target="_blank" rel="noopener noreferrer" className="read-more">
          Citeste mai mult →
        </Link>
      </div>
    </div>
  );
};

export default NewsCard;
