import React from 'react';
import Content from '@theme-original/DocSidebar/Desktop/Content';
import DocsSidebarControls from '@site/src/components/DocsSidebarControls';

export default function ContentWrapper(props) {
  return (
    <>
      <DocsSidebarControls />
      <Content {...props} />
    </>
  );
}
