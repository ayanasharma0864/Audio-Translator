import os
import google.generativeai as genai

# Cache to store previously generated annotations to avoid repeated API calls
# Key format: f"{song_title}_{artist}_{language}_{original_line}"
ANNOTATION_CACHE = {}

def get_gemini_model():
    """Initializes and returns the Gemini model."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found in environment")
        return None
        
    genai.configure(api_key=api_key)
    # Use gemini-1.5-flash as it is fast and suitable for this task
    model = genai.GenerativeModel('gemini-1.5-flash')
    return model

def annotate_line(original, translated, language, artist, song_title):
    """
    Asks Gemini to provide a cultural annotation for a translated lyric line.
    Returns the string note or 'NONE' if no note is needed.
    """
    # Check cache first
    cache_key = f"{song_title}_{artist}_{language}_{original}"
    if cache_key in ANNOTATION_CACHE:
        return ANNOTATION_CACHE[cache_key]
        
    model = get_gemini_model()
    if not model:
        return "NONE"
        
    prompt = f"""You are a music cultural scholar. Given this lyric line originally in {language}:
Original: '{original}'
English translation: '{translated}'
From the song '{song_title}' by {artist}.
In 1-2 sentences, explain any cultural reference, idiom, wordplay, or emotional
nuance that an English speaker might miss. If the line is straightforward, respond
with exactly: 'NONE'. Be conversational, not academic."""

    try:
        response = model.generate_content(prompt)
        note = response.text.strip()
        
        # Save to cache
        ANNOTATION_CACHE[cache_key] = note
        return note
    except Exception as e:
        print(f"Gemini API error: {e}")
        return "NONE"
