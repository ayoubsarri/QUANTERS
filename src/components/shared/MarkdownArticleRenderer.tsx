"use client";

import React, { useMemo } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";

interface MarkdownArticleRendererProps {
  content: string;
  className?: string;
}

/**
 * High-performance, zero-dependency Markdown parser and renderer.
 * Accurately parses:
 * - Headings (#, ##, ###, ####)
 * - Blockquotes (>)
 * - Ordered & Unordered lists (- , * , 1. , 2. )
 * - Preformatted code blocks (```lang ... ```)
 * - Horizontal rules (---, ***)
 * - Inline formatting:
 *   - **bold** or __bold__
 *   - *italic* or _italic_
 *   - <u>underline</u>
 *   - ~~strikethrough~~
 *   - `inline code`
 *   - [link](url)
 */
export function MarkdownArticleRenderer({ content, className = "" }: MarkdownArticleRendererProps) {
  const renderedElements = useMemo(() => {
    if (!content || !content.trim()) return null;

    // Normalize line endings
    const normalized = content.replace(/\r\n/g, "\n");
    const lines = normalized.split("\n");

    const blocks: React.ReactNode[] = [];
    let i = 0;
    let blockIndex = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 1. Code blocks (```)
      if (line.trim().startsWith("```")) {
        const lang = line.trim().replace(/^```/, "").trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        const codeText = codeLines.join("\n");
        blocks.push(
          <CodeBlockElement key={`code-${blockIndex++}`} code={codeText} language={lang} />
        );
        continue;
      }

      // 2. Horizontal Rule (--- or ***)
      if (/^(\s*[-*_]\s*){3,}$/.test(line.trim())) {
        blocks.push(
          <hr key={`hr-${blockIndex++}`} className="my-5 border-t border-slate-200" />
        );
        i++;
        continue;
      }

      // 3. Headings (#, ##, ###, ####)
      const h1Match = line.match(/^#\s+(.+)$/);
      if (h1Match) {
        blocks.push(
          <h1
            key={`h1-${blockIndex++}`}
            className="font-display text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight mt-5 mb-2 leading-tight"
          >
            {renderInlineMarkdown(h1Match[1])}
          </h1>
        );
        i++;
        continue;
      }

      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        blocks.push(
          <h2
            key={`h2-${blockIndex++}`}
            className="font-display text-base sm:text-lg font-black text-[#0F1E36] tracking-tight mt-4 mb-2 pb-1.5 border-b border-slate-100 flex items-center gap-2"
          >
            <span className="w-1.5 h-4 rounded-full bg-[#0284C7] inline-block shrink-0" />
            <span>{renderInlineMarkdown(h2Match[1])}</span>
          </h2>
        );
        i++;
        continue;
      }

      const h3Match = line.match(/^###\s+(.+)$/);
      if (h3Match) {
        blocks.push(
          <h3
            key={`h3-${blockIndex++}`}
            className="font-display text-sm sm:text-base font-bold text-[#182C4E] mt-3 mb-1"
          >
            {renderInlineMarkdown(h3Match[1])}
          </h3>
        );
        i++;
        continue;
      }

      const h4Match = line.match(/^####\s+(.+)$/);
      if (h4Match) {
        blocks.push(
          <h4
            key={`h4-${blockIndex++}`}
            className="font-sans text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide mt-2 mb-1"
          >
            {renderInlineMarkdown(h4Match[1])}
          </h4>
        );
        i++;
        continue;
      }

      // 4. Blockquotes (> ...)
      if (line.trim().startsWith(">")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        blocks.push(
          <blockquote
            key={`quote-${blockIndex++}`}
            className="border-l-4 border-[#0284C7] bg-gradient-to-r from-sky-50/80 to-transparent p-3 sm:p-3.5 rounded-r-2xl italic text-slate-800 font-editorial text-xs sm:text-sm leading-relaxed my-3 shadow-2xs"
          >
            {renderInlineMarkdown(quoteLines.join(" "))}
          </blockquote>
        );
        continue;
      }

      // 5. Unordered List (- or *)
      if (/^\s*[-*]\s+/.test(line)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          listItems.push(lines[i].replace(/^\s*[-*]\s+/, ""));
          i++;
        }
        blocks.push(
          <ul
            key={`ul-${blockIndex++}`}
            className="space-y-1.5 my-2.5 pl-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans"
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] mt-1.5 shrink-0" />
                <span className="min-w-0">{renderInlineMarkdown(item)}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // 6. Ordered List (1. , 2. )
      if (/^\s*\d+\.\s+/.test(line)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          listItems.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
          i++;
        }
        blocks.push(
          <ol
            key={`ol-${blockIndex++}`}
            className="space-y-1.5 my-2.5 pl-1 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans"
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-mono font-bold text-[11px] text-[#0284C7] min-w-5 shrink-0">
                  {idx + 1}.
                </span>
                <span className="min-w-0">{renderInlineMarkdown(item)}</span>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // 7. Empty line
      if (!line.trim()) {
        i++;
        continue;
      }

      // 8. Regular paragraph
      const paraLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].trim().startsWith("```") &&
        !lines[i].trim().startsWith("#") &&
        !lines[i].trim().startsWith(">") &&
        !/^\s*[-*]\s+/.test(lines[i]) &&
        !/^\s*\d+\.\s+/.test(lines[i]) &&
        !/^(\s*[-*_]\s*){3,}$/.test(lines[i].trim())
      ) {
        paraLines.push(lines[i]);
        i++;
      }

      if (paraLines.length > 0) {
        blocks.push(
          <p
            key={`p-${blockIndex++}`}
            className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans my-2"
          >
            {renderInlineMarkdown(paraLines.join(" "))}
          </p>
        );
      }
    }

    return blocks;
  }, [content]);

  return <div className={`space-y-1.5 ${className}`}>{renderedElements}</div>;
}

