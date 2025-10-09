/**
 * Config Navigation Client Module
 *
 * This module provides hydration-safe DOM manipulation for the config reference pages.
 * It uses Docusaurus lifecycle methods to ensure DOM updates happen AFTER React hydration.
 *
 * Key features:
 * - Sidebar link highlighting based on current hash
 * - Details element expansion/collapse for nested config fields
 * - Smooth scrolling to target elements
 * - State persistence across navigation
 */

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

// ============================================================================
// State Management
// ============================================================================

let isInitialized = false;
let previousHash = null;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all parent details elements for a given element
 */
const getParentDetailsElements = function(element) {
  const parents = [];
  let current = element;
  while (current && current !== document.documentElement) {
    if (current.tagName === 'DETAILS') {
      parents.push(current);
    }
    current = current.parentElement;
  }
  return parents;
};

/**
 * Open a details element and its collapsible content
 */
const openDetailsElement = function(detailsEl) {
  if (detailsEl && detailsEl.tagName === 'DETAILS' && !detailsEl.open) {
    detailsEl.open = true;
    detailsEl.setAttribute('data-collapsed', 'false');
    // Expand the collapsible content by removing inline styles
    const collapsibleContent = detailsEl.querySelector(':scope > div[style]');
    if (collapsibleContent) {
      collapsibleContent.style.display = 'block';
      collapsibleContent.style.overflow = 'visible';
      collapsibleContent.style.height = 'auto';
    }
  }
};

/**
 * Close a details element
 */
const closeDetailsElement = function(detailsEl) {
  if (detailsEl && detailsEl.tagName === 'DETAILS' && detailsEl.open) {
    detailsEl.open = false;
    detailsEl.setAttribute('data-collapsed', 'true');
  }
};

/**
 * Close all details except those in the keep-open set
 */
const closeOtherDetails = function(keepOpenSet) {
  document.querySelectorAll('details.config-field[open]').forEach(function(el) {
    if (!keepOpenSet.has(el)) {
      closeDetailsElement(el);
    }
  });
};

// ============================================================================
// Core Navigation Functions
// ============================================================================

/**
 * Highlight sidebar links based on current hash
 */
const highlightActiveOnPageLink = function() {
  if (!location.hash) {
    return;
  }

  const activeHash = location.hash.substring(1);
  const allLinks = document.querySelectorAll('a');

  // Remove active class from all links
  for (let i = 0; i < allLinks.length; i++) {
    const link = allLinks[i];
    link.classList.remove('active');

    if (link.parentElement && link.parentElement.parentElement && link.parentElement.parentElement.tagName === 'UL') {
      link.parentElement.parentElement.classList.remove('active');
    }
  }

  // Add active class to links matching current hash
  const activeLinks = document.querySelectorAll("a[href='#" + activeHash + "']");
  for (let i = 0; i < activeLinks.length; i++) {
    activeLinks[i].classList.add('active');
  }
};

/**
 * Highlight and expand details elements containing the active hash
 */
