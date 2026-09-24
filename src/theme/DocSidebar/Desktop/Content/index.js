import React from 'react';
import Content from '@theme-original/DocSidebar/Desktop/Content';
import DocsSidebarControls from '@site/src/components/DocsSidebarControls';
import sharedSidebarShell from '@site/src/config/sidebarShell.json';

function withSharedShell(sidebar) {
  const hasSharedShell = sidebar.some((item) =>
    item.className?.split(' ').includes('sidebar-shell-heading'),
  );

  return hasSharedShell ? sidebar : [...sharedSidebarShell, ...sidebar];
}

export default function ContentWrapper(props) {
  return (
    <>
      <DocsSidebarControls />
      <Content {...props} sidebar={withSharedShell(props.sidebar)} />
    </>
  );
}
