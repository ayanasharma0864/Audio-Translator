import { useState, useCallback } from 'react';
import { translateText, annotateLines } from '../utils/api';

export function useTranslation() {
  const [translatedLines, setTranslatedLines] = useState({}); // Keyed by sectionIndex-lineIndex
  const [annotations, setAnnotations] = useState({}); // Keyed by sectionIndex-lineIndex
  const [translating, setTranslating] = useState(false);
  const [annotating, setAnnotating] = useState(false);

  // Translate lyrics line by line sequentially
  const translateLyrics = useCallback(async (lyricsArray, sourceLang) => {
    if (!lyricsArray || lyricsArray.length === 0 || sourceLang === 'en') {
      return;
    }

    setTranslating(true);
    setTranslatedLines({});
    
    // We process sequentially so we don't spam the API and get rate limited
    for (let sIdx = 0; sIdx < lyricsArray.length; sIdx++) {
      const section = lyricsArray[sIdx];
      for (let lIdx = 0; lIdx < section.lines.length; lIdx++) {
        const line = section.lines[lIdx];
        if (!line.trim()) continue;
        
        try {
          const translated = await translateText(line, sourceLang);
          const key = `${sIdx}-${lIdx}`;
          setTranslatedLines(prev => ({
            ...prev,
            [key]: translated
          }));
        } catch (e) {
          console.error("Translation error on line", e);
          // Put the original as fallback or leave blank
        }
      }
    }
    
    setTranslating(false);
  }, []);

  // Fetch cultural annotations
  const fetchAnnotations = useCallback(async (lyricsArray, translatedLinesObj, songMeta) => {
    if (!lyricsArray || !songMeta || songMeta.language === 'en') {
      return;
    }

    setAnnotating(true);
    setAnnotations({});

    for (let sIdx = 0; sIdx < lyricsArray.length; sIdx++) {
      const section = lyricsArray[sIdx];
      for (let lIdx = 0; lIdx < section.lines.length; lIdx++) {
        const line = section.lines[lIdx];
        if (!line.trim() || line.length < 10) continue; // Skip very short lines
        
        const key = `${sIdx}-${lIdx}`;
        const translatedLine = translatedLinesObj[key];
        
        if (!translatedLine) continue;
        
        try {
          const note = await annotateLines(
            line,
            translatedLine,
            songMeta.languageName || songMeta.language,
            songMeta.artist,
            songMeta.title
          );
          
          if (note) {
            setAnnotations(prev => ({
              ...prev,
              [key]: note
            }));
          }
        } catch (e) {
          console.error("Annotation error on line", e);
        }
      }
    }
    
    setAnnotating(false);
  }, []);

  // Reset state
  const resetTranslation = useCallback(() => {
    setTranslatedLines({});
    setAnnotations({});
    setTranslating(false);
    setAnnotating(false);
  }, []);

  return { 
    translatedLines, 
    annotations, 
    translating, 
    annotating, 
    translateLyrics, 
    fetchAnnotations,
    resetTranslation
  };
}
