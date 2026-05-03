# 🎶 Audio Translator

*Bridge the gap between languages and emotions in music.*

Have you ever listened to a song in a foreign language and felt the emotion, but wished you could understand the deeper meaning? **Audio Translator** is a web application designed to do just that. It's not just a translator; it's your cultural guide to global music.

By fetching lyrics, detecting the language, and providing line-by-line translations alongside AI-powered cultural context, Audio Translator helps you truly feel and understand the world's music.

## ✨ Why Audio Translator?

- **Direct Translations Aren't Enough:** Languages are full of idioms, wordplay, and cultural references. A direct translation often misses the soul of the lyrics. Our AI adds the missing pieces.
- **Real-time Understanding:** See the original lyrics side-by-side with the English translation.
- **Feel the Mood:** We analyze the lyrics to give you a visual "Mood Bar," helping you grasp the song's emotional landscape (joyful, melancholic, tense, or neutral).

## 🚀 How It Works

1. **Search:** Simply type in a song name or artist. We search the vast Genius database for you.
2. **Fetch & Detect:** Pick your song! We fetch the original lyrics and automatically detect the language.
3. **Translate:** If the song isn't in English, we translate it line-by-line, right before your eyes.
4. **Cultural Notes:** Our AI (Google Gemini) reads between the lines, adding helpful notes to explain cultural references or idioms that might be confusing.
5. **Vibe Check:** Check out the Mood Bar to see the emotional breakdown of the song!

## 📂 What's Inside?

The project is split into two main parts:

- **`backend/` (Python/Flask):** The brain of the operation. It connects to the Genius API for lyrics, handles language translation, and talks to Google Gemini to get those insightful cultural notes.
- **`frontend/` (React):** The face of the app. It's built with React and features a warm, paper-like design that makes reading lyrics a beautiful experience.

## 🛠️ Let's Get Started!

Ready to run it yourself? It's pretty straightforward.

### 1. Grab Your Keys 🔑
You'll need two API keys to unlock all features:
- **Genius API Token:** Head over to [Genius API Clients](https://genius.com/api-clients) and generate a Client Access Token.
- **Gemini API Key:** Grab a free API key from [Google AI Studio](https://aistudio.google.com/) for the `gemini-1.5-flash` model.

### 2. Boot Up the Backend ⚙️
1. Open your terminal and jump into the backend folder: `cd backend`
2. We need a place for those keys. Create a file named `.env` based on `.env.example`:
   ```env
   GENIUS_TOKEN=your_genius_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   LIBRETRANSLATE_URL=https://libretranslate.com
   ```
3. Set up a virtual environment (it's good practice!): `python3 -m venv venv`
4. Activate it:
   - Mac/Linux: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate`
5. Install the required Python packages: `pip install -r requirements.txt`
6. Start the server! Run `python app.py`. It should be purring quietly on `http://localhost:5000`.

### 3. Spin Up the Frontend 💻
1. Open a new terminal window and hop into the frontend folder: `cd frontend`
2. Install the necessary Node packages: `npm install`
3. Launch the development server: `npm run dev`
4. Your terminal will give you a link (usually `http://localhost:5173`). Click it and start exploring music!

---
*Built with ❤️ for music lovers everywhere.*
