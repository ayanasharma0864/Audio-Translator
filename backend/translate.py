import os
import requests
from deep_translator import GoogleTranslator
from langdetect import detect, detect_langs

def get_libretranslate_config():
    """Returns the URL and API key for LibreTranslate from env."""
    url = os.environ.get("LIBRETRANSLATE_URL", "https://libretranslate.com")
    api_key = os.environ.get("LIBRETRANSLATE_API_KEY", "")
    return url, api_key

# Mapping of language codes to full names for our frontend badge
LANG_MAP = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "pt": "Portuguese",
    "it": "Italian",
    "ko": "Korean",
    "ja": "Japanese",
    "hi": "Hindi",
    "ar": "Arabic",
    "tr": "Turkish",
    "ru": "Russian",
    "nl": "Dutch",
    "pl": "Polish",
    "id": "Indonesian"
}

def detect_language(text):
    """
    Detects the language of the provided text.
    Returns: {code: "es", name: "Spanish", confidence: 0.97}
    """
    # We will use langdetect library locally as it's reliable and fast,
    # or we can use LibreTranslate's /detect endpoint.
    # Since LibreTranslate might rate-limit, deep_translator doesn't easily expose detect.
    # We will try LibreTranslate first, then fallback to langdetect if LibreTranslate fails.
    
    url, api_key = get_libretranslate_config()
    
    # Try LibreTranslate
    try:
        data = {"q": text}
        if api_key:
            data["api_key"] = api_key
            
        response = requests.post(f"{url}/detect", data=data, timeout=5)
        if response.status_code == 200:
            results = response.json()
            if results and len(results) > 0:
                best = results[0]
                code = best.get("language")
                name = LANG_MAP.get(code, code)
                confidence = best.get("confidence", 1.0)
                return {"code": code, "name": name, "confidence": confidence}
    except Exception as e:
        print(f"LibreTranslate detect failed: {e}")
        pass
        
    # Fallback to langdetect
    try:
        langs = detect_langs(text)
        if langs:
            best = langs[0]
            code = best.lang
            name = LANG_MAP.get(code, code)
            confidence = best.prob
            return {"code": code, "name": name, "confidence": confidence}
    except Exception as e:
        print(f"Langdetect failed: {e}")
        pass
        
    # Default to English if all else fails
    return {"code": "en", "name": "English", "confidence": 1.0}

def translate_text(text, target_lang="en"):
    """
    Translates text to the target language.
    Tries LibreTranslate first, falls back to deep-translator (Google).
    """
    if not text or not text.strip():
        return ""
        
    url, api_key = get_libretranslate_config()
    
    # Try LibreTranslate
    try:
        data = {
            "q": text,
            "source": "auto",
            "target": target_lang
        }
        if api_key:
            data["api_key"] = api_key
            
        response = requests.post(f"{url}/translate", data=data, timeout=5)
        if response.status_code == 200:
            result = response.json()
            translated = result.get("translatedText")
            if translated:
                return translated
    except Exception as e:
        print(f"LibreTranslate translate failed: {e}")
        pass
        
    # Fallback to deep-translator (Google Translator)
    try:
        translator = GoogleTranslator(source='auto', target=target_lang)
        translated = translator.translate(text)
        return translated
    except Exception as e:
        print(f"Deep-translator failed: {e}")
        # If all fail, return the original text
        return text
