
"use client";

import type { FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Globe } from 'lucide-react';
import Image from 'next/image'; // Using next/image for optimized images if possible

interface LinkPreviewData {
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  iconUrl?: string;
}

interface LinkPreviewDisplayProps {
  isLoading: boolean;
  error: string | null;
  data: LinkPreviewData | null;
  url: string; // The original cleaned URL for context/fallback
}

const LinkPreviewDisplay: FC<LinkPreviewDisplayProps> = ({ isLoading, error, data, url }) => {
  if (isLoading) {
    return (
      <Card className="mt-4 w-full shadow-md">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-40 w-full rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
            <Skeleton className="h-3 w-1/3 rounded mt-1" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !data?.title) { // Show error prominently if no partial data
    return (
      <Card className="mt-4 w-full shadow-md border-destructive">
        <CardContent className="p-4 text-destructive flex flex-col items-center text-center">
          <AlertTriangle className="h-10 w-10 mb-2" />
          <p className="font-semibold">Could not load preview</p>
          <p className="text-sm">{error}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-2 block truncate"
          >
            {url}
          </a>
        </CardContent>
      </Card>
    );
  }
  
  const displayData = data || { title: new URL(url).hostname }; // Fallback to hostname if data is null but no error

  return (
    <Card className="mt-4 w-full shadow-md overflow-hidden">
      {displayData.imageUrl ? (
         <div className="relative w-full h-48 bg-muted">
            <img
                src={displayData.imageUrl}
                alt={displayData.title || 'Link preview image'}
                className="object-cover w-full h-full"
                data-ai-hint="website screenshot"
             />
        </div>
      ) : error && ( /* Show small error indicator if image failed but other data exists */
        <div className="p-2 bg-muted/50 text-center text-xs text-muted-foreground">
          <AlertTriangle className="inline h-3 w-3 mr-1" /> Image unavailable
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
            {displayData.iconUrl ? (
                <img src={displayData.iconUrl} alt="" className="h-4 w-4" data-ai-hint="website favicon" />
            ) : (
                <Globe className="h-4 w-4" />
            )}
            <span>{displayData.siteName || new URL(url).hostname}</span>
        </div>
        {displayData.title && (
          <h3 className="font-semibold text-lg text-foreground mb-1 leading-tight">
            {displayData.title}
          </h3>
        )}
        {displayData.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {displayData.description}
          </p>
        )}
         {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </CardContent>
      <CardFooter className="bg-muted/30 p-2 px-4 border-t">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline truncate block w-full"
        >
          {url}
        </a>
      </CardFooter>
    </Card>
  );
};

export default LinkPreviewDisplay;

