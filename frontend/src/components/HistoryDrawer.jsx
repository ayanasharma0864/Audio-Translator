// Component: HistoryDrawer
// Purpose: Slide-in panel showing previously viewed songs from localStorage
// Props: isOpen (boolean), onClose (function), onSelect (function)

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SongCard from './SongCard';
import { getHistory, clearHistory } from '../utils/storage';

export default function HistoryDrawer({ isOpen, onClose, onSelect }) {
  const [history, setHistory] = useState([]);

  // Load history when drawer opens
  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  const handleSelect = (song) => {
    onClose();
    onSelect(song);
  };

  return (
    <>
      <div 
        className={`drawer-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      
      <div className={`history-drawer ${isOpen ? 'open' : ''}`}>
        <div className="history-drawer__header">
          <h2>Archive History</h2>
          <button onClick={onClose} className="btn-icon" style={{border: 'none', padding: 4}}>
            <X size={20} />
          </button>
        </div>
        
        <div className="history-drawer__content">
          {history.length === 0 ? (
            <div style={{color: 'var(--text-muted)', textAlign: 'center', marginTop: 20}}>
              No history yet. Start searching!
            </div>
          ) : (
            history.map((song, idx) => (
              <SongCard 
                key={`${song.id}-${idx}`}
                title={song.title}
                artist={song.artist}
                thumbnail={song.thumbnail_url || song.thumbnail}
                languageName={song.languageName}
                year={song.release_year || song.year}
                onClick={() => handleSelect(song)}
              />
            ))
          )}
        </div>
        
        {history.length > 0 && (
          <div className="history-drawer__footer">
            <button className="btn-clear-history" onClick={handleClear}>
              Clear History
            </button>
          </div>
        )}
      </div>
    </>
  );
}
