import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, AlertCircle, Info } from "lucide-react";
import { useWikipedia, WikipediaData } from "@/hooks/useWikipedia";

interface WikipediaInfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  year?: string;
  mediaType: 'movie' | 'tv';
}

// Category configuration with display order and icons
const CATEGORY_CONFIG: { [key: string]: { order: number; keywords: string[] } } = {
  'Overview': { order: 0, keywords: ['overview', 'summary', 'introduction'] },
  'Plot': { order: 1, keywords: ['plot', 'synopsis', 'premise', 'summary', 'story', 'storyline'] },
  'Episodes': { order: 2, keywords: ['episode', 'series overview', 'season'] },
  'Cast': { order: 3, keywords: ['cast', 'character', 'starring', 'actor', 'actress'] },
  'Production': { order: 4, keywords: ['production', 'development', 'filming', 'writing', 'cinematography', 'music', 'soundtrack', 'casting', 'visual effects', 'special effects', 'pre-production', 'post-production', 'conception'] },
  'Release': { order: 5, keywords: ['release', 'broadcast', 'distribution', 'theatrical', 'home media', 'streaming', 'marketing', 'box office', 'promotion'] },
  'Reception': { order: 6, keywords: ['reception', 'review', 'critical', 'ratings', 'viewership', 'audience'] },
  'Themes': { order: 7, keywords: ['theme', 'analysis', 'interpretation', 'symbolism', 'style'] },
  'Awards': { order: 8, keywords: ['award', 'accolade', 'nomination', 'recognition', 'honors'] },
  'Legacy': { order: 9, keywords: ['legacy', 'impact', 'influence', 'cultural', 'sequel', 'spin-off', 'future', 'revival', 'background', 'history'] },
};

const WikipediaInfoSheet = ({
  open,
  onOpenChange,
  title,
  year,
  mediaType,
}: WikipediaInfoSheetProps) => {
  const { data, isLoading, error, refetch } = useWikipedia(
    { title, year, mediaType },
    open
  );

  const [activeTab, setActiveTab] = useState<string>('');

  // Categorize a section name into a display category
  const categorizeSection = (sectionName: string): string => {
    const name = sectionName.toLowerCase();
    
    for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
      if (config.keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }
    return 'Other';
  };

  // Group sections by category
  const getSectionsByCategory = (wikiData: WikipediaData) => {
    const categorized: { [category: string]: { [section: string]: string } } = {};
    
    Object.entries(wikiData.sections).forEach(([sectionName, content]) => {
      const category = categorizeSection(sectionName);
      if (!categorized[category]) {
        categorized[category] = {};
      }
      categorized[category][sectionName] = content;
    });
    
    // Sort categories by configured order
    const sortedCategories: { [category: string]: { [section: string]: string } } = {};
    Object.keys(categorized)
      .sort((a, b) => {
        const orderA = CATEGORY_CONFIG[a]?.order ?? 100;
        const orderB = CATEGORY_CONFIG[b]?.order ?? 100;
        return orderA - orderB;
      })
      .forEach(key => {
        sortedCategories[key] = categorized[key];
      });
    
    return sortedCategories;
  };

  const categorizedSections = data ? getSectionsByCategory(data) : {};
  const categories = Object.keys(categorizedSections);

  // Update active tab when data changes
  useEffect(() => {
    if (categories.length > 0 && (!activeTab || !categories.includes(activeTab))) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  // Format content with better styling for bold text markers
  const formatContent = (content: string) => {
    // Split by bold markers and render accordingly
    const parts = content.split(/\*\*([^*]+)\*\*/g);
    
    return parts.map((part, index) => {
      // Odd indices are the bold text (between **)
      if (index % 2 === 1) {
        return (
          <span key={index} className="font-semibold text-foreground block mt-4 mb-2">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-hidden p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b border-border bg-card/50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <SheetTitle className="text-left">Extended Information</SheetTitle>
            </div>
            <SheetDescription className="text-left flex items-center gap-2 flex-wrap">
              <span>From Wikipedia:</span>
              {data && (
                <Badge variant="secondary" className="text-xs">
                  {data.title}
                </Badge>
              )}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {/* Loading State */}
              {isLoading && (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="mt-6 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <div className="mt-6 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive/60 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Wikipedia Data Unavailable
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    {error.message === 'No Wikipedia article found' 
                      ? `We couldn't find a Wikipedia article for "${title}".`
                      : 'There was an error fetching information from Wikipedia.'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()}>
                      Try Again
                    </Button>
                    <Button variant="secondary" asChild>
                      <a 
                        href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(title + (mediaType === 'tv' ? ' TV series' : ' film'))}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Search Wikipedia
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Limited Content Notice */}
              {data && data.isLimited && (
                <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
                  <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Limited detailed sections are available for this title. Showing the article summary below.
                    </p>
                    <Button variant="link" className="px-0 h-auto text-sm" asChild>
                      <a href={data.url} target="_blank" rel="noopener noreferrer">
                        View full article on Wikipedia
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Content with Tabs */}
              {data && data.hasSections && categories.length > 0 && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-muted/50 p-1">
                    {categories.map((category) => (
                      <TabsTrigger 
                        key={category} 
                        value={category} 
                        className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {category}
                        <Badge variant="outline" className="ml-1.5 text-xs px-1.5 py-0">
                          {Object.keys(categorizedSections[category]).length}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {categories.map((category) => (
                    <TabsContent key={category} value={category} className="space-y-8 mt-0">
                      {Object.entries(categorizedSections[category]).map(([sectionName, content]) => (
                        <article key={sectionName} className="prose prose-sm dark:prose-invert max-w-none">
                          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-2">
                            <span className="w-1 h-5 bg-primary rounded-full" />
                            {sectionName}
                          </h3>
                          <div className="text-foreground/85 leading-relaxed whitespace-pre-wrap text-sm">
                            {formatContent(content)}
                          </div>
                        </article>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              )}

              {/* No Sections Found (but page exists) */}
              {data && !data.hasSections && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Detailed Sections Available
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    The Wikipedia article for "{data.title}" doesn't contain the detailed sections we're looking for, but you can still read the full article.
                  </p>
                  <Button variant="default" asChild>
                    <a href={data.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Article on Wikipedia
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer with Attribution */}
          {data && (
            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs text-muted-foreground">
                  Content sourced from Wikipedia (CC BY-SA)
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href={data.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Full Article
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WikipediaInfoSheet;
