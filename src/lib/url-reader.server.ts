export type PageRead = { ok: true; title: string; text: string } | { ok: false; reason: string };

const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$)/i;

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

/** Fetches a public web page and extracts its readable text. Never fabricates content. */
export async function readUrl(raw: string): Promise<PageRead> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "the link doesn't look valid" };
  }
  if (!/^https?:$/.test(url.protocol) || PRIVATE_HOST.test(url.hostname)) return { ok: false, reason: "that address isn't a public web page" };
  let res: Response;
  try {
    res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; McFlowReader/1.0)", Accept: "text/html,text/plain;q=0.9" },
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    return { ok: false, reason: "the site didn't respond" };
  }
  if (!res.ok) return { ok: false, reason: `the site refused the request (error ${res.status})` };
  const type = res.headers.get("content-type") ?? "";
  if (!/text\/html|text\/plain|xhtml/i.test(type)) return { ok: false, reason: "it isn't a regular web page (it may be a PDF or other file)" };
  const html = (await res.text()).slice(0, 3_000_000);
  const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? url.hostname);
  const body = html.match(/<(article|main)[\s\S]*<\/\1>/i)?.[0] ?? html;
  const text = decode(
    body
      .replace(/<(script|style|noscript|svg|nav|footer|header|form|iframe|aside)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<br\s*\/?>|<\/(p|div|h[1-6]|li|tr|section|article|blockquote)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
  if (text.length < 400) return { ok: false, reason: "there was too little readable text on the page" };
  return { ok: true, title, text: text.slice(0, 24000) };
}
