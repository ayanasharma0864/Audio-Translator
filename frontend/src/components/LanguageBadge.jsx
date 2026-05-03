// Component: LanguageBadge
// Purpose: Displays a small pill with the detected language and flag emoji
// Props: languageName (string)

import React from 'react';

// Hardcoded map of languages to flags
const FLAG_MAP = {
  "English": "🇬🇧",
  "Spanish": "🇪🇸",
  "French": "🇫🇷",
  "German": "🇩🇪",
  "Portuguese": "🇵🇹",
  "Italian": "🇮🇹",
  "Korean": "🇰🇷",
  "Japanese": "🇯🇵",
  "Hindi": "🇮🇳",
  "Arabic": "🇸🇦",
  "Turkish": "🇹🇷",
  "Russian": "🇷🇺",
  "Dutch": "🇳🇱",
  "Polish": "🇵🇱",
  "Indonesian": "🇮🇩"
};

export default function LanguageBadge({ languageName }) {
  if (!languageName) return null;
  
  const flag = FLAG_MAP[languageName] || "🌐";
  
  return (
    <div className="lang-badge">
      <span style={{ marginRight: '6px' }}>{flag}</span>
      <span>{languageName}</span>
    </div>
  );
}
