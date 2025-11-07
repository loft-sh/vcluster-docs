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

let isInitialized = false;
let previousHash = null;

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

const openDetailsElement = function(detailsEl) {
  if (detailsEl && detailsEl.tagName === 'DETAILS' && !detailsEl.open) {
    detailsEl.open = true;
    detailsEl.setAttribute('data-collapsed', 'false');
    // Expand collapsible content by removing inline styles
    const collapsibleContent = detailsEl.querySelector(':scope > div[style]');
    if (collapsibleContent) {
      collapsibleContent.style.display = 'block';
      collapsibleContent.style.overflow = 'visible';
      collapsibleContent.style.height = 'auto';
    }
  }
};

const closeDetailsElement = function(detailsEl) {
  if (detailsEl && detailsEl.tagName === 'DETAILS' && detailsEl.open) {
    detailsEl.open = false;
    detailsEl.setAttribute('data-collapsed', 'true');
  }
};

const closeOtherDetails = function(keepOpenSet) {
  document.querySelectorAll('details.config-field[open]').forEach(function(el) {
    if (!keepOpenSet.has(el)) {
      closeDetailsElement(el);
    }
  });
};

const highlightActiveOnPageLink = function(hash) {
  // Use the passed hash parameter, not location.hash (which doesn't update with pushState)
  if (!hash) {
    return;
  }

  const activeHash = hash.substring(1);

  const updateTOC = () => {
    // Remove active class from all TOC links
    const allLinks = document.querySelectorAll('.table-of-contents a');
    for (let i = 0; i < allLinks.length; i++) {
      allLinks[i].classList.remove('table-of-contents__link--active');
    }

    // Add active class to matching TOC links
    const activeLinks = document.querySelectorAll(".table-of-contents a[href='#" + activeHash + "']");
    for (let i = 0; i < activeLinks.length; i++) {
      activeLinks[i].classList.add('table-of-contents__link--active');
    }
  };

  // Update immediately
  updateTOC();

  // Keep updating after scroll ends to override Docusaurus IntersectionObserver
  let scrollEndTimer;
  const handleScrollEnd = () => {
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => {
      updateTOC();
      window.removeEventListener('scroll', handleScrollEnd);
    }, 50);
  };

  window.addEventListener('scroll', handleScrollEnd);
  handleScrollEnd();
};

const highlightDetailsOnActiveHash = function(activeHash, doNotOpen) {
  // NOTE: This function ONLY manages details expansion, NOT highlighting
  // Highlighting is managed by DetailsClicksClient to avoid race conditions

  // Find the target element and handle its details
  const targetElement = activeHash ? document.getElementById(activeHash) : null;
  if (targetElement) {
    const parentDetails = getParentDetailsElements(targetElement);
    const keepOpenSet = new Set(parentDetails);

    // Close other unrelated details
    if (!doNotOpen) {
      closeOtherDetails(keepOpenSet);
    }

    // Open parent details - NO highlighting here!
    for (let i = 0; i < parentDetails.length; i++) {
      const element = parentDetails[i];

      // Open all parent details
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

// NOTE: This does NOT scroll - scrolling is handled by DetailsClicksClient
const handleHashNavigation = function(hash) {
  if (!hash) return;

  const targetId = hash.substring(1);
  highlightDetailsOnActiveHash(targetId);
  highlightActiveOnPageLink(hash);
};

// Hash link clicks are handled by DetailsClicksClient to avoid race conditions
const initializeEventHandlers = function() {
  // Empty - event handlers managed by DetailsClicksClient
};

/**
 * Docusaurus lifecycle hook - called before DOM update
 */
export function onRouteUpdate({ location, previousLocation }) {
  if (previousLocation) {
    previousHash = previousLocation.hash;
  }
}

/**
 * Docusaurus lifecycle hook - called after route updates and DOM is ready
 * Safely manipulates DOM after React hydration
 */
export function onRouteDidUpdate({ location, previousLocation }) {
  if (!ExecutionEnvironment.canUseDOM) {
    return;
  }

  if (!isInitialized) {
    isInitialized = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initializeEventHandlers();

        if (location.hash) {
          const targetId = location.hash.substring(1);
          const targetEl = document.getElementById(targetId);

          handleHashNavigation(location.hash);

          if (targetEl) {
            requestAnimationFrame(() => {
              const y = targetEl.getBoundingClientRect().top + window.scrollY - 100;
              window.scrollTo({ top: y, behavior: 'smooth' });
            });
          }
        }
      });
    });

    // For popstate, we DO want to scroll since DetailsClicksClient isn't involved
    window.addEventListener('popstate', function() {
      const hash = location.hash;
      if (!hash) return;

      const targetId = hash.substring(1);
      const targetEl = document.getElementById(targetId);

      handleHashNavigation(hash);

      if (targetEl) {
        requestAnimationFrame(() => {
          const y = targetEl.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        });
      }
    });

    // NOTE: hashchange only handles highlighting, NOT scrolling (to avoid race condition)
    // Scrolling is handled by DetailsClicksClient's universal click handler
    window.addEventListener('hashchange', function(e) {
      // Extract hash from newURL to handle pushState correctly
      const newHash = e.newURL ? e.newURL.split('#')[1] : '';
      const hashToUse = newHash ? '#' + newHash : '';

      if (!hashToUse) {
        return;
      }

      const targetId = hashToUse.substring(1);
      highlightActiveOnPageLink(hashToUse);
      highlightDetailsOnActiveHash(targetId);
    });

    return;
  }

  // Hash changes on subsequent navigations are handled by:
  // - hashchange listener (for browser back/forward, URL bar edits)
  // - DetailsClicksClient click handler (for link clicks)
  previousHash = location.hash;
  initializeEventHandlers();
}
