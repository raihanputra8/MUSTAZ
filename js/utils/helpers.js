/**
 * Utility functions for DOM & App
 */

export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

/**
 * Log Figma Handoff status
 */
export function logFigmaStatus() {
  console.log("%c🎨 Web Dev Structure Ready for Figma Handoff!", "color: #a855f7; font-size: 14px; font-weight: bold;");
}
