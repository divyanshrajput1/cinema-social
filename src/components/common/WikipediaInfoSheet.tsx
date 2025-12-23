import { useState } from "react";
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
import { BookOpen, ExternalLink, AlertCircle } from "lucide-react";
import { useWikipedia } from "@/hooks/useWikipedia";

interface WikipediaInfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  year?: string;
  mediaType: 'movie' | 'tv';
}

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

  // Group sections by category for better organization
  const categorizeSection = (sectionName: string): string => {
    const name = sectionName.toLowerCase();
    if (name.includes('plot') || name.includes('synopsis') || name.includes('premise') || name.includes('summary')) {
      return 'Plot';
    }
    if (name.includes('episode') || name.includes('series overview')) {
      return 'Episodes';
    }
    if (name.includes('production') || name.includes('development') || name.includes('filming') || name.includes('writing')) {
      return 'Production';
    }
    if (name.includes('cast') || name.includes('character') || name.includes('starring')) {
      return 'Cast';
    }
    if (name.includes('release') || name.includes('broadcast') || name.includes('distribution')) {
      return 'Release';
    }
    if (name.includes('reception') || name.includes('review') || name.includes('critical')) {
      return 'Reception';
    }
    if (name.includes('award') || name.includes('accolade') || name.includes('nomination')) {
      return 'Awards';
    }
    return 'Other';
  };

  const getSectionsByCategory = () => {
    if (!data?.sections) return {};
    
    const categorized: { [category: string]: { [section: string]: string } } = {};
    
    Object.entries(data.sections).forEach(([sectionName, content]) => {
      const category = categorizeSection(sectionName);
      if (!categorized[category]) {
        categorized[category] = {};
      }
      categorized[category][sectionName] = content;
    });
    
    return categorized;
  };

  const categorizedSections = getSectionsByCategory();
  const categories = Object.keys(categorizedSections);
  const [activeTab, setActiveTab] = useState(categories[0] || 'Plot');

  // Update active tab when categories change
  if (categories.length > 0 && !categories.includes(activeTab)) {
    setActiveTab(categories[0]);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <SheetTitle className="text-left">Extended Information</SheetTitle>
            </div>
            <SheetDescription className="text-left">
              Information from Wikipedia for "{title}"
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {isLoading && (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-48 mt-6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Wikipedia Data Unavailable
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    {error.message === 'No Wikipedia article found' 
                      ? `We couldn't find a Wikipedia article for "${title}".`
                      : 'There was an error fetching information from Wikipedia.'}
                  </p>
                  <Button variant="outline" onClick={() => refetch()}>
                    Try Again
                  </Button>
                </div>
              )}

              {data && !data.hasSections && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Limited Information Available
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    The Wikipedia article for this title doesn't contain the detailed sections we're looking for.
                  </p>
                  <Button variant="outline" asChild>
                    <a href={data.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Wikipedia
                    </a>
                  </Button>
                </div>
              )}

              {data && data.hasSections && categories.length > 0 && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-6 flex-wrap h-auto gap-1">
                    {categories.map((category) => (
                      <TabsTrigger key={category} value={category} className="text-sm">
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {categories.map((category) => (
                    <TabsContent key={category} value={category} className="space-y-6">
                      {Object.entries(categorizedSections[category]).map(([sectionName, content]) => (
                        <div key={sectionName}>
                          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                            <span className="w-1 h-5 bg-primary rounded-full" />
                            {sectionName}
                          </h3>
                          <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm">
                            {content}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          </ScrollArea>

          {data && (
            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  Content from Wikipedia under CC BY-SA license
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
