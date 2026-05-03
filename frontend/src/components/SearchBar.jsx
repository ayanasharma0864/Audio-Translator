// Component: SearchBar
// Purpose: Song search input with debounce and results dropdown
// Props: onSelect (function)

import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { searchSongs } from '../utils/api';

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        setIsOpen(true);
        try {
          const data = await searchSongs(query);
          setResults(data);
          setActiveIndex(-1);
        } catch (e) {
          console.error("Search failed", e);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (song) => {
    setIsOpen(false);
    setQuery('');
    onSelect(song);
  };

  return (
    <div className="search-container" ref={dropdownRef}>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder="Search for a song or artist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim().length > 2) setIsOpen(true); }}
        />
      </div>

      {isOpen && (
        <div className="search-dropdown">
          {loading ? (
            <div className="search-status">Searching the archives...</div>
          ) : results.length > 0 ? (
            results.map((song, idx) => (
              <div 
                key={song.id} 
                className={`search-dropdown-item ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => handleSelect(song)}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                {song.thumbnail_url ? (
                  <img src={song.thumbnail_url} alt="" style={{width: 40, height: 40, borderRadius: 4, marginRight: 12, objectFit: 'cover'}} />
                ) : (
                  <div style={{width: 40, height: 40, borderRadius: 4, marginRight: 12, backgroundColor: 'var(--border)'}} />
                )}
                <div>
                  <div style={{fontWeight: 'bold', fontFamily: 'var(--font-heading)'}}>{song.title}</div>
                  <div style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>{song.artist}</div>
                </div>
              </div>
            ))
          ) : query.trim().length > 2 ? (
            <div className="search-status">No results found.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
