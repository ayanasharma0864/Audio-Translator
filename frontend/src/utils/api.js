// Utilities for making API calls to the Flask backend
const BASE_URL = 'http://localhost:5001';

// Helper to fetch with timeout
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 60000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);
  
  return response;
}

// Search for songs based on a query
// params: query (string)
// returns: Array of song objects
export async function searchSongs(query) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to search songs');
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  }
}

// Get raw lyrics for a specific song ID
// params: songId (number/string)
// returns: Object with title, artist, lyrics_raw array
export async function getLyrics(songId) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/lyrics?song_id=${songId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get lyrics');
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  }
}

// Detect the language of a text snippet
// params: text (string)
// returns: Object with code, name, confidence
export async function detectLanguage(text) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to detect language');
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  }
}

// Translate a single text string
// params: text (string), sourceLang (string - unused in backend but good for future)
// returns: translated string
export async function translateText(text, sourceLang) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_lang: 'en' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to translate');
    return data.translated_text;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  }
}

// Fetch cultural annotation for a line
// params: original (string), translated (string), lang (string), artist (string), title (string)
// returns: string note or null
export async function annotateLines(original, translated, lang, artist, title) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/annotate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        original_line: original, 
        translated_line: translated, 
        language: lang,
        artist,
        song_title: title
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to annotate');
    return data.note;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  }
}