const highlightDetailsOnActiveHash = function(activeHash, doNotOpen) {
  const activeAnchors = document.querySelectorAll(".anchor[id='" + activeHash + "']");
  const detailsElements = document.querySelectorAll('details');
  const activeSectionElements = document.querySelectorAll('.active-section');

  // Remove active-section class from all elements
  for (let i = 0; i < activeSectionElements.length; i++) {
    activeSectionElements[i].classList.remove('active-section');
  }

  // Add active-section class to elements following the active anchor
  for (let i = 0; i < activeAnchors.length; i++) {
    const headline = activeAnchors[i].parentElement;
    const headlineRank = activeAnchors[i].parentElement.nodeName.substr(1);
    let el = headline;

    while (el) {
      if (el.tagName !== 'BR' && el.tagName !== 'HR') {
        el.classList.add('active-section');
      }
      el = el.nextElementSibling;

      if (el) {
        const elRank = el.nodeName.substr(1);
        if (elRank > 0 && elRank <= headlineRank) {
          break;
        }
      }
    }
  }

  // Remove active class from all details
  for (let i = 0; i < detailsElements.length; i++) {
    detailsElements[i].classList.remove('active');
  }

  // Add active class and open parent details
  if (activeAnchors.length > 0) {
    for (let i = 0; i < activeAnchors.length; i++) {
      let element = activeAnchors[i];

      for (; element && element !== document; element = element.parentElement) {
        if (element.tagName === 'DETAILS') {
          element.classList.add('active');

          if (!doNotOpen) {
            element.open = true;
            element.setAttribute('data-collapsed', 'false');
            const collapsibleContent = element.querySelector(':scope > div[style]');
            if (collapsibleContent) {
              collapsibleContent.style.display = 'block';
              collapsibleContent.style.overflow = 'visible';
              collapsibleContent.style.height = 'auto';
            }
          }
        }
      }
    }
  }

  // Handle elements with matching IDs (for nested config fields)
  const targetElement = activeHash ? document.getElementById(activeHash) : null;
  if (targetElement) {
    const parentDetails = getParentDetailsElements(targetElement);
    const keepOpenSet = new Set(parentDetails);

    // Close all other details if not in doNotOpen mode
    if (!doNotOpen) {
      closeOtherDetails(keepOpenSet);
    }

    // Process parent details
    for (let i = 0; i < parentDetails.length; i++) {
      const element = parentDetails[i];
      element.classList.add('active');
      if (!doNotOpen) {
        element.open = true;
        element.setAttribute('data-collapsed', 'false');
        const collapsibleContent = element.querySelector(':scope > div[style]');
        if (collapsibleContent) {
          collapsibleContent.style.display = 'block';
          collapsibleContent.style.overflow = 'visible';
          collapsibleContent.style.height = 'auto';
        }
      }
    }
  }
};

/**
 * Handle hash navigation - expand details and highlight links
 */
const handleHashNavigation = function(hash) {
  if (!hash) return;

  const targetId = hash.substring(1);

  // Expand parent details elements
  highlightDetailsOnActiveHash(targetId);

  // Highlight active sidebar link
  highlightActiveOnPageLink();

  // Scroll to target (with delay for animation)
  setTimeout(() => {
    const element = document.getElementById(targetId);
    if (element) {
      const yOffset = -280;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, 100);
};

/**
 * Initialize event handlers for hash links and history navigation
 */
const initializeEventHandlers = function() {
  // Set up hash link click handlers
  const hashLinkIcons = document.querySelectorAll('.hash-link-icon');
  for (let i = 0; i < hashLinkIcons.length; i++) {
    const hashLinkIcon = hashLinkIcons[i];

    // Only add event listener if not already added
    if (!hashLinkIcon.hasAttribute('data-nav-handler')) {
      hashLinkIcon.setAttribute('data-nav-handler', 'true');

      hashLinkIcon.addEventListener('mousedown', function() {
        const href = hashLinkIcon.parentElement.attributes.href.value;
        history.pushState(null, null, href);
        highlightActiveOnPageLink();
        highlightDetailsOnActiveHash(location.hash.substr(1), true);
      });
    }
  }
};

// ============================================================================
// Docusaurus Lifecycle Hooks
// ============================================================================

/**
 * Called on client-side navigation (before DOM update)
 */
export function onRouteUpdate({ location, previousLocation }) {
  // Track previous hash for comparison
  if (previousLocation) {
    previousHash = previousLocation.hash;
  }
}

/**
 * Called after route has updated and DOM is ready
 * This is where we safely manipulate DOM after React hydration
 */
export function onRouteDidUpdate({ location, previousLocation }) {
  if (!ExecutionEnvironment.canUseDOM) {
    return;
  }

  // Initialize on first load
  if (!isInitialized) {
    isInitialized = true;

    // Wait for React hydration to complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Initialize event handlers
        initializeEventHandlers();

        // Handle initial hash if present
        if (location.hash) {
          handleHashNavigation(location.hash);
        }
      });
    });

    // Set up browser back/forward navigation handler
    window.addEventListener('popstate', function() {
      handleHashNavigation(location.hash);
    });

    // Set up hashchange handler (triggered by internal navigation)
    window.addEventListener('hashchange', function() {
      highlightActiveOnPageLink();
      handleHashNavigation(location.hash);
    });

    return;
  }

  // Handle hash changes on subsequent navigations
  if (location.hash !== previousHash) {
    handleHashNavigation(location.hash);
    previousHash = location.hash;
  }

  // Re-initialize event handlers for newly rendered elements
  initializeEventHandlers();
}
