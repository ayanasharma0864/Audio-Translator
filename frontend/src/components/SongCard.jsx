// Component: SongCard
// Purpose: Displays a compact card with song info for search results and history
// Props: title, artist, thumbnail, languageName, year, onClick

import React from 'react';
import LanguageBadge from './LanguageBadge';

export default function SongCard({ title, artist, thumbnail, languageName, year, onClick }) {
  // If thumbnail is missing, use a generic placeholder colored box or nothing
  const thumbStyle = thumbnail 
    ? { backgroundImage: `url(${thumbnail})` }
    : { backgroundColor: 'var(--navy)' };

  return (
    <div className="song-card" onClick={onClick}>
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="song-card__thumbnail" />
      ) : (
        <div className="song-card__thumbnail" style={thumbStyle} />
      )}
      
      <div className="song-card__info">
        <div className="song-card__title" title={title}>{title}</div>
        <div className="song-card__artist">
          {artist} {year ? `• ${year}` : ''}
        </div>
        
        {languageName && languageName !== 'English' && (
          <div style={{ marginTop: '8px' }}>
            <LanguageBadge languageName={languageName} />
          </div>
        )}
      </div>
    </div>
  );
}
