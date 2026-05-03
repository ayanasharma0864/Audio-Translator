// Utilities for interacting with localStorage
const HISTORY_KEY = 'ae_history';
const MAX_HISTORY_ITEMS = 10;

// Get history array from local storage
// returns: Array of song objects
export function getHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse history", e);
    return [];
  }
}

// Save a song to history
// params: songMeta (Object with id, title, artist, thumbnail, language, year)
export function saveToHistory(songMeta) {
  if (!songMeta || !songMeta.id) return;

  const history = getHistory();
  
  // Remove existing entry if it exists to avoid duplicates
  const filteredHistory = history.filter(item => item.id !== songMeta.id);
  
  // Prepend new entry
  filteredHistory.unshift(songMeta);
  
  // Keep max items
  const newHistory = filteredHistory.slice(0, MAX_HISTORY_ITEMS);
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (e) {
    console.error("Failed to save history", e);
  }
}

// Clear all history
export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
