import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import logic modules
import lyrics
import translate
import ai_notes

app = Flask(__name__)
# Enable CORS for the React frontend
CORS(app)

# ── Rate Limiting ────────────────────────
# Simple in-memory rate limiter to prevent API abuse
# Stores IPs and their last request timestamp
RATE_LIMIT_DICT = {}
RATE_LIMIT_SECONDS = 0.5  # Max 2 requests per second per IP

def check_rate_limit():
    """
    Checks if the current request's IP is hitting the API too fast.
    Returns an error response if rate limit is exceeded, otherwise None.
    """
    client_ip = request.remote_addr
    current_time = time.time()
    
    if client_ip in RATE_LIMIT_DICT:
        time_since_last_req = current_time - RATE_LIMIT_DICT[client_ip]
        if time_since_last_req < RATE_LIMIT_SECONDS:
            return jsonify({"error": "Rate limit exceeded. Please wait."}), 429
            
    RATE_LIMIT_DICT[client_ip] = current_time
    return None

@app.before_request
def before_request():
    """Runs before every request to enforce rate limits."""
    return check_rate_limit()

# ── API Routes ─────────────────────────

@app.route('/api/search', methods=['GET'])
def search_route():
    """
    Search for songs via Genius API.
    Params: ?q=<query>
    Returns: JSON list of song matches [{id, title, artist, thumbnail_url, release_year}]
    """
    query = request.args.get('q', '')
    if not query:
        return jsonify({"error": "Missing query parameter"}), 400
        
    try:
        results = lyrics.search_songs(query)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lyrics', methods=['GET'])
def lyrics_route():
    """
    Fetch and clean lyrics for a specific song ID.
    Params: ?song_id=<id>
    Returns: JSON object {title, artist, lyrics_raw: [{section, lines: []}, ...], genius_url}
    """
    song_id = request.args.get('song_id')
    if not song_id:
        return jsonify({"error": "Missing song_id parameter"}), 400
        
    try:
        data = lyrics.get_lyrics(int(song_id))
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/translate', methods=['POST'])
def translate_route():
    """
    Translate text line by line.
    Body JSON: {text: "string", target_lang: "en"}
    Returns: JSON object {translated_text: "string"}
    """
    data = request.json or {}
    text = data.get('text', '')
    target_lang = data.get('target_lang', 'en')
    
    if not text:
        return jsonify({"error": "Missing text in body"}), 400
        
    try:
        # We translate one line at a time to keep it simple, but this route translates whatever text is given
        # The frontend will send line by line.
        translated = translate.translate_text(text, target_lang=target_lang)
        return jsonify({"translated_text": translated})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/detect', methods=['POST'])
def detect_route():
    """
    Detect language of the given text.
    Body JSON: {text: "string"}
    Returns: JSON object {language_code: "es", language_name: "Spanish", confidence: 0.9}
    """
    data = request.json or {}
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "Missing text in body"}), 400
        
    try:
        result = translate.detect_language(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/annotate', methods=['POST'])
def annotate_route():
    """
    Fetch cultural annotation for a translated lyric line.
    Body JSON: {original_line, translated_line, language, artist, song_title}
    Returns: JSON object {note: "Annotation text" | null}
    """
    data = request.json or {}
    original = data.get('original_line')
    translated = data.get('translated_line')
    language = data.get('language')
    artist = data.get('artist', 'Unknown')
    song_title = data.get('song_title', 'Unknown')
    
    if not all([original, translated, language]):
        return jsonify({"error": "Missing required fields (original_line, translated_line, language)"}), 400
        
    try:
        note = ai_notes.annotate_line(original, translated, language, artist, song_title)
        # If the note is NONE, return null
        if note and note.strip().upper() == 'NONE':
            return jsonify({"note": None})
            
        return jsonify({"note": note})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run server on port 5001
    app.run(debug=True, port=5001)
