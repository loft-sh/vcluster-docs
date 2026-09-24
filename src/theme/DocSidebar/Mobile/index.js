import React from 'react';
import clsx from 'clsx';
import {
  NavbarSecondaryMenuFiller,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import DocSidebarItems from '@theme/DocSidebarItems';
import DocsSidebarControls from '@site/src/components/DocsSidebarControls';
import sharedSidebarShell from '@site/src/config/sidebarShell.json';

function withSharedShell(sidebar) {
  const hasSharedShell = sidebar.some((item) =>
    item.className?.split(' ').includes('sidebar-shell-heading'),
  );

  return hasSharedShell ? sidebar : [...sharedSidebarShell, ...sidebar];
}

const DocSidebarMobileSecondaryMenu = ({sidebar, path}) => {
  const mobileSidebar = useNavbarMobileSidebar();

  return (
    <>
      <DocsSidebarControls />
      <ul className={clsx(ThemeClassNames.docs.docSidebarMenu, 'menu__list')}>
        <DocSidebarItems
          items={withSharedShell(sidebar)}
          activePath={path}
          onItemClick={(item) => {
            if (item.type === 'category' && item.href) {
              mobileSidebar.toggle();
            }
            if (item.type === 'link') {
              mobileSidebar.toggle();
            }
          }}
          level={1}
        />
      </ul>
    </>
  );
};

function DocSidebarMobile(props) {
  return (
    <NavbarSecondaryMenuFiller
      component={DocSidebarMobileSecondaryMenu}
      props={props}
    />
  );
}

export default React.memo(DocSidebarMobile);
