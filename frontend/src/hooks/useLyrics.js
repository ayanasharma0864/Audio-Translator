import { useState } from 'react';
import { getLyrics, detectLanguage } from '../utils/api';
import { saveToHistory } from '../utils/storage';

export function useLyrics() {
  const [lyrics, setLyrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [songMeta, setSongMeta] = useState(null);

  // Fetches lyrics for a song, detects language, and saves to history
  const fetchLyrics = async (songInfo) => {
    setLoading(true);
    setError(null);
    setLyrics(null);
    setSongMeta(null);

    try {
      // 1. Fetch raw lyrics
      const data = await getLyrics(songInfo.id);
      
      // 2. Extract first 200 chars for language detection
      // We combine lines from the first section
      let sampleText = "";
      if (data.lyrics_raw && data.lyrics_raw.length > 0) {
        for (const section of data.lyrics_raw) {
          sampleText += section.lines.join(" ") + " ";
          if (sampleText.length > 200) break;
        }
      }
      
      let langData = { code: 'en', name: 'English' };
      if (sampleText.trim().length > 0) {
        try {
          langData = await detectLanguage(sampleText.substring(0, 200));
        } catch (e) {
          console.error("Language detection failed", e);
        }
      }
      
      // 3. Update state
      setLyrics(data.lyrics_raw);
      
      const newMeta = {
        ...songInfo,
        title: data.title || songInfo.title,
        artist: data.artist || songInfo.artist,
        language: langData.code,
        languageName: langData.name,
        geniusUrl: data.genius_url
      };
      
      setSongMeta(newMeta);
      
      // 4. Save to history
      saveToHistory(newMeta);
      
    } catch (err) {
      setError(err.message || "Failed to load lyrics");
    } finally {
      setLoading(false);
    }
  };

  return { lyrics, loading, error, songMeta, fetchLyrics };
}
