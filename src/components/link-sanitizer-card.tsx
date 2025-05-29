
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clipboard, Check, Youtube, AlertTriangle, RotateCcw, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const TRACKING_PARAMS_TO_REMOVE = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  '_ga', 'ga_source', 'ga_medium', 'ga_term', 'ga_content', 'ga_campaign', 'ga_place',
  'fbclid', 'gclid', 'msclkid', 'dclid', 'zanpid', 'cjevent', 'cjdata',
  'aff', 'affiliate', 'affiliate_id', 'ref', 'referral', 'source', 'trk', 'trkid',
  'trkcampaign', 'mc_cid', 'mc_eid', 'igshid', 'si', 'yclid', '_hsenc', '_hsmi',
  'hsctatracking', 'mkt_tok', 'vero_conv', 'vero_id', 'trk_contact', 'trk_msg', 'trk_module', 'trk_sid',
].map(p => p.toLowerCase());

interface SanitizeResult {
  cleaned: string;
  timestamp: string | null;
  error?: string;
  wasSanitized: boolean;
}

function sanitizeUrl(urlString: string): SanitizeResult {
  if (!urlString.trim()) {
    return { cleaned: '', timestamp: null, wasSanitized: false };
  }

  let processedUrlString = urlString;
  if (!urlString.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i)) { // Check if it has a scheme
    processedUrlString = `https://${urlString}`;
  }
  
  try {
    const url = new URL(processedUrlString);
    const queryParams = new URLSearchParams(url.search);
    const newQueryParams = new URLSearchParams();
    let youtubeTimestampSeconds: number | null = null;
    let paramRemoved = false;

    const isYoutube = url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');

    // Process query parameters
    for (const [key, value] of queryParams.entries()) {
      const lowerKey = key.toLowerCase();
      if (isYoutube && lowerKey === 't') {
        newQueryParams.append(key, value);
        const parsedTime = parseInt(value, 10);
        if (!isNaN(parsedTime)) {
            youtubeTimestampSeconds = parsedTime;
        }
      } else if (!TRACKING_PARAMS_TO_REMOVE.includes(lowerKey)) {
        newQueryParams.append(key, value);
      } else {
        paramRemoved = true;
      }
    }
    url.search = newQueryParams.toString();

    // Process hash parameters
    if (url.hash && url.hash.length > 1 && url.hash.includes('=')) { // e.g. #param=value, not just #section
      const hashContent = url.hash.substring(1); // Remove leading '#'
      const currentHashParams = new URLSearchParams(hashContent);
      const newHashParams = new URLSearchParams();
      let actualHashChangeMade = false;

      for (const [key, value] of currentHashParams.entries()) {
        const lowerKey = key.toLowerCase();
        if (TRACKING_PARAMS_TO_REMOVE.includes(lowerKey)) {
          paramRemoved = true; // A parameter (overall) was removed
          actualHashChangeMade = true; // Specifically a hash parameter was removed
        } else {
          newHashParams.append(key, value);
        }
      }

      if (actualHashChangeMade) {
        const newHashString = newHashParams.toString();
        url.hash = newHashString ? `#${newHashString}` : ''; // Set to new hash or remove if empty
      }
      // If !actualHashChangeMade, url.hash remains untouched to preserve non-parameter hashes or hashes with only non-tracking params.
    }
    
    const cleaned = url.toString();
    
    let timestampDisplay: string | null = null;
    if (youtubeTimestampSeconds !== null) {
      const hours = Math.floor(youtubeTimestampSeconds / 3600);
      const minutes = Math.floor((youtubeTimestampSeconds % 3600) / 60);
      const seconds = youtubeTimestampSeconds % 60;
      timestampDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return { cleaned, timestamp: timestampDisplay, wasSanitized: paramRemoved, error: undefined };
  } catch (e) {
     try {
        // Check if original string was already a valid URL (e.g. mailto:, custom schemes)
        // that failed with https prepended
        new URL(urlString);
        return { cleaned: urlString, timestamp: null, error: "Could not process this URL type. Displaying original.", wasSanitized: false };
    } catch (originalError) {
        return { cleaned: '', timestamp: null, error: "Invalid URL format. Please enter a valid web address.", wasSanitized: false };
    }
  }
}

