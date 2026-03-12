import { NextRequest, NextResponse } from 'next/server';

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  url: string;
  domain?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Normalize URL
    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = `https://${url}`;
    }

    // Validate URL
    new URL(normalizedUrl);

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds

    // Fetch the HTML content
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Extract metadata using regex (simple approach)
    // For production, consider using a proper HTML parser like cheerio
    const metadata: LinkMetadata = {
      url: normalizedUrl,
      domain: new URL(normalizedUrl).hostname.replace('www.', ''),
    };

    // Extract Open Graph tags
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    const ogDescriptionMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);

    // Extract Twitter Card tags as fallback
    const twitterTitleMatch = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
    const twitterDescriptionMatch = html.match(/<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i);
    const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);

    // Extract standard meta tags as final fallback
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

    // Set metadata with priority: OG > Twitter > Standard
    metadata.title =
      ogTitleMatch?.[1] ||
      twitterTitleMatch?.[1] ||
      titleMatch?.[1]?.trim() ||
      undefined;

    metadata.description =
      ogDescriptionMatch?.[1] ||
      twitterDescriptionMatch?.[1] ||
      descriptionMatch?.[1] ||
      undefined;

    metadata.image =
      ogImageMatch?.[1] ||
      twitterImageMatch?.[1] ||
      undefined;

    // Normalize image URL (make absolute if relative)
    if (metadata.image && !metadata.image.startsWith('http')) {
      try {
        const baseUrl = new URL(normalizedUrl);
        metadata.image = new URL(metadata.image, baseUrl.origin).href;
      } catch {
        // If URL construction fails, keep original
      }
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error fetching link metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link metadata' },
      { status: 500 }
    );
  }
}
