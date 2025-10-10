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
  const hashToUse = hash || location.hash;
  if (!hashToUse) {
    return;
  }

  const activeHash = hashToUse.substring(1);
  const allLinks = document.querySelectorAll('a');

  for (let i = 0; i < allLinks.length; i++) {
    const link = allLinks[i];
    link.classList.remove('active');

    if (link.parentElement && link.parentElement.parentElement && link.parentElement.parentElement.tagName === 'UL') {
      link.parentElement.parentElement.classList.remove('active');
    }
  }

  const activeLinks = document.querySelectorAll("a[href='#" + activeHash + "']");
  for (let i = 0; i < activeLinks.length; i++) {
    activeLinks[i].classList.add('active');
  }
};

const highlightDetailsOnActiveHash = function(activeHash, doNotOpen) {
  const activeAnchors = document.querySelectorAll(".anchor[id='" + activeHash + "']");
  const detailsElements = document.querySelectorAll('details');
  const activeSectionElements = document.querySelectorAll('.active-section');

  for (let i = 0; i < activeSectionElements.length; i++) {
    activeSectionElements[i].classList.remove('active-section');
  }

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

  for (let i = 0; i < detailsElements.length; i++) {
    detailsElements[i].classList.remove('active');
  }

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

  const targetElement = activeHash ? document.getElementById(activeHash) : null;
  if (targetElement) {
    const parentDetails = getParentDetailsElements(targetElement);
    const keepOpenSet = new Set(parentDetails);

    if (!doNotOpen) {
      closeOtherDetails(keepOpenSet);
    }

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

// NOTE: This does NOT scroll - scrolling is handled by DetailsClicksClient
const handleHashNavigation = function(hash) {
  if (!hash) return;

  const targetId = hash.substring(1);
  highlightDetailsOnActiveHash(targetId);
  highlightActiveOnPageLink();
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
            setTimeout(() => {
              const y = targetEl.getBoundingClientRect().top + window.scrollY - 280;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }, 150);
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
        setTimeout(() => {
          const y = targetEl.getBoundingClientRect().top + window.scrollY - 280;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, 150);
      }
    });

    // NOTE: hashchange only handles highlighting, NOT scrolling (to avoid race condition)
    // Scrolling is handled by DetailsClicksClient's universal click handler
    window.addEventListener('hashchange', function(e) {
      const newHash = e.newURL ? e.newURL.split('#')[1] : '';
      const hashToUse = newHash ? '#' + newHash : location.hash;

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