/**
 * Interactive Code Block with Copy Button
 */
function CodeBlockElement({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden bg-[#0A1628] border border-[#2B4875]/70 my-3 text-xs shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#070F1C] border-b border-[#2B4875]/40 text-slate-400 font-mono text-[10px]">
        <span className="uppercase tracking-wider font-bold text-[#7DD3FC]">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto font-mono text-[11px] text-slate-200 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Tokenize and render inline formatting:
 * **bold**, *italic*, <u>underline</u>, ~~strikethrough~~, `code`, [link](url)
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return "";

  // Regex matching inline formatting tokens
  // 1: `code`
  // 2: **bold** or __bold__
  // 3: *italic* or _italic_
  // 4: <u>underline</u>
  // 5: ~~strikethrough~~
  // 6: [link text](url)
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*[^*]+\*(?!\*)|(?<!_)_[^_]+_(?!_)|<u>.*?<\/u>|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;

  const parts = text.split(pattern);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Inline Code
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[#0284C7] font-mono text-[11px] font-bold border border-slate-200/80"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
    ) {
      return (
        <strong key={idx} className="font-extrabold text-[#0F1E36]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic
    if (
      (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
      (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
    ) {
      return (
        <em key={idx} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Underline
    if (part.startsWith("<u>") && part.endsWith("</u>") && part.length >= 7) {
      return (
        <u key={idx} className="underline underline-offset-2 decoration-[#0284C7]">
          {part.slice(3, -4)}
        </u>
      );
    }

    // Strikethrough
    if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
      return (
        <del key={idx} className="line-through text-slate-400">
          {part.slice(2, -2)}
        </del>
      );
    }

    // Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const rawHref = linkMatch[2].trim();
      const isSafe = /^(https?:\/\/|mailto:|#)/i.test(rawHref) && !/^(javascript|vbscript|data):/i.test(rawHref);
      const safeHref = isSafe ? rawHref : "#";
      return (
        <a
          key={idx}
          href={safeHref}
          target={safeHref.startsWith("#") ? undefined : "_blank"}
          rel={safeHref.startsWith("#") ? undefined : "noopener noreferrer"}
          className="inline-flex items-center gap-0.5 text-[#0284C7] hover:text-[#0369a1] font-semibold underline underline-offset-2 transition"
        >
          <span>{linkText}</span>
          {safeHref !== "#" && !safeHref.startsWith("#") && (
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          )}
        </a>
      );
    }

    return part;
  });
}
