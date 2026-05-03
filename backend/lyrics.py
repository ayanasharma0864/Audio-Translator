import os
import re
from lyricsgenius import Genius

# Initialize Genius client
# We get the token from the environment variable loaded in app.py
def get_genius_client():
    """Returns an authenticated Genius API client."""
    token = os.environ.get("GENIUS_TOKEN")
    if not token:
        print("Warning: GENIUS_TOKEN not found in environment")
        return None
    # Use a timeout to prevent hanging
    return Genius(token, timeout=10)

def search_songs(query):
    """
    Searches Genius for songs matching the query.
    Returns a list of dictionaries with song details.
    """
    genius = get_genius_client()
    if not genius:
        raise Exception("Genius API token is missing.")
        
    # Search for the query
    search_results = genius.search_songs(query)
    
    hits = search_results.get('hits', [])
    formatted_results = []
    
    # We only take the top 6 results
    for hit in hits[:6]:
        item = hit.get('result', {})
        
        # Extract release year safely
        release_date = item.get('release_date_components') or {}
        year = release_date.get('year')
        
        formatted_results.append({
            "id": item.get('id'),
            "title": item.get('title'),
            "artist": item.get('primary_artist', {}).get('name'),
            "thumbnail_url": item.get('song_art_image_thumbnail_url'),
            "release_year": year
        })
        
    return formatted_results

def clean_lyrics_text(raw_lyrics):
    """
    Cleans raw lyrics from Genius and structures them into sections and lines.
    Removes the "Embed" text at the very end.
    Returns: [{'section': 'Verse 1', 'lines': ['line 1', 'line 2']}, ...]
    """
    # Remove the first line which is usually "Song Title Lyrics"
    lines = raw_lyrics.split('\n')
    if lines and 'Lyrics' in lines[0]:
        lines = lines[1:]
        
    # Clean up the very last line which usually ends with "Embed" or "123Embed"
    if lines:
        last_line = lines[-1]
        # Regex to remove optional numbers followed by "Embed" at the end of the string
        last_line = re.sub(r'\d*Embed$', '', last_line)
        lines[-1] = last_line
        
    structured_lyrics = []
    current_section = "Intro"
    current_lines = []
    
    for line in lines:
        line = line.strip()
        
        if not line:
            # Skip empty lines
            continue
            
        # Check if the line is a section header like [Verse 1]
        if line.startswith('[') and line.endswith(']'):
            # If we already have lines for a previous section, save them
            if current_lines:
                structured_lyrics.append({
                    "section": current_section,
                    "lines": current_lines
                })
                current_lines = []
            
            # Remove brackets for the new section name
            current_section = line[1:-1]
        else:
            # Add line to current section
            current_lines.append(line)
            
    # Add the last section if it has lines
    if current_lines:
        structured_lyrics.append({
            "section": current_section,
            "lines": current_lines
        })
        
    return structured_lyrics

def get_lyrics(song_id):
    """
    Fetches the full lyrics for a song by ID and cleans them.
    Returns a dictionary with the structured lyrics.
    """
    genius = get_genius_client()
    if not genius:
        raise Exception("Genius API token is missing.")
        
    song = genius.song(song_id)
    song_info = song.get('song', {})
    
    # We need to fetch the actual lyrics using the genius.lyrics method
    # song_id must be passed correctly
    song_obj = genius.search_song(song_info.get('title'), song_info.get('primary_artist', {}).get('name'))
    
    if not song_obj:
        raise Exception("Lyrics not found for this song.")
        
    raw_lyrics = song_obj.lyrics
    
    structured_lyrics = clean_lyrics_text(raw_lyrics)
    
    return {
        "title": song_info.get('title'),
        "artist": song_info.get('primary_artist', {}).get('name'),
        "genius_url": song_info.get('url'),
        "lyrics_raw": structured_lyrics
    }
