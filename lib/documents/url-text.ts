const MAX_CONTENT_LENGTH = 500_000;

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host === "0.0.0.0" ||
    host === "[::1]"
  ) {
    return true;
  }

  if (/^127\.\d+\.\d+\.\d+$/.test(host)) return true;
  if (/^10\.\d+\.\d+\.\d+$/.test(host)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(host)) return true;

  return false;
}

export function assertPublicHttpUrl(urlString: string): URL {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error("Enter a valid URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https links are supported.");
  }

  if (isBlockedHost(url.hostname)) {
    throw new Error("That URL cannot be used.");
  }

  return url;
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateContent(content: string): string {
  if (content.length <= MAX_CONTENT_LENGTH) return content;
  return `${content.slice(0, MAX_CONTENT_LENGTH)}\n\n[Content truncated for length.]`;
}

export async function fetchUrlAsText(
  urlString: string,
): Promise<{ title: string; content: string }> {
  const url = assertPublicHttpUrl(urlString);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "text/html,text/plain;q=0.9,*/*;q=0.1",
      "User-Agent": "LangTutorBot/1.0 (+https://lang-tutor.local)",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Could not fetch that page (HTTP ${response.status}).`);
  }

  const raw = await response.text();
  const contentType = response.headers.get("content-type") ?? "";

  let content: string;
  if (contentType.includes("text/html")) {
    content = htmlToPlainText(raw);
  } else {
    content = raw.trim();
  }

  if (!content) {
    throw new Error("No readable text was found at that URL.");
  }

  const titleMatch = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titleFromHtml = titleMatch?.[1]?.replace(/\s+/g, " ").trim();
  const title = titleFromHtml || url.hostname;

  return {
    title: title.slice(0, 200),
    content: truncateContent(content),
  };
}
