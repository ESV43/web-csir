import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * RichText — Universal renderer for mixed plain-text + LaTeX content.
 *
 * Splits input text on:
 *   $$...$$  → display math (block, centered)
 *   $...$    → inline math
 *   \\(...\\) → inline math (alternative)
 *   \\[...\\] → display math (alternative)
 *
 * Everything else is rendered as plain text.
 * Also handles escaped dollar signs (\\$) as literal "$".
 *
 * This is the ONLY component you should use for rendering
 * questions, solutions, capsule text, pitfalls, AI responses,
 * and any content that may contain LaTeX — whether from the
 * built-in database, Google Sheets, or Gemini AI extraction.
 */

function renderMath(latex, displayMode) {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      trust: true,
      strict: 'ignore',
      output: 'html',
      macros: {
        '\\R': '\\mathbb{R}',
        '\\C': '\\mathbb{C}',
        '\\Z': '\\mathbb{Z}',
        '\\N': '\\mathbb{N}',
        '\\Q': '\\mathbb{Q}',
        '\\vec': '\\overrightarrow{#1}',
        '\\abs': '\\left|#1\\right|',
        '\\norm': '\\left\\|#1\\right\\|',
        '\\bra': '\\left\\langle#1\\right|',
        '\\ket': '\\left|#1\\right\\rangle',
        '\\braket': '\\left\\langle#1\\right|#2\\left|#3\\right\\rangle',
        '\\mat': '\\begin{pmatrix}#1\\end{pmatrix}',
        '\\d': '\\mathrm{d}',
        '\\bb': '\\mathbb{#1}',
        '\\Re': '\\mathrm{Re}',
        '\\Im': '\\mathrm{Im}',
      }
    });
  } catch (e) {
    // If KaTeX fails, return the raw latex in a code-like span so it's at least visible
    return `<span style="color:#f87171;font-family:monospace;font-size:0.85em;">${escapeHtml(latex)}</span>`;
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

/**
 * Parse text into an array of segments:
 *   { type: 'text', value: '...' }
 *   { type: 'math', value: '...', display: true/false }
 */
function parseRichText(text) {
  if (!text) return [];

  // First, normalize the text:
  // 1. Replace \R \C etc style that might come from OCR (already handled by macros)
  // 2. Some extractions use \( \) instead of $ $ — normalize to $ $
  // Sintival \( \) delimiters.
  let normalized = text
    // Normalize \( ... \) to $ ... $
    .replace(/\\\(([\s\S]*?)\)/g, (_, m) => `$${m}$`)
    // Normalize \[ ... \] to $$ ... $$
    .replace(/\\\[([\s\S]*?)\]/g, (_, m) => `$$${m}$$`)
    // Some Gemini outputs use \begina{equation}...\end{equation}
    .replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, (_, m) => `$$${m.trim()}$$`)
    .replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (_, m) => `$$${m.trim()}$$`)
    // Protect escaped dollar signs \$
    .replace(/\\\\\$/g, '\u0000DOLLAR\u0000');

  const segments = [];
  // Regex: match $$...$$ first, then $...$, and capture text in between.
  // Using \uFFFF as placeholders for protected escaped dollars.
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\n$]*?\$)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(normalized)) !== null) {
    // Text before the math
    if (match.index > lastIdx) {
      const textSegment = normalized.slice(lastIdx, match.index);
      if (textSegment) segments.push({ type: 'text', value: restoreDollars(textSegment) });
    }

    const raw = match[0];
    if (raw.startsWith('$$')) {
      // Display math
      const latex = raw.slice(2, -2).trim();
      segments.push({ type: 'math', value: latex, display: true });
    } else {
      // Inline math
      const latex = raw.slice(1, -1).trim();
      segments.push({ type: 'math', value: latex, display: false });
    }

    lastIdx = regex.lastIndex;
  }

  // Trailing text
  if (lastIdx < normalized.length) {
    const trailing = normalized.slice(lastIdx);
    if (trailing) segments.push({ type: 'text', value: restoreDollars(trailing) });
  }

  return segments;
}

function restoreDollars(text) {
  return text.replace(/\u0000DOLLAR\u0000/g, '$');
}

export default function RichText({ children, className = '', block = false }) {
  const text = typeof children === 'string' ? children : String(children || '');

  const segments = useMemo(() => parseRichText(text), [text]);

  const rendered = useMemo(() => {
    return segments.map((seg, i) => {
      if (seg.type === 'math') {
        return (
          <span
            key={i}
            className={seg.display ? 'block my-1.5 text-center overflow-x-auto' : 'inline'}
            dangerouslySetInnerHTML={{ __html: renderMath(seg.value, seg.display) }}
          />
        );
      }
      // Plain text — preserve line breaks
      return (
        <React.Fragment key={i}>
          {seg.value}
        </React.Fragment>
      );
    });
  }, [segments]);

  if (block) {
    return <div className={className}>{rendered}</div>;
  }
  return <span className={className}>{rendered}</span>;
}
