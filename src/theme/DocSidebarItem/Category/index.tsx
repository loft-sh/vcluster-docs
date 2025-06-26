import React, {type ReactNode} from 'react';
import Category from '@theme-original/DocSidebarItem/Category';
import type CategoryType from '@theme/DocSidebarItem/Category';
import type {WrapperProps} from '@docusaurus/types';
import {useHistory} from '@docusaurus/router';

type Props = WrapperProps<typeof CategoryType>;

export default function CategoryWrapper(props: Props): ReactNode {
  const history = useHistory();
  const categoryRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (!categoryRef.current || !props.item.href) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const categoryLink = categoryRef.current?.querySelector('a.menu__link--sublist');
      
      if (!categoryLink || !categoryLink.contains(target)) {
        return;
      }
      
      const clickedOnLink = target.tagName === 'A' || target.closest('a') === categoryLink;
      
      if (clickedOnLink) {
        e.preventDefault();
        history.push(props.item.href);
      }
    };
    
    const element = categoryRef.current;
    element.addEventListener('click', handleClick);
    
    return () => {
      element.removeEventListener('click', handleClick);
    };
  }, [props.item.href, history]);
  
  return (
    <div ref={categoryRef}>
      <Category {...props} />
    </div>
  );
}
