"use client";

import { Check, Copy } from "lucide-react";
import { type ReactNode, useState } from "react";
import type { Source } from "@/lib/chat/types";
import { cn, safeHref } from "@/lib/utils";

/**
 * A deliberately small Markdown renderer for assistant answers. It builds
 * React elements directly (never HTML strings), only links to http(s) and
 * mailto, and tolerates half-streamed input such as an unclosed code fence.
 */

type Block =
  | { type: "code"; lang: string; code: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "quote"; text: string }
  | { type: "hr" }
  | { type: "p"; text: string };

const RE = {
  fence: /^```/,
  heading: /^(#{1,3})\s+(.*)$/,
  hr: /^(-{3,}|\*{3,})\s*$/,
  bullet: /^\s*[-*]\s+(.*)$/,
  ordered: /^\s*\d+[.)]\s+(.*)$/,
  tableSep: /^\|?\s*:?-{2,}/,
  quote: /^>\s?(.*)$/,
};

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

function isBlockStart(line: string, next?: string) {
  return (
    RE.fence.test(line) ||
    RE.heading.test(line) ||
    RE.hr.test(line) ||
    RE.bullet.test(line) ||
    RE.ordered.test(line) ||
    RE.quote.test(line) ||
    (line.startsWith("|") && next !== undefined && RE.tableSep.test(next))
  );
}

export function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (RE.fence.test(line)) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i] ?? "")) code.push(lines[i++] ?? "");
      i++;
      blocks.push({ type: "code", lang, code: code.join("\n") });
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = RE.heading.exec(line);
    if (heading) {
      blocks.push({
        type: "heading",
        level: (heading[1]?.length ?? 2) <= 2 ? 2 : 3,
        text: heading[2] ?? "",
      });
      i++;
      continue;
    }
    if (RE.hr.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    const listRe = RE.bullet.test(line) ? RE.bullet : RE.ordered.test(line) ? RE.ordered : null;
    if (listRe) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = listRe.exec(lines[i] ?? "");
        if (!m) break;
        items.push(m[1] ?? "");
        i++;
      }
      blocks.push({ type: "list", ordered: listRe === RE.ordered, items });
      continue;
    }
    if (line.startsWith("|") && RE.tableSep.test(lines[i + 1] ?? "")) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("|"))
        rows.push(splitRow(lines[i++] ?? ""));
      blocks.push({ type: "table", header, rows });
      continue;
    }
    if (RE.quote.test(line)) {
      const text: string[] = [];
      while (i < lines.length) {
        const m = RE.quote.exec(lines[i] ?? "");
        if (!m) break;
        text.push(m[1] ?? "");
        i++;
      }
      blocks.push({ type: "quote", text: text.join(" ") });
      continue;
    }
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !isBlockStart(lines[i] ?? "", lines[i + 1])
    ) {
      para.push(lines[i++] ?? "");
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

/* Inline ------------------------------------------------------------------ */

const INLINE =
  /(`[^`\n]+`)|(\*\*[^*\n]+?\*\*)|(\*[^*\s][^*\n]*?\*)|(\[\^\d+\])|(\[[^\]\n]+\]\([^)\s]+\))/g;

function renderInline(text: string, sources: Source[], key = ""): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const token = m[0];
    const k = `${key}${n++}`;
    if (m[1]) {
      out.push(<code key={k}>{token.slice(1, -1)}</code>);
    } else if (m[2]) {
      out.push(<strong key={k}>{renderInline(token.slice(2, -2), sources, `${k}.`)}</strong>);
    } else if (m[3]) {
      out.push(<em key={k}>{renderInline(token.slice(1, -1), sources, `${k}.`)}</em>);
    } else if (m[4]) {
      const index = Number(token.slice(2, -1));
      out.push(<CiteChip key={k} n={index} source={sources[index - 1]} />);
    } else if (m[5]) {
      const [, label = "", href = ""] = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token) ?? [];
      const safe = safeHref(href);
      out.push(
        safe ? (
          <a key={k} href={safe} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ) : (
          label
        ),
      );
    }
    last = start + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function CiteChip({ n, source }: { n: number; source?: Source }) {
  const href = source ? safeHref(source.url) : null;
  const cls =
    "mx-0.5 inline-grid h-[17px] min-w-[17px] -translate-y-[2px] place-items-center rounded-[6px] bg-white/10 px-1 align-middle font-mono text-[10px] !text-ink-2 !no-underline transition-colors hover:bg-tide/25 hover:!text-ink";
  if (!href) return <sup className={cls}>{n}</sup>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cls}
      title={source?.title}
      aria-label={`Source ${n}: ${source?.title ?? ""}`}
    >
      {n}
    </a>
  );
}

