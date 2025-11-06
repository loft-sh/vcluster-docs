import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

// Only define browser-specific functions when in browser environment
const copyToClipboard = ExecutionEnvironment.canUseDOM ? async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed:', err);
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      textArea.remove();
      return true;
    } catch (err) {
      console.warn('execCommand failed:', err);
      textArea.remove();
      return false;
    }
  } catch (err) {
    console.warn('Fallback clipboard method failed:', err);
    return false;
  }
} : async () => false;

const addCopyButtons = ExecutionEnvironment.canUseDOM ? function() {
  document.querySelectorAll('details.config-field').forEach(function(el) {
    if (el.getAttribute('data-copy-button') !== 'true') {
      el.setAttribute('data-copy-button', 'true');

      const copyButton = document.createElement('button');
      copyButton.className = 'clean-btn';
      copyButton.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;
copyButton.style.cssText = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--ifm-color-secondary);
  border: 1px solid var(--ifm-color-secondary-darker);
  border-radius: 4px;
  cursor: pointer;
  padding: 3px;
  min-width: 24px;
  height: 24px;
  color: var(--ifm-color-content);
  transition: all 0.2s;
  opacity: 0;
  margin: 0 4px 0 8px;
  vertical-align: middle;
`;

      const summary = el.querySelector('summary');
      if (summary) {
        const hashLink = summary.querySelector('a.hash-link');
        if (hashLink) {
          hashLink.insertAdjacentElement('afterend', copyButton);

          summary.addEventListener('mouseenter', () => {
            copyButton.style.opacity = '1';
          });
          summary.addEventListener('mouseleave', () => {
            copyButton.style.opacity = '0';
          });
        }
      }

      copyButton.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();

        const yaml = generateYaml(el);
        if (yaml) {
          const success = await copyToClipboard(yaml);

          const originalHTML = copyButton.innerHTML;
          copyButton.innerHTML = success ?
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' :
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';

          copyButton.style.background = success ?
            'var(--ifm-color-success-lightest)' :
            'var(--ifm-color-danger-lightest)';
          copyButton.style.borderColor = success ?
            'var(--ifm-color-success)' :
            'var(--ifm-color-danger)';

          setTimeout(() => {
            copyButton.innerHTML = originalHTML;
            copyButton.style.background = 'var(--ifm-color-secondary)';
            copyButton.style.borderColor = 'var(--ifm-color-secondary-darker)';
          }, 2000);
        }
      });
    }
  });
} : () => {};

const parseMapValue = function(mapStr) {
  console.log('Parsing map:', mapStr);

  // Handle multiple 'map' prefixes (e.g., mapmap[...])
  const mapRegex = /(?:map)+\[(.*)\]/;
  const match = mapStr.match(mapRegex);
  if (!match) return null;

  const content = match[1];
  const result = {};

  // Split into sections while respecting nested maps
  let bracketCount = 0;
  let currentKey = '';
  let currentValue = '';
  let isCollectingKey = true;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '[') {
      bracketCount++;
      currentValue += char;
    } else if (char === ']') {
      bracketCount--;
      currentValue += char;
    } else if (char === ':' && bracketCount === 0) {
      isCollectingKey = false;
      continue;
    } else if (char === ' ' && bracketCount === 0) {
      if (currentKey && currentValue) {
        result[currentKey.trim()] = currentValue.trim();
        currentKey = '';
        currentValue = '';
        isCollectingKey = true;
      }
      continue;
    } else {
      if (isCollectingKey) {
        currentKey += char;
      } else {
        currentValue += char;
      }
    }
  }

  // Add final key-value pair
  if (currentKey && currentValue) {
    result[currentKey.trim()] = currentValue.trim();
  }

  return result;
};

const generateMapYaml = function(parsed, indent = 2) {
  let yaml = '\n';

  Object.entries(parsed).forEach(([key, value], index, array) => {
    yaml += `${' '.repeat(indent)}${key}:`;

    if (value.startsWith('map[')) {
      const nestedParsed = parseMapValue(value);
      if (nestedParsed) {
        yaml += generateMapYaml(nestedParsed, indent + 2);
        if (index < array.length - 1) {
          yaml += '\n';
        }
      } else {
        yaml += ' {}\n';
      }
    } else {
      yaml += ` ${value}`;
      if (index < array.length - 1) {
        yaml += '\n';
      }
    }
  });

  return yaml;
};

// TODO:(piotr1215) refactor and add some unint tests
const generateYaml = function (element, processedElements = new Set()) {
  if (processedElements.has(element)) return null;
  processedElements.add(element);

  const key = element
    .querySelector(
      'summary h2 code, summary h3 code, summary h4 code, summary h5 code'
    )
    ?.textContent?.trim();
  if (!key) return null;

  let yaml = `${key}:`;

  const description = element.querySelector('summary > p')?.textContent?.trim();
  if (description) {
    const comments = description
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `# ${line}`)
      .join('\n');
    yaml = `${comments}\n${yaml}`;
  }

  const nestedFields = Array.from(
    element.querySelectorAll('details.config-field')
  ).filter((nested) => {
    if (nested === element) return false;
    let parent = nested.parentElement;
    while (parent && parent !== element) {
      if (
        parent.tagName === 'DETAILS' &&
        parent.classList.contains('config-field')
      ) {
        return false;
      }
      parent = parent.parentElement;
    }
    return true;
  });

  if (nestedFields.length > 0) {
    yaml += '\n';
    const nestedYamls = nestedFields
      .filter((nested) => !processedElements.has(nested))
      .map((nested) => {
        const nestedYaml = generateYaml(nested, processedElements);
        return nestedYaml
          ? nestedYaml
              .split('\n')
              .map((line) => `  ${line}`)
              .join('\n')
          : null;
      })
      .filter(Boolean);

    if (nestedYamls.length > 0) {
      yaml += nestedYamls.join('\n');
    }
  } else {
    const decodeHTMLEntities = function (text) {
      const txt = document.createElement('textarea');
      txt.innerHTML = text;
      return txt.value;
    };

    const defaultValueElement = element.querySelector(
      'summary .config-field-default'
    );
    let defaultValue = '';
    if (defaultValueElement) {
      defaultValue = defaultValueElement.textContent.trim();
      defaultValue = decodeHTMLEntities(defaultValue);
    }

    const type =
      element
        .querySelector('summary .config-field-type')
        ?.textContent?.trim() || '';

    // Quote strings that could be misinterpreted in YAML
    const formatValue = function (value) {
      if (typeof value === 'string') {
        if (
          value === 'true' ||
          value === 'false' ||
          value === 'null' ||
          /^[0-9]+$/.test(value) ||
          /^0[0-9]+/.test(value) || // Octal numbers
          value.includes(':') ||
          value.includes('#') ||
          value.includes('- ') ||
          value.trim() === ''
        ) {
          return `"${value}"`;
        } else {
          return value;
        }
      } else {
        return value;
      }
    };

    const parseMapString = function (str) {
      function parse() {
        let i = 0;

        function parseValue() {
          if (str.substring(i, i + 4) === 'map[') {
            i += 4; // skip 'map['
            const obj = {};
            while (str[i] !== ']' && i < str.length) {
              if (str[i] === ' ') {
                i++; // skip spaces
                continue;
              }
              const key = parseKey();
              if (str[i] === ':') {
                i++; // skip ':'
              } else {
                throw new Error('Expected : after key');
              }
              const value = parseValue();
              obj[key] = value;
            }
            i++; // skip ']'
            return obj;
          } else if (str[i] === '[') {
            i++; // skip '['
            const arr = [];
            while (str[i] !== ']' && i < str.length) {
              if (str[i] === ' ') {
                i++; // skip spaces
                continue;
              }
              const value = parseValue();
              arr.push(value);
              if (str[i] === ',') {
                i++; // skip ','
              }
            }
            i++; // skip ']'
            return arr;
          } else {
            // Parse until space, ':', ']', or ','
            const start = i;
            while (
              i < str.length &&
              ![' ', ':', ']', ',', '\n'].includes(str[i])
            ) {
              i++;
            }
            return str.slice(start, i);
          }
        }

        function parseKey() {
          // Parse until ':', space, or ']'
          const start = i;
          while (
            i < str.length &&
            ![':', ' ', ']'].includes(str[i])
          ) {
            i++;
          }
          return str.slice(start, i);
        }

        return parseValue();
      }

      return parse();
    };

    // Define generateYamlFromObject function within generateYaml
    const generateYamlFromObject = function (obj, indentLevel = 1) {
      const indent = '  '.repeat(indentLevel);
      let lines = [];
      for (const k in obj) {
        const v = obj[k];
        if (Array.isArray(v)) {
          if (v.length === 0) {
            lines.push(`${indent}${k}: []`);
          } else {
            lines.push(`${indent}${k}:`);
            v.forEach((item) => {
              if (typeof item === 'object' && item !== null) {
                const nestedYaml = generateYamlFromObject(
                  item,
                  indentLevel + 2
                );
                const nestedYamlLines = nestedYaml
                  .split('\n')
                  .filter(Boolean);
                nestedYamlLines[0] = `${'  '.repeat(
                  indentLevel + 1
                )}- ${nestedYamlLines[0].trim()}`;
                lines = lines.concat(nestedYamlLines);
              } else {
                lines.push(
                  `${'  '.repeat(indentLevel + 1)}- ${formatValue(item)}`
                );
              }
            });
          }
        } else if (typeof v === 'object' && v !== null) {
          if (Object.keys(v).length === 0) {
            lines.push(`${indent}${k}: {}`);
          } else {
            lines.push(`${indent}${k}:`);
            const nestedYaml = generateYamlFromObject(v, indentLevel + 1);
            const nestedYamlLines = nestedYaml.split('\n').filter(Boolean);
            lines = lines.concat(nestedYamlLines);
          }
        } else if (v === '') {
          lines.push(`${indent}${k}: ""`);
        } else if (v === undefined || v === null) {
          lines.push(`${indent}${k}:`);
        } else {
          lines.push(`${indent}${k}: ${formatValue(v)}`);
        }
      }
      return lines.join('\n');
    };

    if (defaultValue.startsWith('map[')) {
      const obj = parseMapString(defaultValue);
      const yamlString = generateYamlFromObject(obj, 1);
      yaml += '\n' + yamlString;
    } else if (defaultValue.startsWith('[')) {
      const trimmedValue = defaultValue.trim();
      if (
        trimmedValue === '[]' ||
        trimmedValue === '[' ||
        trimmedValue === '[\n' ||
        !defaultValue.includes(']')
      ) {
        yaml += ' []';
      } else {
        const arrayContent = defaultValue.slice(1, -1).trim();
        if (arrayContent === '') {
          yaml += ' []';
        } else {
          yaml += '\n';
          const items = [];
          let depth = 0;
          let currentItem = '';
          for (let i = 0; i < arrayContent.length; i++) {
            const char = arrayContent[i];
            if (arrayContent.substring(i, i + 4) === 'map[') {
              depth++;
              currentItem += 'map[';
              i += 3;
            } else if (char === '[') {
              depth++;
              currentItem += char;
            } else if (char === ']') {
              depth--;
              currentItem += char;
            } else if (char === ',' && depth === 0) {
              items.push(currentItem.trim());
              currentItem = '';
            } else {
              currentItem += char;
            }
          }
          if (currentItem.trim()) {
            items.push(currentItem.trim());
          }

          items.forEach((item) => {
            if (item.startsWith('map[')) {
              const obj = parseMapString(item);
              const yamlString = generateYamlFromObject(obj, 2);
              const yamlLines = yamlString.split('\n').filter(Boolean);
              yamlLines[0] = `  - ${yamlLines[0].trim()}`;
              yaml += yamlLines.join('\n') + '\n';
            } else {
              yaml += `  - ${formatValue(item)}\n`;
            }
          });
        }
      }
    } else if (type === 'boolean') {
      yaml += ` ${defaultValue.toLowerCase()}`;
    } else if (defaultValue === '[]' || defaultValue === '{}') {
      yaml += ` ${defaultValue}`;
    } else if (defaultValue === '') {
      yaml += ` ""`;
    } else {
      yaml += defaultValue ? ` ${formatValue(defaultValue)}` : ' ';
    }
  }

  return yaml;
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

const closeOtherDetails = function(keepOpenSet) {
  document.querySelectorAll('details.config-field[open]').forEach(function(el) {
    if (!keepOpenSet.has(el)) {
      closeDetailsElement(el);
    }
  });
};

const preserveExpansionStates = ExecutionEnvironment.canUseDOM ? function(skipEventListener) {
  const state = new URLSearchParams(window.location.search.substring(1));

  if (document.querySelectorAll('.markdown').length == 0) {
    return setTimeout(preserveExpansionStates, 100);
  }

  // Wait for React hydration before manipulating DOM on initial page load with hash
  if (!skipEventListener && location.hash && !window.__hydrationComplete) {
    const rootElement = document.getElementById('__docusaurus');
    const isHydrated = rootElement && (rootElement._reactRootContainer || rootElement._reactRootContainer === null || Object.keys(rootElement).some(key => key.startsWith('__react')));

    if (!isHydrated) {
      return setTimeout(preserveExpansionStates, 100);
    }

    window.__hydrationComplete = true;
    return setTimeout(preserveExpansionStates, 50);
  }

  addCopyButtons();

  const isInitialCallWithHash = !skipEventListener && location.hash;

  // Debounce to prevent "too many calls" errors with History API
  let historyUpdateTimer = null;
  const debouncedHistoryUpdate = function(url) {
    if (historyUpdateTimer) {
      clearTimeout(historyUpdateTimer);
    }
    historyUpdateTimer = setTimeout(() => {
      try {
        window.history.replaceState(null, '', url);
      } catch (e) {
        console.warn('History replaceState failed:', e.message);
      }
    }, 50);
  };

  // Remove all existing highlights before re-initializing
  // This prevents stale highlights from previous navigation
  document.querySelectorAll('.-contains-target-link').forEach(el => {
    el.classList.remove('-contains-target-link');
  });

  // Sort elements by depth (deepest first) to process children before parents
  // This prevents race condition where both parent and child get highlighted
  const elements = Array.from(document.querySelectorAll('details, .tabs-container'));
  const elementsWithDepth = elements.map(el => {
    let depth = 0;
    let current = el.parentElement;
    while (current) {
      if (current.tagName === 'DETAILS') depth++;
      current = current.parentElement;
    }
    return { el, depth };
  });
  elementsWithDepth.sort((a, b) => b.depth - a.depth); // Deepest first

  elementsWithDepth.forEach(function({ el, depth }, index) {
    const expansionKey = "x" + (el.id || index);
    const stateChangeElAll = el.querySelectorAll(':scope > summary, :scope > [role="tablist"] > *');
    const anchorLinks = el.querySelectorAll(':scope a[href="' + location.hash + '"]');

    const targetId = location.hash.substring(1);
    const targetEl = targetId ? document.getElementById(targetId) : null;
    const containsTarget = targetEl && (el.id === targetId || el.contains(targetEl));

    // Check if this element's DIRECT summary (not nested) has a link to the target
    const hasSummaryLink = el.querySelectorAll(':scope > summary a[href="' + location.hash + '"]').length > 0;

    // Only highlight if no child details element already has the highlight class
    // (children are processed first due to depth sorting)
    const childDetailsHighlighted = Array.from(el.querySelectorAll('details')).some(
      child => child.classList.contains('-contains-target-link')
    );

    if (anchorLinks.length > 0 || containsTarget) {
      if (hasSummaryLink && !childDetailsHighlighted) {
        el.classList.add("-contains-target-link");
      }
      state.set(expansionKey, 1);

      if (containsTarget) {
        openDetailsElement(el);
        // NOTE: Initial page load scrolling is handled by ConfigNavigationClient
      }
    } else {
      state.delete(expansionKey);
    }

    const persistState = function(i) {
      if (Number.isInteger(i)) {
        const anchorLinks = el.querySelectorAll(':scope > summary a[href^="#"]');
        const state = new URLSearchParams(window.location.search.substring(1));
        if ((el.open && el.getAttribute("data-expandable") != "false") || el.classList.contains("tabs-container")) {
          if (anchorLinks.length == 1) {
            // NOTE: Highlighting is managed by initializeDetailsElement (initial load)
            // and universal click handler (user clicks). Do NOT manage highlights here
            // to avoid race conditions and double highlighting.
          } else {
            state.set(expansionKey, i);
          }
        } else {
          // NOTE: Do NOT remove highlight class here - only click handler manages highlights
          state.delete(expansionKey);
        }

        let query = state.toString();
        if (query) {
          query = '?' + query.replace(/^[?]/, "");
        }

        debouncedHistoryUpdate(window.location.pathname + query + window.location.hash);
      }
    };

    if (el.getAttribute("data-preserve-state") !== "true") {
      el.setAttribute("data-preserve-state", "true");

      el.addEventListener("toggle", persistState.bind(el, 1));
      stateChangeElAll.forEach(function(stateChangeEl, i) {
        stateChangeEl.addEventListener("click", persistState.bind(stateChangeEl, i + 1));
      });

      const anchorLinks = el.querySelectorAll(':scope > summary a[href^="#"]');
      anchorLinks.forEach(anchorLink => {
        anchorLink.setAttribute('data-has-handler', 'true');

        anchorLink.addEventListener("click", (e) => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          e.preventDefault();

          const newHash = anchorLink.getAttribute("href");
          const targetId = newHash.substring(1);

          // Remove highlight from elements that don't link to the new hash
          document.querySelectorAll(".-contains-target-link").forEach(function(el) {
            if (el.querySelectorAll(':scope > summary a[href="' + newHash + '"]').length == 0) {
              el.classList.remove("-contains-target-link");
            }
          });

          let query = location.search;
          if (query) {
            query = '?' + query.replace(/^[?]/, "");
          }
          debouncedHistoryUpdate(window.location.pathname + query + newHash);

          const targetEl = targetId ? document.getElementById(targetId) : null;
          if (targetEl) {
            const parentDetails = getParentDetailsElements(targetEl);
            const keepOpenSet = new Set(parentDetails);

            closeOtherDetails(keepOpenSet);
            parentDetails.forEach(openDetailsElement);

            // Add orange border ONLY to the innermost/direct details element
            if (parentDetails.length > 0) {
              const directTargetDetails = parentDetails[0]; // First element is innermost
              directTargetDetails.classList.add("-contains-target-link");
            }

            // replaceState doesn't trigger hashchange, so we must scroll here
            requestAnimationFrame(() => {
              const targetRect = targetEl.getBoundingClientRect();
              const y = window.scrollY + targetRect.top - 100;
              window.scrollTo({ top: y, behavior: 'smooth' });
            });
          } else if (!el.hasAttribute("open")) {
            anchorLink.parentElement.click();
          }
        });
      });
    }

    if (state.get(expansionKey) && el.open != true) {
      el.open = true;
      stateChangeElAll.forEach(function(stateChangeEl, i) {
        if (state.get(expansionKey) === (i + 1).toString()) {
          stateChangeEl.click();
        }
      });
    }
  });

  if (!skipEventListener) {
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden && document.querySelectorAll('details.config-field').length > 0) {
        setTimeout(addCopyButtons, 100);
      }
    });

    // Use interval check instead of MutationObserver to avoid React conflicts
    let checkCount = 0;
    const maxChecks = 10;
    const recheckCopyButtons = function() {
      if (checkCount < maxChecks) {
        checkCount++;
        const fieldsWithoutButtons = document.querySelectorAll('details.config-field:not([data-copy-button="true"])');
        if (fieldsWithoutButtons.length > 0) {
          addCopyButtons();
        }
        setTimeout(recheckCopyButtons, 1000);
      }
    };
    setTimeout(recheckCopyButtons, 500);
  }
} : () => {};

