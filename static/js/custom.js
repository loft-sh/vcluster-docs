let firstCall = true;

// Helper to close all details except those in the keep-open set
const closeOtherConfigDetails = function(keepOpenSet) {
  document.querySelectorAll('details.config-field[open]').forEach(function(el) {
    if (!keepOpenSet.has(el)) {
      el.open = false;
      el.setAttribute('data-collapsed', 'true');
    }
  });
};

// Helper to get parent details elements
const getParentConfigDetails = function(element) {
  const parents = [];
  let current = element;
  while (current && current !== document) {
    if (current.tagName === 'DETAILS') {
      parents.push(current);
    }
    current = current.parentElement;
  }
  return parents;
};

const highlightDetailsOnActiveHash = function(activeHash, doNotOpen) {
    const activeAnchors = document.querySelectorAll(".anchor[id='" + activeHash + "'");
    const detailsElements = document.querySelectorAll("details");
    const activeSectionElements = document.querySelectorAll(".active-section");
    for (let i = 0; i < activeSectionElements.length; i++) {
        activeSectionElements[i].classList.remove("active-section")
    }

    for (let i = 0; i < activeAnchors.length; i++) {
        const headline = activeAnchors[i].parentElement;
        const headlineRank = activeAnchors[i].parentElement.nodeName.substr(1);
        let el = headline;

        while (el) {
            if (el.tagName != "BR" && el.tagName != "HR") {
                el.classList.add("active-section");
            }
            el = el.nextElementSibling;

            if (el) {
                elRank = el.nodeName.substr(1)

                if (elRank > 0 && elRank <= headlineRank) {
                    break;
                }
            }
        }
    }

    for (let i = 0; i < detailsElements.length; i++) {
        const detailsElement = detailsElements[i];

        detailsElement.classList.remove("active");
    }

    if (activeAnchors.length > 0) {
        for (let i = 0; i < activeAnchors.length; i++) {
            let element = activeAnchors[i];

            for ( ; element && element !== document; element = element.parentElement ) {
                if (element.tagName == "DETAILS") {
                    element.classList.add("active");

                    if (!doNotOpen) {
                        element.open = true;
                        element.setAttribute('data-collapsed', 'false');
                        // Also expand the collapsible content by removing inline styles
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

    // Also handle elements with matching IDs (for nested config fields)
    // Use getElementById for security (safer than querySelector with user input)
    const targetElement = activeHash ? document.getElementById(activeHash) : null;
    if (targetElement) {
        // Get all parent details
        const parentDetails = getParentConfigDetails(targetElement);
        const keepOpenSet = new Set(parentDetails);

        // Close all other details if not in doNotOpen mode
        if (!doNotOpen) {
            closeOtherConfigDetails(keepOpenSet);
        }

        // Process parent details
        for (let i = 0; i < parentDetails.length; i++) {
            const element = parentDetails[i];
            element.classList.add("active");
            if (!doNotOpen) {
                element.open = true;
                element.setAttribute('data-collapsed', 'false');
                // Also expand the collapsible content by removing inline styles
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

const highlightActiveOnPageLink = function() {
    let activeHash;

    if (firstCall) {
        firstCall = false;

        if (location.hash.length > 0) {
            activeHash = location.hash.substring(1);

            highlightDetailsOnActiveHash(activeHash);
        }
        window.addEventListener('scroll', highlightActiveOnPageLink);
    }

    setTimeout(function() {
        if (!activeHash) {
            const anchors = document.querySelectorAll("h2 > .anchor, h3 > .anchor");

            if (anchors.length > 0) {
                if (document.scrollingElement.scrollTop < 100) {
                    activeHash = anchors[0].attributes.id.value;
                } else if (document.scrollingElement.scrollTop == document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight) {
                    activeHash = anchors[anchors.length - 1].attributes.id.value;
                } else {
                    for (let i = 0; i < anchors.length; i++) {
                        const anchor = anchors[i];

                        if (anchor.parentElement.getBoundingClientRect().top < window.screen.availHeight*0.5) {
                            activeHash = anchor.attributes.id.value;
                        } else {
                            break;
                        }
                    }
                }
            }

            if (!activeHash) {
                const firstOnPageNavLink = document.querySelectorAll(".toc-headings:first-child > li:first-child > a");

                if (firstOnPageNavLink.attributes) {
                    activeHash = firstOnPageNavLink.attributes.href.value.substr(1);
                }
            }
        }

        const allLinks = document.querySelectorAll("a");

        for (let i = 0; i < allLinks.length; i++) {
            const link = allLinks[i];
            link.classList.remove("active");

            if (link.parentElement && link.parentElement.parentElement && link.parentElement.parentElement.tagName == "UL") {
                link.parentElement.parentElement.classList.remove("active")
            }
        }

        const activeLinks = document.querySelectorAll("a[href='#" + activeHash + "'");

        for (let i = 0; i < activeLinks.length; i++) {
            const link = activeLinks[i];
            link.classList.add("active");

            if (link.parentElement && link.parentElement.parentElement && link.parentElement.parentElement.tagName == "UL") {
                link.parentElement.parentElement.classList.add("active")
            }
        }
    }, 100)
};

const hashLinkClickSet = false;

const allowHashLinkClick = function() {
    if (!hashLinkClickSet) {
        const hashLinkIcons = document.querySelectorAll(".hash-link-icon");

        for (let i = 0; i < hashLinkIcons.length; i++) {
            const hashLinkIcon = hashLinkIcons[i];
            hashLinkIcon.addEventListener("mousedown", function() {
                history.pushState(null, null, hashLinkIcon.parentElement.attributes.href.value);
                highlightActiveOnPageLink();
                highlightDetailsOnActiveHash(location.hash.substr(1), true);
            });
        }
    }
};

window.addEventListener('load', allowHashLinkClick);
window.addEventListener('load', highlightActiveOnPageLink);
window.addEventListener('popstate', function (event) {
    highlightDetailsOnActiveHash(location.hash.substr(1));
}, false);
window.addEventListener("click", function (e) {
    if (e.target.nodeName == "A" || e.target == document) {
        setTimeout(function() {
            highlightDetailsOnActiveHash(location.hash.substr(1));
        }, 1000);
    }
});

/*
const fixCopyButtons = function(e){
    if (e.target.nodeName == "A" || e.target == document) {
        setTimeout(function() {
            document.querySelectorAll('html body .markdown button[aria-label="Copy code to clipboard"]').forEach(function(el) {
                const newEl = el.cloneNode(true);
                el.parentNode.replaceChild(newEl, el);
                newEl.addEventListener("click", function(e) {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(e.target.parentElement.querySelector(':scope > .prism-code'));
                    selection.removeAllRanges();
                    selection.addRange(range);

                    document.execCommand('copy');
                    selection.removeAllRanges();

                    const original = e.target.textContent;
                    e.target.textContent = 'Copied';

                    setTimeout(() => {
                        e.target.textContent = original;
                    }, 1200);
                })
            });
        }, 1000);
    }
}

document.addEventListener("DOMContentLoaded", fixCopyButtons);
window.addEventListener("popstate", fixCopyButtons);
window.addEventListener("click", fixCopyButtons);*/