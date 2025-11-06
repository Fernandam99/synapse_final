import React from 'react';
import { Globe } from 'lucide-react';

// Language selector simplified: app is Spanish-only. Show a static ES indicator.
export default function LanguageSelector({ compact = false }) {
  return (
    <div style={{ position: 'relative' }}>
      <button className={`theme-toggle-btn ${compact ? 'compact' : ''}`} aria-label="Idioma: Español">
        <Globe size={18} />
        <span style={{ marginLeft: 6, fontSize: 13 }}>ES</span>
      </button>
      <style>{` 
        .theme-toggle-btn { background: transparent; border: none; color: var(--text-secondary); cursor: default; padding: 6px; border-radius: 8px; display:flex; align-items:center; gap:6px; }
        .theme-toggle-btn.compact { padding: 8px; border-radius: 50%; }
        .theme-toggle-btn.compact span { display: none; }
      `}</style>
    </div>
  );
}
