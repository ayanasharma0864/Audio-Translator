// Component: LineAnnotation
// Purpose: Accordion-style expand below a lyric line to show Gemini cultural note
// Props: note (string), isExpanded (boolean)

import React from 'react';

export default function LineAnnotation({ note, isExpanded }) {
  if (!note) return null;
  
  return (
    <div className={`line-annotation ${isExpanded ? 'expanded' : ''}`}>
      <div className="line-annotation__label">Cultural Note</div>
      <div className="line-annotation__text">{note}</div>
    </div>
  );
}
