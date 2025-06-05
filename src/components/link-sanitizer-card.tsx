
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Check, Youtube, AlertTriangle, RotateCcw, Sparkles, Settings, Trash2, X, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { getLinkPreview } from '@/app/actions/getLinkPreview';
import LinkPreviewDisplay from '@/components/ui/link-preview-display';

// This is the global default list of tracking parameters.
// It's used as the starting point for new users or when a user's localStorage is cleared.
// To change the default list that all users start with (if they haven't customized their own),
// you would modify this array directly in the code.
const DEFAULT_TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  '_ga', 'ga_source', 'ga_medium', 'ga_term', 'ga_content', 'ga_campaign', 'ga_place',
  'fbclid', 'gclid', 'msclkid', 'dclid', 'zanpid', 'cjevent', 'cjdata',
  'aff', 'affiliate', 'affiliate_id', 'ref', 'referral', 'source', 'trk', 'trkid',
  'trkcampaign', 'mc_cid', 'mc_eid', 'igshid', 'si', 'yclid', '_hsenc', '_hsmi',
  'hsctatracking', 'mkt_tok', 'vero_conv', 'vero_id', 'trk_contact', 'trk_msg', 'trk_module', 'trk_sid', 'echobox', 'cid', 'gad_campaignid', 'gbraid', 'gad_source', 'gclsrc',
].map(p => p.toLowerCase());

const LOCALSTORAGE_PARAMS_KEY = 'linkSanitizer_customTrackingParams';

interface SanitizeResult {
  cleaned: string;
  timestamp: string | null;
  error?: string;
  wasSanitized: boolean;
  suggestedParams?: string[];
}

interface LinkPreviewData {
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  iconUrl?: string;
}