// ============================================================================
// Docusaurus Lifecycle Hooks
// ============================================================================

// Universal hash link handler (including TOC sidebar)
// Fixes Docusaurus's buggy hash navigation and enables CSS :target highlighting
if (ExecutionEnvironment.canUseDOM) {
  let scrollTimeout = null;

  document.addEventListener('click', function(e) {
    let target = e.target;
    let anchor = null;

    while (target && target !== document) {
      if (target.tagName === 'A') {
        anchor = target;
        break;
      }
      target = target.parentElement;
    }

    if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
      const hash = anchor.getAttribute('href');
      const targetId = hash.substring(1);

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const targetEl = targetId ? document.getElementById(targetId) : null;
      if (targetEl) {
        const parentDetails = getParentDetailsElements(targetEl);
        const keepOpenSet = new Set(parentDetails);
        closeOtherDetails(keepOpenSet);
        parentDetails.forEach(openDetailsElement);

        // Remove all existing highlights first
        document.querySelectorAll('.-contains-target-link').forEach(el => {
          el.classList.remove('-contains-target-link');
        });

        // Add highlight to the innermost parent details element
        if (parentDetails.length > 0) {
          parentDetails[0].classList.add('-contains-target-link');
        }

        // Update URL hash for history/bookmarking
        const oldURL = window.location.href;
        window.history.pushState(null, '', hash);
        const newURL = window.location.href;

        // Trigger hashchange event manually for other listeners (including sidebar highlighting)
        window.dispatchEvent(new HashChangeEvent('hashchange', {
          oldURL: oldURL,
          newURL: newURL
        }));

        // Cancel any pending scroll
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        // Smooth scroll to target with proper offset
        scrollTimeout = requestAnimationFrame(() => {
          const rect = targetEl.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetY = scrollTop + rect.top - 100;

          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
          });
        });
      }
    }
  }, true); // Capture phase
}

let isInitialized = false;

/**
 * Docusaurus lifecycle hook - called after route updates and DOM is ready
 * Ensures DOM manipulation happens AFTER React hydration
 */
export function onRouteDidUpdate({ location }) {
  if (!ExecutionEnvironment.canUseDOM) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!isInitialized) {
        isInitialized = true;
        preserveExpansionStates();
      } else {
        preserveExpansionStates(true);
      }

      addCopyButtons();
    });
  });
}