import { C } from '@/theme';

const STYLE_ID = 'court-ready-web-polish';

// A web page lets you select any text, shows a "copy / look up" bubble when you hold a finger on
// something, and zooms on a double tap. An app does none of that, so buttons, rows and chips must
// not either. Text fields keep normal selection, so typing, pasting and correcting still work.
const CSS = `
html, body { background-color: ${C.bg}; overscroll-behavior: none; }
html { touch-action: manipulation; }
body {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
input, textarea, [contenteditable="true"] {
  -webkit-user-select: text;
  user-select: text;
}
`;

/** Makes the web build behave like an app under your thumb. Call once at startup. */
export function applyWebPolish(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
