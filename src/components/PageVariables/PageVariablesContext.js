import { useState, useEffect } from 'react';

/**
 * PageVariablesContext - Provides global variables for a documentation page
 *
 * Uses a module-level store to share variables across components on the same page.
 * This approach works with MDX where components are siblings rather than parent-child.
 */

// Module-level store for page variables
let pageVariablesStore = {};
let listeners = [];

/**
 * Subscribe to changes in page variables
 */
const subscribe = (listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

/**
 * Notify all listeners of changes
 */
const notifyListeners = () => {
  listeners.forEach(listener => listener(pageVariablesStore));
};

/**
 * Get current page variables
 */
export const getPageVariables = () => {
  return { ...pageVariablesStore };
};

/**
 * Set page variables (used by PageVariables component)
 * Merges with existing variables instead of replacing them
 */
export const setPageVariables = (variables) => {
  pageVariablesStore = { ...pageVariablesStore, ...variables };
  notifyListeners();
};

/**
 * Update a single page variable
 */
export const updatePageVariable = (key, value) => {
  pageVariablesStore = { ...pageVariablesStore, [key]: value };
  notifyListeners();
};

/**
 * Clear page variables (useful for cleanup)
 */
export const clearPageVariables = () => {
  pageVariablesStore = {};
  listeners = [];
};

/**
 * Custom hook to access page variables with reactivity
 */
export const usePageVariables = () => {
  const [variables, setVariables] = useState(getPageVariables());

  useEffect(() => {
    const unsubscribe = subscribe((newVariables) => {
      setVariables({ ...newVariables });
    });

    return unsubscribe;
  }, []);

  return variables;
};

export default { getPageVariables, setPageVariables, updatePageVariable, usePageVariables };
