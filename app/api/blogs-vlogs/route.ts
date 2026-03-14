import { NextResponse } from "next/server";

type FeedItem = {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  thumbnail?: string;
};

type BlogSourceFilter = "mixed" | "reddit" | "youtube";

type RedditListing = {
  data?: {
    children?: Array<{
      data?: {
        title?: string;
        selftext?: string;
        permalink?: string;
        created_utc?: number;
        subreddit_name_prefixed?: string;
        thumbnail?: string;
        preview?: {
          images?: Array<{
            source?: {
              url?: string;
            };
          }>;
        };
      };
    }>;
  };
};

type YtSearchVideo = {
  videoId: string;
  title?: string;
  channel?: string;
  publishedText?: string;
};

const stripHtml = (text: string): string =>
  text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const decodeHtml = (text: string): string =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

const toHttps = (url: string): string =>
  url.startsWith("http://") ? `https://${url.slice("http://".length)}` : url;

const normalizeThumbnailUrl = (value?: string | null, baseUrl?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const decoded = decodeHtml(value).trim();
  if (!decoded) {
    return undefined;
  }

  try {
    if (decoded.startsWith("//")) {
      return toHttps(`https:${decoded}`);
    }

    if (decoded.startsWith("/")) {
      if (!baseUrl) {
        return undefined;
      }

      const joined = new URL(decoded, baseUrl).toString();
      return toHttps(joined);
    }

    const url = new URL(decoded);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }

    return toHttps(url.toString());
  } catch {
    return undefined;
  }
};

const isValidUrl = (value?: string | null): value is string => {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const normalizeDate = (input?: string | number | null): string => {
  if (!input) {
    return new Date().toISOString();
  }

  const value = typeof input === "number" ? input * 1000 : Date.parse(input);
  if (!Number.isFinite(value)) {
    return new Date().toISOString();
  }

  return new Date(value).toISOString();
};

const normalizeSourceLabel = (source: string): string => source.replace(/^r\//i, "r/");

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

const TRAVEL_TOKENS = new Set([
  "travel",
  "trip",
  "guide",
  "itinerary",
  "backpacking",
  "vacation",
  "tour",
  "solo",
  "budget",
  "hotel",
  "flight",
  "food",
  "city",
  "country",
  "beach",
  "mountain",
  "hiking",
  "road",
  "journey",
]);

const scoreRelevance = (item: FeedItem, query: string): number => {
  const queryTokens = tokenize(query);
  const titleTokens = tokenize(item.title);
  const descTokens = tokenize(item.description);
  const sourceTokens = tokenize(item.source);

  let score = 0;

  for (const token of queryTokens) {
    if (titleTokens.includes(token)) {
      score += 7;
    }
    if (descTokens.includes(token)) {
      score += 3;
    }
    if (sourceTokens.includes(token)) {
      score += 2;
    }
  }

  for (const token of titleTokens) {
    if (TRAVEL_TOKENS.has(token)) {
      score += 1.5;
    }
  }

  for (const token of descTokens) {
    if (TRAVEL_TOKENS.has(token)) {
      score += 0.6;
    }
  }

  const link = item.link.toLowerCase();
  if (link.includes("youtube") || link.includes("youtu.be")) {
    score += 2;
  }

  return score;
};

const dedupeByLink = (items: FeedItem[]): FeedItem[] => {
  const seen = new Set<string>();
  const deduped: FeedItem[] = [];

  for (const item of items) {
    if (seen.has(item.link)) {
      continue;
    }

    seen.add(item.link);
    deduped.push(item);
  }

  return deduped;
};

const parseBlogSourceFilter = (value: string | null): BlogSourceFilter => {
  const normalized = (value || "mixed").trim().toLowerCase();
  if (normalized === "reddit" || normalized === "youtube") {
    return normalized;
  }
  return "mixed";
};

const fetchRedditBlogs = async (query: string): Promise<FeedItem[]> => {
  const subreddits = ["travel", "solotravel", "backpacking", "digitalnomad"];

  const responses = await Promise.allSettled(
    subreddits.map((subreddit) => {
      const q = encodeURIComponent(`${query} travel itinerary OR guide OR tips`);
      const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${q}&restrict_sr=on&sort=relevance&t=year&limit=25`;
      return fetch(url, {
        headers: {
          "User-Agent": "TravelLoop/1.0",
        },
        next: { revalidate: 1800 },
      });
    })
  );

  const items: FeedItem[] = [];

  for (const result of responses) {
    if (result.status !== "fulfilled" || !result.value.ok) {
      continue;
    }

    const json = (await result.value.json()) as RedditListing;
    const posts = json?.data?.children ?? [];

    for (const post of posts) {
      const data = post.data;
      if (!data?.title || !data.permalink) {
        continue;
      }

      const previewImage = data.preview?.images?.[0]?.source?.url;
      const thumb = data.thumbnail && isValidUrl(data.thumbnail) ? data.thumbnail : previewImage;

      items.push({
        title: data.title,
        description: stripHtml(data.selftext || "Community travel discussion and tips."),
        link: `https://www.reddit.com${data.permalink}`,
        pubDate: normalizeDate(data.created_utc),
        source: normalizeSourceLabel(data.subreddit_name_prefixed || "r/travel"),
        thumbnail: normalizeThumbnailUrl(thumb),
      });
    }
  }

  return items;
};

const decodeUnicodeEscapes = (text: string): string =>
  text.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));

