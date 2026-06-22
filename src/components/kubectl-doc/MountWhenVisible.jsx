import React, {useEffect, useRef, useState} from 'react';

/**
 * MountWhenVisible: defer rendering children until the wrapper first becomes
 * visible. Used to host the schema explorer inside a Docusaurus <TabItem> so the
 * 87KB runtime and payload only load when the reader opens the Explorer tab.
 *
 * Inactive Docusaurus tab panels render to the DOM with `hidden`, so they have
 * no layout box and never intersect the viewport. The IntersectionObserver only
 * fires once the tab is shown, which also guarantees the explorer mounts with
 * real dimensions (mounting inside a display:none container yields a zero-size
 * root and a broken first paint).
 */
export default function MountWhenVisible({children, minHeight = 240}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} style={{minHeight}}>
      {visible ? children : null}
    </div>
  );
}
