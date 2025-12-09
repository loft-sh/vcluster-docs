/**
 * Mermaid Polyfills Client Module
 *
 * Provides polyfills for browser APIs required by Mermaid 11.x that are missing
 * in older browsers (Safari 14-16, older WebKit versions).
 *
 * Required polyfills:
 * - structuredClone: Used by Mermaid for deep cloning objects (Safari <15.4)
 * - Object.hasOwn: Static method to check own properties (Safari <15.4)
 *
 * This module runs early via Docusaurus clientModules to ensure polyfills
 * are available before Mermaid initializes.
 *
 * Reference: https://github.com/mermaid-js/mermaid/issues/5523
 */

// structuredClone polyfill for Safari 14-15.3
if (typeof window !== 'undefined' && !window.structuredClone) {
  window.structuredClone = function structuredClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Object.hasOwn polyfill for Safari 14-15.3
if (typeof Object.hasOwn !== 'function') {
  Object.hasOwn = function hasOwn(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
}