const parseYoutubeSearchPage = (html: string): YtSearchVideo[] => {
  const candidates = html.match(/\{"videoId":"[a-zA-Z0-9_-]{11}"[\s\S]*?\}\}\}\}/g) ?? [];
  const seen = new Set<string>();
  const videos: YtSearchVideo[] = [];

  for (const block of candidates) {
    const idMatch = block.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (!idMatch?.[1]) {
      continue;
    }

    const videoId = idMatch[1];
    if (seen.has(videoId)) {
      continue;
    }

    const titleMatch = block.match(/"title":\{"runs":\[\{"text":"([\s\S]*?)"\}\]\}/);
    const channelMatch = block.match(/"ownerText":\{"runs":\[\{"text":"([\s\S]*?)"\}\]\}/);
    const publishedMatch = block.match(/"publishedTimeText":\{"simpleText":"([\s\S]*?)"\}/);

    seen.add(videoId);
    videos.push({
      videoId,
      title: titleMatch?.[1] ? decodeUnicodeEscapes(decodeHtml(titleMatch[1])) : undefined,
      channel: channelMatch?.[1] ? decodeUnicodeEscapes(decodeHtml(channelMatch[1])) : undefined,
      publishedText: publishedMatch?.[1]
        ? decodeUnicodeEscapes(decodeHtml(publishedMatch[1]))
        : undefined,
    });
  }

  return videos;
};

const fetchYoutubeVlogs = async (query: string, limit: number): Promise<FeedItem[]> => {
  const q = encodeURIComponent(`${query} travel vlog`);
  const url = `https://www.youtube.com/results?search_query=${q}&sp=EgIQAQ%253D%253D&hl=en`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    return [];
  }

  const html = await res.text();
  const parsed = parseYoutubeSearchPage(html).slice(0, limit);

  return parsed.map((video) => ({
    title: video.title || "YouTube Travel Vlog",
    description: video.channel
      ? `Video by ${video.channel}${video.publishedText ? ` · ${video.publishedText}` : ""}`
      : "Travel video",
    link: `https://www.youtube.com/watch?v=${video.videoId}`,
    pubDate: new Date().toISOString(),
    source: video.channel ? `YouTube · ${video.channel}` : "YouTube",
    thumbnail: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
  }));
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "India").trim();
    const blogSource = parseBlogSourceFilter(searchParams.get("blogSource"));
    const rawLimit = Number(searchParams.get("limit") || "48");
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.floor(rawLimit), 6), 100)
      : 48;

    const [redditBlogs, youtubeVideos] = await Promise.all([
      blogSource === "youtube" ? Promise.resolve([]) : fetchRedditBlogs(q),
      fetchYoutubeVlogs(q, limit),
    ]);

    const blogsPool =
      blogSource === "reddit"
        ? redditBlogs
        : blogSource === "youtube"
          ? youtubeVideos
          : [...redditBlogs, ...youtubeVideos];

    const blogs = dedupeByLink(blogsPool)
      .sort((a, b) => scoreRelevance(b, q) - scoreRelevance(a, q))
      .slice(0, limit);

    const vlogs = dedupeByLink(youtubeVideos)
      .sort((a, b) => scoreRelevance(b, q) - scoreRelevance(a, q))
      .slice(0, limit);

    return NextResponse.json({
      status: "ok",
      query: q,
      blogSource,
      blogs,
      vlogs,
    });
  } catch (error) {
    console.error("[blogs-vlogs] failed", error);
    return NextResponse.json(
      { status: "error", message: "Failed to load blogs and vlogs" },
      { status: 500 }
    );
  }
}
