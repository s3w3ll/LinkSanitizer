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

// Uses the microlink.io free API — CORS-enabled, no key needed for basic use.
export async function getLinkPreview(url: string): Promise<LinkPreviewResult> {
  try {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return { data: null, error: `Preview service returned status ${response.status}` };
    }

    const json = await response.json();

    if (json.status !== 'success') {
      return { data: { siteName: new URL(url).hostname }, error: 'Could not load preview.' };
    }

    const d = json.data;
    return {
      data: {
        title: d.title || undefined,
        description: d.description || undefined,
        imageUrl: d.image?.url || undefined,
        siteName: d.publisher || new URL(url).hostname,
        iconUrl: d.logo?.url || undefined,
      },
      error: null,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { data: null, error: 'Fetching preview timed out.' };
    }
    return { data: null, error: 'Could not fetch link preview.' };
  }
}
