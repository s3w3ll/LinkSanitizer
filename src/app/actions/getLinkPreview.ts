
'use server';

import * as cheerio from 'cheerio';

interface LinkPreviewData {
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  iconUrl?: string;
}

interface LinkPreviewResult {
  data: LinkPreviewData | null;
  error: string | null;
}

export async function getLinkPreview(url: string): Promise<LinkPreviewResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LinkSanitizerPreviewBot/1.0 (+https://linksanitizer.example.com/bot)', // Be a good internet citizen
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      redirect: 'follow', // Follow redirects
      signal: AbortSignal.timeout(8000), // Timeout after 8 seconds
    });

    if (!response.ok) {
      return { data: null, error: `Failed to fetch URL: Status ${response.status}` };
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      // For non-HTML content, we could try to check if it's an image directly
      // or just return basic info. For now, we'll say it's not previewable in detail.
      if (contentType && (contentType.startsWith('image/'))) {
         return { data: { imageUrl: url, title: url.substring(url.lastIndexOf('/') + 1) }, error: null };
      }
      return { data: null, error: 'Content is not HTML, cannot generate rich preview.' };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const getMetatag = (name: string) => $(`meta[name="${name}"]`).attr('content') || $(`meta[property="og:${name}"]`).attr('content') || $(`meta[property="twitter:${name}"]`).attr('content');

    const title = getMetatag('title') || $('title').first().text() || undefined;
    const description = getMetatag('description') || undefined;
    let imageUrl = getMetatag('image') || undefined;
    const siteName = getMetatag('site_name') || new URL(url).hostname;
    
    let iconUrl = $('link[rel="shortcut icon"]').attr('href') || 
                  $('link[rel="icon"]').attr('href') || 
                  undefined;

    if (imageUrl) {
      try {
        imageUrl = new URL(imageUrl, url).href;
      } catch (e) {
        // Invalid imageUrl, ignore
        imageUrl = undefined;
      }
    }
     if (iconUrl) {
      try {
        iconUrl = new URL(iconUrl, url).href;
      } catch (e) {
        // Invalid iconUrl, ignore
        iconUrl = undefined;
      }
    } else {
        // Fallback to /favicon.ico at the domain root
        try {
            const rootFaviconUrl = new URL('/favicon.ico', url).href;
            // Check if this favicon exists (optional, could increase complexity)
            // For simplicity, we'll assume it might exist.
            iconUrl = rootFaviconUrl;
        } catch (e) {
            // ignore
        }
    }


    const previewData: LinkPreviewData = {
      title,
      description,
      imageUrl,
      siteName,
      iconUrl,
    };
    
    // Remove undefined fields
    Object.keys(previewData).forEach(key => previewData[key as keyof LinkPreviewData] === undefined && delete previewData[key as keyof LinkPreviewData]);

    if (Object.keys(previewData).length === 0 && !title && !description && !imageUrl) {
        return { data: { title: new URL(url).hostname }, error: 'No metadata found for preview.' };
    }


    return { data: previewData, error: null };

  } catch (error: any) {
    console.error('Error fetching link preview:', error);
    if (error.name === 'AbortError') {
        return { data: null, error: 'Fetching preview timed out.' };
    }
    return { data: null, error: 'Could not fetch link preview. The website might be inaccessible or block requests.' };
  }
}
