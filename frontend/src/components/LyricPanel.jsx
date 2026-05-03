// Component: LyricPanel
// Purpose: Dual-column view for original and translated lyrics
// Props: lyrics (Array), translatedLines (Object), annotations (Object), songMeta (Object), translating (boolean)

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import LanguageBadge from './LanguageBadge';
import LineAnnotation from './LineAnnotation';

function LyricLine({ originalLine, translatedLine, annotation }) {
  const [expanded, setExpanded] = useState(false);

  // If there's no text, just render a break
  if (!originalLine.trim()) {
    return <div style={{ height: '1.9em' }} />;
  }

  return (
    <div style={{ marginBottom: expanded ? 0 : '4px' }}>
      <div className="lyric-line-container">
        <div className="lyric-line-text">
          {originalLine}
          {translatedLine && (
            <div style={{ color: 'var(--text-muted)' }}>
              {translatedLine}
            </div>
          )}
        </div>
        
        {annotation && (
          <div 
            className="lyric-line-icon" 
            onClick={() => setExpanded(!expanded)}
            title="View cultural note"
          >
            <Info size={16} />
          </div>
        )}
      </div>
      
      <LineAnnotation note={annotation} isExpanded={expanded} />
    </div>
  );
}

export default function LyricPanel({ lyrics, translatedLines, annotations, songMeta, translating }) {
  const [mobileView, setMobileView] = useState('original'); // 'original' or 'translated'
  
  if (!lyrics || !songMeta) return null;
  
  const isEnglish = songMeta.language === 'en';

  return (
    <div>
      <div className="lyric-header">
        <h1>{songMeta.title}</h1>
        <div className="artist">{songMeta.artist} {songMeta.release_year ? `• ${songMeta.release_year}` : ''}</div>
        {!isEnglish && songMeta.languageName && (
          <LanguageBadge languageName={songMeta.languageName} />
        )}
      </div>

      {!isEnglish && (
        <div className="mobile-toggle">
          <button 
            className={mobileView === 'original' ? 'active' : ''} 
            onClick={() => setMobileView('original')}
          >
            Original
          </button>
          <button 
            className={mobileView === 'translated' ? 'active' : ''} 
            onClick={() => setMobileView('translated')}
          >
            English
          </button>
        </div>
      )}

      {translating && (
        <div style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: 24 }}>
          Translating...
        </div>
      )}

      <div className={!isEnglish ? "lyrics-grid" : ""}>
        {/* Original Column (or single column if English) */}
        <div style={{ display: !isEnglish && mobileView !== 'original' ? 'none' : 'block' }}>
          {!isEnglish && <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Original ({songMeta.languageName || 'Unknown'})</h3>}
          
          {lyrics.map((section, sIdx) => (
            <div key={`orig-${sIdx}`} style={{ marginBottom: 32 }}>
              <div className="lyric-section-header">[{section.section}]</div>
              
              {section.lines.map((line, lIdx) => {
                const key = `${sIdx}-${lIdx}`;
                const annotation = annotations[key];
                
                return (
                  <LyricLine 
                    key={`orig-line-${sIdx}-${lIdx}`}
                    originalLine={line}
                    annotation={annotation}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Translated Column */}
        {!isEnglish && (
          <div style={{ display: mobileView !== 'translated' ? 'none' : 'block' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>English</h3>
            
            {lyrics.map((section, sIdx) => (
              <div key={`trans-${sIdx}`} style={{ marginBottom: 32 }}>
                <div className="lyric-section-header">[{section.section}]</div>
                
                {section.lines.map((line, lIdx) => {
                  const key = `${sIdx}-${lIdx}`;
                  const translatedLine = translatedLines[key] || "";
                  const annotation = annotations[key];
                  
                  return (
                    <LyricLine 
                      key={`trans-line-${sIdx}-${lIdx}`}
                      originalLine={translatedLine || (translating ? '...' : '')}
                      annotation={annotation}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Reset style overrides for desktop via media query logic implicitly handled by CSS, 
          but we actually need CSS to force display block on desktop for grid layout.
          We will use a class to hide on mobile conditionally if needed, but inline styles above work
          if we combine it with standard CSS. Let's fix the mobile view logic simply: 
          On desktop we want both visible regardless of mobileView state. 
          To do this cleanly in inline styles without complex JS window checks: */}
      <style>{`
        @media (min-width: 768px) {
          .lyrics-grid > div {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