function sanitizeUrl(urlString: string, trackingParamsToRemove: string[]): SanitizeResult {
  if (!urlString.trim()) {
    return { cleaned: '', timestamp: null, wasSanitized: false, suggestedParams: [] };
  }

  let processedUrlString = urlString;
  if (!urlString.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i)) {
    processedUrlString = `https://${urlString}`;
  }

  try {
    const url = new URL(processedUrlString);
    const queryParams = new URLSearchParams(url.search);
    const newQueryParams = new URLSearchParams();
    let youtubeTimestampSeconds: number | null = null;
    let paramRemoved = false;
    const foundNonBlockedQueryKeys = new Set<string>();

    const lowercasedTrackingParams = trackingParamsToRemove.map(p => p.toLowerCase());
    const isYoutube = url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');

    for (const [key, value] of queryParams.entries()) {
      const lowerKey = key.toLowerCase();
      if (isYoutube && lowerKey === 't') {
        newQueryParams.append(key, value);
        const parsedTime = parseInt(value, 10);
        if (!isNaN(parsedTime)) {
          youtubeTimestampSeconds = parsedTime;
        }
      } else if (!lowercasedTrackingParams.includes(lowerKey)) {
        newQueryParams.append(key, value);
        foundNonBlockedQueryKeys.add(key);
      } else {
        paramRemoved = true;
      }
    }
    url.search = newQueryParams.toString();

    const foundNonBlockedHashKeys = new Set<string>();
    if (url.hash && url.hash.length > 1 && url.hash.includes('=')) {
      const hashContent = url.hash.substring(1);
      const currentHashParams = new URLSearchParams(hashContent);
      const newHashParams = new URLSearchParams();
      let actualHashChangeMade = false;

      for (const [key, value] of currentHashParams.entries()) {
        const lowerKey = key.toLowerCase();
        if (lowercasedTrackingParams.includes(lowerKey)) {
          paramRemoved = true;
          actualHashChangeMade = true;
        } else {
          newHashParams.append(key, value);
          foundNonBlockedHashKeys.add(key);
        }
      }

      if (actualHashChangeMade) {
        const newHashString = newHashParams.toString();
        url.hash = newHashString ? `#${newHashString}` : '';
      }
    }
    
    const cleaned = url.toString();

    let timestampDisplay: string | null = null;
    if (youtubeTimestampSeconds !== null) {
      const hours = Math.floor(youtubeTimestampSeconds / 3600);
      const minutes = Math.floor((youtubeTimestampSeconds % 3600) / 60);
      const seconds = youtubeTimestampSeconds % 60;
      timestampDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const suggestedParams = Array.from(new Set([...foundNonBlockedQueryKeys, ...foundNonBlockedHashKeys]));

    return { cleaned, timestamp: timestampDisplay, wasSanitized: paramRemoved, error: undefined, suggestedParams };
  } catch (e) {
    try {
      new URL(urlString); 
      return { cleaned: urlString, timestamp: null, error: "Could not process this URL type. Displaying original.", wasSanitized: false, suggestedParams: [] };
    } catch (originalError) {
      return { cleaned: '', timestamp: null, error: "Invalid URL format. Please enter a valid web address.", wasSanitized: false, suggestedParams: [] };
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
  const [suggestedParams, setSuggestedParams] = useState<string[]>([]);

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [trackingParams, setTrackingParams] = useState<string[]>(DEFAULT_TRACKING_PARAMS);
  const [newParameterInput, setNewParameterInput] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedParams = localStorage.getItem(LOCALSTORAGE_PARAMS_KEY);
      if (storedParams) {
        const parsedParams = JSON.parse(storedParams);
        if (Array.isArray(parsedParams) && parsedParams.every(p => typeof p === 'string')) {
          setTrackingParams(parsedParams);
        }
      }
    } catch (error) {
      console.error("Error loading tracking params from localStorage:", error);
      setTrackingParams(DEFAULT_TRACKING_PARAMS);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCALSTORAGE_PARAMS_KEY, JSON.stringify(trackingParams));
    } catch (error) {
      console.error("Error saving tracking params to localStorage:", error);
      toast({
        title: "Error",
        description: "Could not save custom tracking parameters. Your changes might not persist.",
        variant: "destructive",
      });
    }
  }, [trackingParams, toast]);

  const fetchPreviewData = useCallback(async () => {
    if (!cleanedUrl || inputError) {
      setShowPreview(false);
      setPreviewData(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
      return;
    }
    setIsPreviewLoading(true);
    setPreviewError(null);
    setPreviewData(null);
    setShowPreview(true); 

    try {
      const result = await getLinkPreview(cleanedUrl);
      if (result.data) {
        setPreviewData(result.data);
      } else {
        setPreviewData(null);
      }
      setPreviewError(result.error);
    } catch (e: any) {
      console.error("Error calling getLinkPreview:", e);
      setPreviewData(null);
      setPreviewError("An unexpected error occurred while fetching preview.");
    } finally {
      setIsPreviewLoading(false);
    }
  }, [cleanedUrl, inputError]);


  useEffect(() => {
    if (originalUrl.trim() === '') {
      setCleanedUrl('');
      setYoutubeTimestampDisplay(null);
      setInputError(null);
      setWasSanitized(false);
      setShowPreview(false);
      setPreviewData(null);
      setIsPreviewLoading(false);
      setPreviewError(null);
      setSuggestedParams([]);
      return;
    }

    const result = sanitizeUrl(originalUrl, trackingParams);
    setCleanedUrl(result.cleaned);
    setYoutubeTimestampDisplay(result.timestamp);
    setInputError(result.error || null);
    setWasSanitized(result.wasSanitized && !result.error);
    setSuggestedParams(result.suggestedParams || []);

    if (result.cleaned && !result.error) {
      fetchPreviewData();
    } else {
      setShowPreview(false);
      setPreviewData(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
    }
  }, [originalUrl, trackingParams, fetchPreviewData]);


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

  const handleResetOriginalUrl = () => {
    setOriginalUrl('');
  };

  const handleAddParameter = () => {
    const paramToAdd = newParameterInput.trim().toLowerCase();
    if (paramToAdd && !trackingParams.includes(paramToAdd)) {
      setTrackingParams(prevParams => [...prevParams, paramToAdd].sort());
      setNewParameterInput('');
      toast({ description: `Parameter "${paramToAdd}" added to block list.` });
    } else if (trackingParams.includes(paramToAdd)) {
      toast({ description: `Parameter "${paramToAdd}" is already in the block list.`, variant: "default" });
    } else if (!paramToAdd) {
       toast({ description: "Parameter cannot be empty.", variant: "destructive" });
    }
  };
  
  const handleQuickAddParameter = (paramToAdd: string) => {
    const lowerParamToAdd = paramToAdd.toLowerCase();
    if (lowerParamToAdd && !trackingParams.includes(lowerParamToAdd)) {
      setTrackingParams(prevParams => [...prevParams, lowerParamToAdd].sort());
      toast({ description: `Parameter "${lowerParamToAdd}" added to block list.` });
      // Suggested params will update automatically on re-sanitize
    }
  };

  const handleRemoveParameter = (paramToRemove: string) => {
    setTrackingParams(prevParams => prevParams.filter(p => p !== paramToRemove));
    toast({ description: `Parameter "${paramToRemove}" removed from block list.` });
  };

  const handleResetToDefaults = () => {
    setTrackingParams(DEFAULT_TRACKING_PARAMS);
    toast({ description: "Tracking parameters reset to defaults." });
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
              <Button variant="ghost" size="icon" onClick={handleResetOriginalUrl} aria-label="Clear input" className="shrink-0">
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

        {suggestedParams.length > 0 && !inputError && cleanedUrl && (
          <div className="pt-4 space-y-2">
            <Label className="font-medium text-sm">Potential trackers found in this URL:</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedParams.map((param) => (
                <Badge key={param} variant="outline" className="py-1 px-2.5 text-xs items-center">
                  <span className="mr-1.5">{param}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuickAddParameter(param)}
                    className="h-5 w-5 hover:bg-primary/10 p-0.5 rounded-full"
                    aria-label={`Add ${param} to block list`}
                  >
                    <PlusCircle className="h-4 w-4 text-primary hover:text-primary/80" />
                  </Button>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Click the <PlusCircle className="inline h-3 w-3 align-middle" /> to add them to your personal block list.</p>
          </div>
        )}

        {showPreview && cleanedUrl && !inputError && (
          <LinkPreviewDisplay
            isLoading={isPreviewLoading}
            error={previewError}
            data={previewData}
            url={cleanedUrl}
          />
        )}

        {youtubeTimestampDisplay && !inputError && cleanedUrl && (
          <div className="space-y-1 pt-4">
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

        <Accordion type="single" collapsible className="w-full pt-4">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base hover:no-underline">
                <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Manage Blocked Parameters
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div>
                <Label htmlFor="newParameter" className="font-medium">Add New Parameter to Block</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="newParameter"
                    type="text"
                    placeholder="e.g., my_tracker"
                    value={newParameterInput}
                    onChange={(e) => setNewParameterInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddParameter(); }}
                    className="text-sm"
                  />
                  <Button onClick={handleAddParameter} className="shrink-0">Add</Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label className="font-medium">Currently Blocked Parameters ({trackingParams.length})</Label>
                    <Button variant="outline" size="sm" onClick={handleResetToDefaults} className="text-xs">
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Reset to Defaults
                    </Button>
                </div>
                {trackingParams.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30 max-h-60 overflow-y-auto">
                    {trackingParams.map((param) => (
                      <Badge key={param} variant="secondary" className="text-sm font-normal py-1 px-2.5 items-center">
                        <span className="mr-1.5">{param}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveParameter(param)}
                          className="h-5 w-5 p-0.5 rounded-full hover:bg-destructive/20"
                          aria-label={`Remove ${param}`}
                        >
                          <X className="h-3.5 w-3.5 text-destructive/80 hover:text-destructive" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/30">No tracking parameters are currently being blocked.</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </CardContent>
      {cleanedUrl && !inputError && <CardFooter className="text-xs text-muted-foreground pt-4">
        Share your links without the extra baggage!
      </CardFooter>}
    </Card>
  );
}
