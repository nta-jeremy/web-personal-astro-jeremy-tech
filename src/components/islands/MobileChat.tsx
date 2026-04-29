import { useState, useCallback } from 'react';
import ChatInterface from './ChatInterface';

export interface Props {
  placeholder?: string;
  locale?: 'en' | 'vi';
}

export default function MobileChat({
  placeholder = "Ask about Jeremy's work…",
  locale = 'en',
}: Props) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  if (open) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-[var(--bg)]">
        <ChatInterface
          placeholder={placeholder}
          locale={locale}
          fullScreen={true}
          onClose={handleClose}
        />
      </div>
    );
  }

  return (
    <div className="mchatbar" onClick={handleOpen} role="button" aria-label="Open chat">
      <div style={{ color: 'var(--subtle)', display: 'flex' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
          <circle cx="11" cy="11" r="6"/>
          <path d="M20 20l-4.5-4.5"/>
        </svg>
      </div>
      <span className="mchatbar-input" style={{ color: 'var(--subtle)' }}>
        {placeholder}
      </span>
      <button className="mchatbar-send" aria-label="Open chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </button>
    </div>
  );
}
