'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

// Shows a clipped preview of its content with a "Show more" toggle. The
// toggle only appears when the content is actually taller than the preview.
export default function Collapsible({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={ref}
        className={`collapsible${expanded ? ' collapsible-expanded' : ''}${overflows && !expanded ? ' collapsible-faded' : ''}`}
      >
        {children}
      </div>
      {(overflows || expanded) && (
        <button type="button" className="collapsible-toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Show less ▲' : 'Show more ▼'}
        </button>
      )}
    </>
  );
}