export default function LinkSanitizerCard() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [cleanedUrl, setCleanedUrl] = useState('');
  const [youtubeTimestampDisplay, setYoutubeTimestampDisplay] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [wasSanitized, setWasSanitized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (originalUrl.trim() === '') {
      setCleanedUrl('');
      setYoutubeTimestampDisplay(null);
      setInputError(null);
      setWasSanitized(false);
      return;
    }

    const result = sanitizeUrl(originalUrl);
    setCleanedUrl(result.cleaned);
    setYoutubeTimestampDisplay(result.timestamp);
    setInputError(result.error || null);
    setWasSanitized(result.wasSanitized && !result.error);
  }, [originalUrl]);

  const handleCopy = useCallback(async () => {
    if (!cleanedUrl || inputError) return;
    try {
      await navigator.clipboard.writeText(cleanedUrl);
      setIsCopied(true);
      toast({
        description: (
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>Copied to clipboard!</span>
          </div>
        ),
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Error",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  }, [cleanedUrl, inputError, toast]);

  const handleReset = () => {
    setOriginalUrl('');
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Sanitize Your Link</CardTitle>
        <CardDescription>
          Paste a URL below to remove trackers and get a clean version.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="originalUrl" className="font-medium">Original URL</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="originalUrl"
              type="text" 
              placeholder="https://example.com/page?utm_source=news..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className={cn("text-base", inputError && "border-destructive focus-visible:ring-destructive")}
              aria-describedby="url-error"
              aria-invalid={!!inputError}
            />
            {originalUrl && (
              <Button variant="ghost" size="icon" onClick={handleReset} aria-label="Clear input" className="shrink-0">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
          {inputError && (
            <p id="url-error" className="text-sm text-destructive flex items-center gap-1 pt-1">
              <AlertTriangle className="h-4 w-4 shrink-0" /> 
              {inputError}
            </p>
          )}
        </div>

        {(cleanedUrl || (originalUrl.trim() !== '' && !inputError)) && (
          <div className="space-y-2 pt-2">
            <Label htmlFor="cleanedUrlOutput" className="font-medium">Cleaned URL</Label>
            {cleanedUrl && !inputError ? (
              <div className="flex items-center gap-2">
                <div 
                  id="cleanedUrlOutput"
                  className="flex-grow p-2.5 bg-muted/50 rounded-md text-sm break-all min-h-[40px] border border-input leading-normal"
                  role="textbox"
                  aria-readonly="true"
                  tabIndex={0} 
                >
                  {cleanedUrl}
                </div>
                <Button
                  onClick={handleCopy}
                  disabled={!cleanedUrl || isCopied}
                  className={cn(
                    "bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-150 ease-in-out shrink-0",
                    isCopied && "bg-green-600 hover:bg-green-700 scale-105"
                  )}
                  aria-label={isCopied ? "Copied" : "Copy cleaned URL"}
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">{isCopied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
            ) : !inputError && originalUrl.trim() !== '' && (
                 <div className="p-2.5 bg-muted/50 rounded-md text-sm text-muted-foreground min-h-[40px] border border-input">
                   Processing... or enter a valid URL.
                 </div>
            )}
            {wasSanitized && cleanedUrl && !inputError && (
              <p className="text-xs text-green-700 flex items-center gap-1 pt-1">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                Tracking parameters removed successfully.
              </p>
            )}
            {!wasSanitized && cleanedUrl && !inputError && originalUrl === cleanedUrl && (
                 <p className="text-xs text-muted-foreground pt-1">No tracking parameters found to remove.</p>
            )}
          </div>
        )}

        {youtubeTimestampDisplay && !inputError && cleanedUrl && (
          <div className="space-y-1 pt-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Youtube className="h-5 w-5 text-red-600 shrink-0" />
              <span>YouTube Timestamp Detected</span>
            </div>
            <p className="p-2 bg-muted/50 rounded-md text-sm">
              Original Timestamp: {youtubeTimestampDisplay} (hh:mm:ss)
            </p>
            <p className="text-xs text-muted-foreground">
              This timestamp has been preserved in the cleaned URL.
            </p>
          </div>
        )}
      </CardContent>
      {cleanedUrl && !inputError && <CardFooter className="text-xs text-muted-foreground pt-4">
        Share your links without the extra baggage!
      </CardFooter>}
    </Card>
  );
}
