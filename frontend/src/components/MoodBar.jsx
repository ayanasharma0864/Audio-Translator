// Component: MoodBar
// Purpose: Displays a visual sentiment bar based on lyrics text
// Props: scores (Object with joyful, melancholic, tense, neutral percentages)

import React from 'react';

export default function MoodBar({ scores }) {
  if (!scores) return null;

  const { joyful = 0, melancholic = 0, tense = 0, neutral = 100 } = scores;

  // Determine dominant mood
  let dominantMood = 'Neutral';
  let maxScore = neutral;

  if (joyful > maxScore) {
    maxScore = joyful;
    dominantMood = 'Joyful';
  }
  if (melancholic > maxScore) {
    maxScore = melancholic;
    dominantMood = 'Melancholic';
  }
  if (tense > maxScore) {
    maxScore = tense;
    dominantMood = 'Tense';
  }

  // Handle case where scores sum to 0 (should not happen but defensive programming)
  const total = joyful + melancholic + tense + neutral;
  const normalize = (val) => total > 0 ? (val / total) * 100 : 0;

  return (
    <div className="mood-container">
      <div className="mood-bar">
        {joyful > 0 && (
          <div 
            className="mood-segment" 
            style={{ width: `${normalize(joyful)}%`, backgroundColor: '#F39C12' }} 
            title={`Joyful: ${joyful}%`}
          />
        )}
        {melancholic > 0 && (
          <div 
            className="mood-segment" 
            style={{ width: `${normalize(melancholic)}%`, backgroundColor: '#5D6D7E' }} 
            title={`Melancholic: ${melancholic}%`}
          />
        )}
        {tense > 0 && (
          <div 
            className="mood-segment" 
            style={{ width: `${normalize(tense)}%`, backgroundColor: '#C0392B' }} 
            title={`Tense: ${tense}%`}
          />
        )}
        {neutral > 0 && (
          <div 
            className="mood-segment" 
            style={{ width: `${normalize(neutral)}%`, backgroundColor: '#BDC3C7' }} 
            title={`Neutral: ${neutral}%`}
          />
        )}
      </div>
      <div className="mood-label">
        Dominant mood: {dominantMood}
      </div>
    </div>
  );
}
