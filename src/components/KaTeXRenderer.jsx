import React, { useMemo } from 'react';
import katex from 'katex';

export default function KaTeXRenderer({ math, display = false, className = '' }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        trust: true
      });
    } catch (e) {
      return math;
    }
  }, [math, display]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