/* Code -------------------------------------------------------------------- */

const KEYWORDS =
  /^(const|let|var|function|return|export|import|from|type|interface|if|else|for|while|new|typeof|extends|as|async|await|class|throw|try|catch|default|in|of)$/;
const LITERALS = /^(true|false|null|undefined|void|unknown|number|string|boolean|this)$/;
const TOKEN =
  /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

function highlight(code: string, lang: string): ReactNode[] {
  if (!/^(ts|tsx|js|jsx|typescript|javascript)$/i.test(lang)) return [code];
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of code.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push(code.slice(last, start));
    const t = m[0];
    const cls = m[1]
      ? "text-ink-4 italic"
      : m[2]
        ? "text-[#ffc98f]"
        : m[3]
          ? "text-[#ff9ab4]"
          : KEYWORDS.test(t)
            ? "text-[#b3a9ff]"
            : LITERALS.test(t)
              ? "text-[#7fe3ff]"
              : null;
    out.push(
      cls ? (
        <span key={i++} className={cls}>
          {t}
        </span>
      ) : (
        t
      ),
    );
    last = start + t.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; nothing useful to do.
    }
  };
  return (
    <div className="overflow-hidden rounded-2xl bg-[#07080c]/80 shadow-[inset_0_0_0_1px_rgb(255_255_255/.07)]">
      <div className="flex h-10 items-center justify-between border-hairline border-b pr-1.5 pl-4">
        <span className="font-mono text-[11px] text-ink-3">{lang || "text"}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink"
        >
          {copied ? <Check className="size-3.5 text-mint" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-[1.65] text-ink/90">
        <code>{highlight(code, lang)}</code>
      </pre>
    </div>
  );
}

/* Render ------------------------------------------------------------------ */

export function Markdown({
  text,
  sources = [],
  className,
}: {
  text: string;
  sources?: Source[];
  className?: string;
}) {
  const blocks = parseBlocks(text);
  return (
    <div className={cn("prose-eps", className)}>
      {blocks.map((b, i) => {
        const key = `${b.type}${i}`;
        switch (b.type) {
          case "code":
            return <CodeBlock key={key} code={b.code} lang={b.lang} />;
          case "heading":
            return b.level === 2 ? (
              <h2 key={key}>{renderInline(b.text, sources)}</h2>
            ) : (
              <h3 key={key}>{renderInline(b.text, sources)}</h3>
            );
          case "list": {
            const Tag = b.ordered ? "ol" : "ul";
            return (
              <Tag key={key}>
                {b.items.map((item, j) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: items are positional
                  <li key={j}>{renderInline(item, sources, `${j}-`)}</li>
                ))}
              </Tag>
            );
          }
          case "table":
            return (
              <div key={key} className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      {b.header.map((h, j) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional
                        <th key={j}>{renderInline(h, sources)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, r) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional
                      <tr key={r}>
                        {row.map((cell, j) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional
                          <td key={j} className={j === 0 ? "text-ink-3" : undefined}>
                            {renderInline(cell, sources)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "quote":
            return <blockquote key={key}>{renderInline(b.text, sources)}</blockquote>;
          case "hr":
            return <hr key={key} />;
          default:
            return <p key={key}>{renderInline(b.text, sources)}</p>;
        }
      })}
    </div>
  );
}
