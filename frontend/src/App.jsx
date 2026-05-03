// Component: App
// Purpose: Root component managing views and overall layout
// Props: none

import React, { useState, useEffect } from 'react';
import { History, Disc } from 'lucide-react';
import SearchBar from './components/SearchBar';
import LyricPanel from './components/LyricPanel';
import HistoryDrawer from './components/HistoryDrawer';
import SongCard from './components/SongCard';
import MoodBar from './components/MoodBar';
import { useLyrics } from './hooks/useLyrics';
import { useTranslation } from './hooks/useTranslation';
import { scoreLyrics } from './utils/sentiment';
import { getHistory } from './utils/storage';

export default function App() {
  const [view, setView] = useState('home'); // 'home', 'lyrics'
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [moodScores, setMoodScores] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);

  const { lyrics, loading: lyricsLoading, error: lyricsError, songMeta, fetchLyrics } = useLyrics();
  const { 
    translatedLines, 
    annotations, 
    translating, 
    annotating, 
    translateLyrics, 
    fetchAnnotations,
    resetTranslation
  } = useTranslation();

  // Load recent history for home screen
  useEffect(() => {
    if (view === 'home') {
      setRecentHistory(getHistory().slice(0, 4));
    }
  }, [view, historyDrawerOpen]);

  // Handle song selection
  const handleSelectSong = async (songInfo) => {
    setView('lyrics');
    resetTranslation();
    setMoodScores(null);
    await fetchLyrics(songInfo);
  };

  // When lyrics and meta are loaded, start translation if needed
  useEffect(() => {
    if (lyrics && songMeta) {
      if (songMeta.language !== 'en') {
        translateLyrics(lyrics, songMeta.language);
      } else {
        // If English, compute mood immediately
        const lines = [];
        lyrics.forEach(sec => lines.push(...sec.lines));
        setMoodScores(scoreLyrics(lines));
      }
    }
  }, [lyrics, songMeta, translateLyrics]);

  // When translation finishes, compute mood and fetch annotations
  useEffect(() => {
    if (lyrics && songMeta && songMeta.language !== 'en' && !translating && Object.keys(translatedLines).length > 0) {
      // Compute mood from translated lines
      const tLines = Object.values(translatedLines);
      setMoodScores(scoreLyrics(tLines));
      
      // Fetch annotations
      fetchAnnotations(lyrics, translatedLines, songMeta);
    }
  }, [translating, lyrics, songMeta, translatedLines, fetchAnnotations]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div 
          className="flex-row items-center gap-4" 
          style={{ cursor: 'pointer' }}
          onClick={() => setView('home')}
        >
          <div style={{ color: 'var(--accent)' }}>
            <Disc size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', lineHeight: 1.2 }}>Audio Engineering</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Translate the world's music</div>
          </div>
        </div>
        
        <button 
          className="btn-icon" 
          onClick={() => setHistoryDrawerOpen(true)}
          title="View History"
        >
          <History size={18} />
          <span className="desktop-only">History</span>
        </button>
      </header>

      <main className="app-main">
        {view === 'home' && (
          <div className="flex-col items-center gap-8" style={{ marginTop: '8vh' }}>
            <div style={{ textAlign: 'center', maxWidth: 600 }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: 16 }}>Discover the meaning behind the music.</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                Search for any song across the globe. We'll fetch the lyrics, detect the language, translate them, and add cultural context.
              </p>
            </div>
            
            <div style={{ width: '100%' }}>
              <SearchBar onSelect={handleSelectSong} />
            </div>

            {recentHistory.length > 0 && (
              <div style={{ width: '100%', maxWidth: 800, marginTop: 40 }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: 16 }}>Recent Archive</h3>
                <div className="results-grid">
                  {recentHistory.map((song, idx) => (
                    <SongCard 
                      key={idx}
                      title={song.title}
                      artist={song.artist}
                      thumbnail={song.thumbnail_url || song.thumbnail}
                      languageName={song.languageName}
                      year={song.release_year || song.year}
                      onClick={() => handleSelectSong(song)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'lyrics' && (
          <div className="flex-col gap-6">
            <div style={{ marginBottom: 24 }}>
              <SearchBar onSelect={handleSelectSong} />
            </div>

            {lyricsLoading && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Searching the archives...
              </div>
            )}

            {lyricsError && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent)', backgroundColor: '#FDF6E3', borderRadius: 8 }}>
                <h3>Archive Error</h3>
                <p>{lyricsError}</p>
                <button className="btn-icon" style={{ margin: '16px auto 0' }} onClick={() => setView('home')}>
                  Return Home
                </button>
              </div>
            )}

            {!lyricsLoading && !lyricsError && lyrics && (
              <>
                <MoodBar scores={moodScores} />
                <LyricPanel 
                  lyrics={lyrics}
                  translatedLines={translatedLines}
                  annotations={annotations}
                  songMeta={songMeta}
                  translating={translating}
                />
              </>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        Built with curiosity
      </footer>

      <HistoryDrawer 
        isOpen={historyDrawerOpen} 
        onClose={() => setHistoryDrawerOpen(false)} 
        onSelect={handleSelectSong}
      />
    </div>
  );
}
