import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ExternalLink, ChevronRight, AlertCircle, List, Search, X } from "lucide-react";
import { useWikipediaFull, WikipediaSection, WikipediaTocItem } from "@/hooks/useWikipediaFull";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

// Wikipedia-style typography classes
const wikiStyles = {
  article: "font-serif text-[15px] leading-relaxed text-foreground/90",
  heading2: "font-sans text-2xl font-medium border-b border-border pb-2 mb-4 mt-8",
  heading3: "font-sans text-xl font-medium mt-6 mb-3",
  heading4: "font-sans text-lg font-medium mt-4 mb-2",
  paragraph: "mb-4",
  list: "ml-6 mb-4 list-disc",
  table: "border-collapse w-full my-4 text-sm",
  infobox: "float-right ml-6 mb-4 w-72 border border-border bg-muted/30 text-sm",
};

// Table of Contents component
const TableOfContents = ({ 
  toc, 
  activeSection,
  onSectionClick 
}: { 
  toc: WikipediaTocItem[]; 
  activeSection: string;
  onSectionClick: (id: string) => void;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (toc.length === 0) return null;

  return (
    <div className="border border-border bg-muted/20 rounded-lg p-4 mb-8">
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 font-sans font-medium text-lg mb-3 w-full text-left hover:text-primary transition-colors"
      >
        <List className="w-5 h-5" />
        Contents
        <ChevronRight className={cn(
          "w-4 h-4 ml-auto transition-transform",
          !isCollapsed && "rotate-90"
        )} />
      </button>
      
      {!isCollapsed && (
        <nav className="space-y-1">
          {toc.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onSectionClick(item.id)}
              className={cn(
                "block w-full text-left py-1 px-2 rounded text-sm hover:bg-primary/10 transition-colors",
                item.level === 1 && "font-medium",
                item.level === 2 && "pl-6",
                item.level === 3 && "pl-10 text-muted-foreground",
                activeSection === item.id && "bg-primary/10 text-primary"
              )}
            >
              <span className="text-muted-foreground mr-2">{index + 1}</span>
              {item.title}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

// Section component that renders HTML safely
const WikiSection = ({ section }: { section: WikipediaSection }) => {
  const sanitizedHtml = DOMPurify.sanitize(section.content, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span', 'div', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'cite', 'sup', 'sub'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'colspan', 'rowspan'],
  });

  const HeadingTag = section.level === 2 ? 'h2' : section.level === 3 ? 'h3' : 'h4';
  const headingClass = section.level === 2 ? wikiStyles.heading2 : 
                       section.level === 3 ? wikiStyles.heading3 : 
                       wikiStyles.heading4;

  return (
    <section id={section.id} className="scroll-mt-24">
      <HeadingTag className={headingClass}>{section.title}</HeadingTag>
      <div 
        className="wiki-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </section>
  );
};

// Infobox component
const Infobox = ({ 
  data, 
  posterUrl, 
  title 
}: { 
  data: Record<string, string>; 
  posterUrl?: string;
  title: string;
}) => {
  const relevantFields = [
    'Directed by', 'Produced by', 'Written by', 'Starring', 'Music by',
    'Cinematography', 'Edited by', 'Production company', 'Distributed by',
    'Release date', 'Running time', 'Country', 'Language', 'Budget', 'Box office',
    'Created by', 'Genre', 'No. of seasons', 'No. of episodes', 'Network',
    'Original release', 'Original network'
  ];

  const displayFields = Object.entries(data).filter(([key]) => 
    relevantFields.some(f => key.toLowerCase().includes(f.toLowerCase()))
  );

  return (
    <aside className={wikiStyles.infobox}>
      {posterUrl && (
        <div className="p-2 bg-muted/50">
          <img 
            src={posterUrl} 
            alt={title} 
            className="w-full h-auto"
          />
        </div>
      )}
      <div className="p-3 bg-primary/10 text-center font-sans font-semibold text-lg border-b border-border">
        {title}
      </div>
      <table className="w-full">
        <tbody>
          {displayFields.map(([key, value]) => (
            <tr key={key} className="border-b border-border/50">
              <th className="p-2 text-left font-medium bg-muted/30 w-1/3 align-top text-xs">
                {key}
              </th>
              <td className="p-2 text-xs">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  );
};

const WikipediaView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const originalTitle = searchParams.get('title') || '';
  const year = searchParams.get('year') || undefined;
  const mediaType = (searchParams.get('type') || 'movie') as 'movie' | 'tv';
  const posterUrl = searchParams.get('poster') || undefined;
  const backUrl = searchParams.get('back') || '/';

  // Use custom title if set, otherwise use URL title
  const activeTitle = customTitle || originalTitle;

  const { data, isLoading, error, refetch } = useWikipediaFull(
    activeTitle ? { title: activeTitle, year: customTitle ? undefined : year, mediaType } : null
  );

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCustomTitle(searchQuery.trim());
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Reset to original title
  const resetToOriginal = () => {
    setCustomTitle(null);
  };

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle section navigation
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    if (!data?.sections) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px' }
    );

    data.sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [data?.sections]);

  if (!originalTitle && !customTitle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No title specified</h1>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(backUrl)}
                className="gap-2 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              
              {/* Title and custom search indicator */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {data && (
                  <h1 className="font-display text-xl font-semibold truncate">
                    {data.title}
                  </h1>
                )}
                {customTitle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetToOriginal}
                    className="shrink-0 text-xs text-muted-foreground hover:text-foreground gap-1"
                  >
                    <X className="w-3 h-3" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Search and External Link */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search Form */}
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search Wikipedia..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 sm:w-64 h-9"
                  />
                  <Button type="submit" size="sm" disabled={!searchQuery.trim()}>
                    Search
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              )}
              
              {data && (
                <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                  <a href={data.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Wikipedia
                  </a>
                </Button>
              )}
            </div>
          </div>
          
          {/* Custom search notice */}
          {customTitle && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Showing results for custom search. 
              <button 
                onClick={resetToOriginal}
                className="text-primary hover:underline"
              >
                Return to "{originalTitle}"
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-6">
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="mt-8 space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="mt-8 space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <div className="hidden lg:block w-72">
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-16 h-16 text-destructive/60 mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Wikipedia Article Unavailable
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {error.message === 'No Wikipedia article found' 
                ? `We couldn't find a Wikipedia article for "${activeTitle}".`
                : 'There was an error fetching information from Wikipedia.'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
              <Button asChild>
                <a 
                  href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(activeTitle + (mediaType === 'tv' ? ' TV series' : ' film'))}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Search Wikipedia
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Article Content */}
        {data && (
          <article ref={contentRef} className={cn("max-w-4xl mx-auto", wikiStyles.article)}>
            {/* Infobox */}
            {(data.infobox || posterUrl) && (
              <Infobox 
                data={data.infobox?.data || {}} 
                posterUrl={posterUrl}
                title={data.title}
              />
            )}

            {/* Article Title */}
            <h1 className="font-serif text-3xl font-normal border-b border-border pb-2 mb-4">
              {data.title}
            </h1>

            {/* Lead Section */}
            {data.leadSection && (
              <div 
                className="wiki-content mb-8"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(data.leadSection, {
                    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'br', 'span', 'sup'],
                    ALLOWED_ATTR: ['href', 'target', 'rel'],
                  })
                }}
              />
            )}

            {/* Clear float after lead */}
            <div className="clear-both" />

            {/* Table of Contents */}
            {data.toc.length > 0 && (
              <TableOfContents 
                toc={data.toc} 
                activeSection={activeSection}
                onSectionClick={scrollToSection}
              />
            )}

            {/* Sections */}
            {data.sections.map((section) => (
              <WikiSection key={section.id} section={section} />
            ))}

            {/* Limited Content Notice */}
            {data.isLimited && (
              <div className="mt-8 p-6 rounded-lg bg-muted/30 border border-border text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  Limited content is available for this article. 
                  Visit Wikipedia for the full article.
                </p>
                <Button asChild>
                  <a href={data.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Full Article on Wikipedia
                  </a>
                </Button>
              </div>
            )}

            {/* Attribution Footer */}
            <footer className="mt-12 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Content sourced from{' '}
                <a 
                  href={data.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Wikipedia
                </a>
                {' '}under{' '}
                <a 
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  CC BY-SA license
                </a>
              </p>
            </footer>
          </article>
        )}
      </main>

      <Footer />

      {/* Wikipedia-specific styles */}
      <style>{`
        .wiki-content p {
          margin-bottom: 1rem;
        }
        .wiki-content a {
          color: hsl(var(--primary));
          text-decoration: none;
        }
        .wiki-content a:hover {
          text-decoration: underline;
        }
        .wiki-content ul, .wiki-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .wiki-content li {
          margin-bottom: 0.25rem;
        }
        .wiki-content table {
          border-collapse: collapse;
          margin: 1rem 0;
          width: 100%;
          font-size: 0.875rem;
        }
        .wiki-content th, .wiki-content td {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem;
          text-align: left;
        }
        .wiki-content th {
          background: hsl(var(--muted) / 0.5);
          font-weight: 500;
        }
        .wiki-content blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        .wiki-content h3, .wiki-content h4, .wiki-content h5 {
          font-family: var(--font-sans);
          font-weight: 500;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .wiki-content h3 {
          font-size: 1.25rem;
        }
        .wiki-content h4 {
          font-size: 1.125rem;
        }
      `}</style>
    </div>
  );
};

export default WikipediaView;
