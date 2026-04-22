import React, {type ReactNode} from 'react';
import Category from '@theme-original/DocSidebarItem/Category';
import type CategoryType from '@theme/DocSidebarItem/Category';
import type {WrapperProps} from '@docusaurus/types';
import {useHistory} from '@docusaurus/router';

type Props = WrapperProps<typeof CategoryType>;

export default function CategoryWrapper(props: Props): ReactNode {
  const history = useHistory();
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Known limitation: After navigating to a category and collapsing it,
  // clicking the category again won't expand it (only navigates).
  // Workaround: Click elsewhere first, then click the category.
  // TODO:(piotr1215): Investigate Docusaurus state management for a complete fix.

  React.useEffect(() => {
    if (!props.item.href) {
      return;
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // FIRST: Check if we clicked on the chevron/toggle button or its children
      // This must be checked before anything else to avoid interference
      const isChevronClick = target.closest('button.menu__caret') ||
                           target.closest('svg.menu__link-icon') ||
                           target.classList.contains('menu__caret') ||
                           target.classList.contains('menu__link-icon');

      if (isChevronClick) {
        // Don't do anything - let Docusaurus handle the toggle
        return;
      }

      // Check if we clicked on a link
      const clickedLink = target.closest('a');
      if (!clickedLink) {
        return;
      }

      // Get the href from the clicked link
      const clickedHref = clickedLink.getAttribute('href');

      // Check if this matches our category's href
      if (clickedHref !== props.item.href) {
        return;
      }

      // Only prevent default and navigate if we're sure this is a category link click
      // (not a chevron click)
      e.preventDefault();
      e.stopPropagation();
      history.push(props.item.href);
    };

    // Use capture phase to intercept before other handlers
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [props.item.href, history]);

  return (
    <div ref={wrapperRef}>
      <Category {...props} />
    </div>
  );
}