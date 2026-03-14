import { NextRequest, NextResponse } from "next/server";

const PLACES_TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const PHOTO_CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const photoCache = new Map<string, { photoUri: string; expiresAt: number }>();

const normalizePlaceKey = (placeName: string) => placeName.trim().toLowerCase();

const buildImageResponse = (arrayBuffer: ArrayBuffer, contentType: string) => {
  const response = new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
    },
  });
  response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=43200, stale-while-revalidate=86400");
  return response;
};

const fetchAndBuildImageResponse = async (
  imageUrl: string,
  headers?: Record<string, string>
) => {
  const imageRes = await fetch(imageUrl, {
    headers,
    cache: "no-store",
  });

  if (!imageRes.ok) {
    return null;
  }

  const arrayBuffer = await imageRes.arrayBuffer();
  const contentType = imageRes.headers.get("content-type") || "image/jpeg";

  return buildImageResponse(arrayBuffer, contentType);
};

const serveNoImage = () =>
  new NextResponse(null, {
    status: 404,
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_PLACE_API_KEY;
    if (!apiKey) {
      return serveNoImage();
    }

    const placeName = req.nextUrl.searchParams.get("placeName")?.trim();
    if (!placeName) {
      return serveNoImage();
    }

    const placeContext = req.nextUrl.searchParams.get("context")?.trim() || "";
    const textQuery = placeContext ? `${placeName}, ${placeContext}` : placeName;

    const placeKey = normalizePlaceKey(textQuery);
    const now = Date.now();
    const cached = photoCache.get(placeKey);

    if (cached && cached.expiresAt > now) {
      const cachedImage = await fetchAndBuildImageResponse(cached.photoUri);
      if (cachedImage) {
        return cachedImage;
      }
      photoCache.delete(placeKey);
    }

    if (cached && cached.expiresAt <= now) {
      photoCache.delete(placeKey);
    }

    const searchRes = await fetch(PLACES_TEXT_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.photos,places.displayName,places.id",
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: 1,
      }),
      cache: "no-store",
    });

    if (!searchRes.ok) {
      return serveNoImage();
    }

    const searchData = await searchRes.json();
    const photoName = searchData?.places?.[0]?.photos?.[0]?.name as string | undefined;

    if (!photoName) {
      return serveNoImage();
    }

    const mediaUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&maxHeightPx=800&skipHttpRedirect=true`;
    const mediaRes = await fetch(mediaUrl, {
      headers: {
        "X-Goog-Api-Key": apiKey,
      },
      cache: "no-store",
    });

    if (!mediaRes.ok) {
      return serveNoImage();
    }

    const mediaData = await mediaRes.json();
    const photoUri = mediaData?.photoUri as string | undefined;

    if (!photoUri) {
      return serveNoImage();
    }

    photoCache.set(placeKey, {
      photoUri,
      expiresAt: now + PHOTO_CACHE_TTL_MS,
    });

    const remoteImage = await fetchAndBuildImageResponse(photoUri);
    if (remoteImage) {
      return remoteImage;
    }

    return serveNoImage();
  } catch {
    return serveNoImage();
  }
}
