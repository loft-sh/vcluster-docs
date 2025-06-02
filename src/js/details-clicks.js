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
  margin: 0 4px 0 8px;  /* Increased left margin to 8px */
  vertical-align: middle;
`;

      const summary = el.querySelector('summary');
      if (summary) {
        // Find the hash link
        const hashLink = summary.querySelector('a.hash-link');
        if (hashLink) {
          // Insert the button right after the hash link
          hashLink.insertAdjacentElement('afterend', copyButton);

          // Show button on summary hover
          summary.addEventListener('mouseenter', () => {
            copyButton.style.opacity = '1';
          });
          summary.addEventListener('mouseleave', () => {
            copyButton.style.opacity = '0';
          });
        }
      }

      // Rest of the click handler code remains the same
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
      // Handle nested map
      const nestedParsed = parseMapValue(value);
      if (nestedParsed) {
        yaml += generateMapYaml(nestedParsed, indent + 2);
        // Only add newline if this isn't the last entry
        if (index < array.length - 1) {
          yaml += '\n';
        }
      } else {
        yaml += ' {}\n';
      }
    } else {
      yaml += ` ${value}`;
      // Only add newline if this isn't the last entry
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
    // Function to decode HTML entities
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

    // Helper function to format values appropriately
    const formatValue = function (value) {
      if (typeof value === 'string') {
        // Quote the string if it could be misinterpreted in YAML
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

    // Updated parseMapString function
    const parseMapString = function (str) {
      function parse() {
        let i = 0;

        function parseValue() {
          if (str.substr(i, 4) === 'map[') {
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
            let start = i;
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
          let start = i;
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
      for (let k in obj) {
        let v = obj[k];
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
      // Map handling
      const obj = parseMapString(defaultValue);
      const yamlString = generateYamlFromObject(obj, 1);
      yaml += '\n' + yamlString;
    } else if (defaultValue.startsWith('[')) {
      // Array handling
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
            let char = arrayContent[i];
            if (arrayContent.substr(i, 4) === 'map[') {
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

const preserveExpansionStates = ExecutionEnvironment.canUseDOM ? function(skipEventListener) {
  const state = new URLSearchParams(window.location.search.substring(1));

  if (document.querySelectorAll('.markdown').length == 0) {
    return setTimeout(preserveExpansionStates, 100);
  }

  // Add copy buttons to config fields
  addCopyButtons();

  document.querySelectorAll('details, .tabs-container').forEach(function(el, index) {
    const expansionKey = "x" + (el.id || index);
    const stateChangeElAll = el.querySelectorAll(':scope > summary, :scope > [role="tablist"] > *');
    const anchorLinks = el.querySelectorAll(':scope a[href="' + location.hash + '"]');

    if (anchorLinks.length > 0) {
      if (el.querySelectorAll(':scope > summary a[href="' + location.hash + '"]').length > 0) {
        el.classList.add("-contains-target-link");
      }
      state.set(expansionKey, 1);
    } else {
      el.classList.remove("-contains-target-link");
      state.delete(expansionKey);
    }

    const persistState = function(i) {
      if (Number.isInteger(i)) {
        const anchorLinks = el.querySelectorAll(':scope > summary a[href^="#"]');
        const state = new URLSearchParams(window.location.search.substring(1));
        if ((el.open && el.getAttribute("data-expandable") != "false") || el.classList.contains("tabs-container")) {
          if (anchorLinks.length == 1) {
            if (anchorLinks[0].getAttribute("href") == location.hash) {
              el.classList.add("-contains-target-link");
            }
          } else {
            state.set(expansionKey, i);
          }
        } else {
          el.classList.remove("-contains-target-link");
          state.delete(expansionKey);
        }

        let query = state.toString();
        if (query) {
          query = '?' + query.replace(/^[?]/, "");
        }

        window.history.replaceState(null, '', window.location.pathname + query + window.location.hash);
      }
    };

    if (el.getAttribute("data-preserve-state") !== "true") {
      el.setAttribute("data-preserve-state", "true");

      el.addEventListener("toggle", persistState.bind(el, 1));
      stateChangeElAll.forEach(function(stateChangeEl, i) {
        stateChangeEl.addEventListener("click", persistState.bind(stateChangeEl, i + 1));
      });

      el.querySelectorAll(':scope > summary a[href^="#"]').forEach(anchorLink => {
        anchorLink.addEventListener("click", (e) => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          e.preventDefault();

          const newHash = anchorLink.getAttribute("href");

          document.querySelectorAll(".-contains-target-link").forEach(function(el) {
            if (el.querySelectorAll(':scope > summary a[href="' + newHash + '"]').length == 0) {
              el.classList.remove("-contains-target-link");
            }
          });

          let query = location.search;
          if (query) {
            query = '?' + query.replace(/^[?]/, "");
          }
          window.history.replaceState(null, '', window.location.pathname + query + newHash);

          if (!el.hasAttribute("open")) {
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

  // Remove the infinite recursion - this was causing browser errors
  // The function is already called initially and on relevant events
} : () => {};

if (ExecutionEnvironment.canUseDOM) {
  preserveExpansionStates();

  if (location.hash) {
    setTimeout(() => {
      location.href = location.href;

      const targetEl = document.querySelector('[id="' + location.hash.substr(1) + '"]');
      if (targetEl) {
        window.scroll({
          behavior: 'smooth',
          left: 0,
          top: targetEl.getBoundingClientRect().top + window.scrollY - 120
        });
      }
    }, 1000);
  }
}

export default ExecutionEnvironment.canUseDOM ? preserveExpansionStates : () => {};