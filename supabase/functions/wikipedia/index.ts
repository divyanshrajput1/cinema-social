import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WikipediaSearchResult {
  query?: {
    search?: Array<{
      title: string;
      pageid: number;
      snippet: string;
    }>;
  };
}

interface WikipediaPageResult {
  query?: {
    pages?: {
      [key: string]: {
        pageid: number;
        title: string;
        extract?: string;
        fullurl?: string;
        categories?: Array<{ title: string }>;
      };
    };
  };
}

interface WikipediaParsedResult {
  parse?: {
    title: string;
    pageid: number;
    text?: {
      "*": string;
    };
    sections?: Array<{
      toclevel: number;
      level: string;
      line: string;
      number: string;
      index: string;
      fromtitle: string;
      anchor: string;
    }>;
    images?: string[];
  };
}

// Generate search query variations for better matching
function generateSearchQueries(title: string, year: string | undefined, mediaType: string): string[] {
  const queries: string[] = [];
  const suffix = mediaType === 'tv' ? 'TV series' : 'film';
  
  // Remove common subtitles and suffixes for cleaner searches
  const cleanTitle = title
    .replace(/:\s+.+$/, '') // Remove subtitles after colon
    .replace(/\s+[-–—]\s+.+$/, '') // Remove parts after dashes
    .trim();
  
  // Primary searches with year (most specific)
  if (year) {
    queries.push(`${title} ${year} ${suffix}`);
    queries.push(`${title} (${year} ${suffix})`);
    if (cleanTitle !== title) {
      queries.push(`${cleanTitle} ${year} ${suffix}`);
    }
  }
  
  // Searches with media type suffix
  queries.push(`${title} ${suffix}`);
  queries.push(`${title} (${suffix})`);
  if (cleanTitle !== title) {
    queries.push(`${cleanTitle} ${suffix}`);
  }
  
  // Fallback to just the title
  queries.push(title);
  if (cleanTitle !== title) {
    queries.push(cleanTitle);
  }
  
  // Remove duplicates while preserving order
  return [...new Set(queries)];
}

// Check if a page is a disambiguation page
async function isDisambiguationPage(pageid: number): Promise<boolean> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageid}&prop=categories&format=json`;
    const response = await fetch(url);
    const data: WikipediaPageResult = await response.json();
    const page = data.query?.pages?.[pageid.toString()];
    
    if (page?.categories) {
      return page.categories.some(cat => 
        cat.title.toLowerCase().includes('disambiguation')
      );
    }
    return false;
  } catch {
    return false;
  }
}

// Get page summary as fallback content
async function getPageSummary(pageid: number): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageid}&prop=extracts&exintro=1&explaintext=1&format=json`;
    const response = await fetch(url);
    const data: WikipediaPageResult = await response.json();
    const page = data.query?.pages?.[pageid.toString()];
    return page?.extract || null;
  } catch {
    return null;
  }
}

// Sanitize HTML for safe rendering while preserving structure
function sanitizeHtml(html: string): string {
  return html
    // Remove script and style tags completely
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove edit section links
    .replace(/<span[^>]*class="[^"]*mw-editsection[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    // Remove navigation boxes
    .replace(/<div[^>]*class="[^"]*navbox[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<table[^>]*class="[^"]*navbox[^"]*"[^>]*>[\s\S]*?<\/table>/gi, '')
    // Remove hidden elements
    .replace(/<[^>]*style="[^"]*display:\s*none[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
    // Remove metadata/hidden categories
    .replace(/<div[^>]*class="[^"]*metadata[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Convert Wikipedia internal links to plain text or external links
    .replace(/href="\/wiki\//g, 'href="https://en.wikipedia.org/wiki/')
    // Remove citation needed templates
    .replace(/<sup[^>]*class="[^"]*noprint[^"]*"[^>]*>[\s\S]*?<\/sup>/gi, '')
    // Keep reference numbers but simplify them
    .replace(/<sup[^>]*class="[^"]*reference[^"]*"[^>]*>[\s\S]*?<\/sup>/gi, '')
    // Remove inline audio/pronunciation elements
    .replace(/<span[^>]*class="[^"]*IPA[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<span[^>]*class="[^"]*nowrap[^"]*"[^>]*>[\s\S]*?<\/span>/gi, (match) => {
      // Keep the inner text of nowrap spans
      return match.replace(/<\/?span[^>]*>/g, '');
    });
}

// Extract infobox data from HTML
function extractInfobox(html: string): { html: string; data: Record<string, string> } | null {
  const infoboxMatch = html.match(/<table[^>]*class="[^"]*infobox[^"]*"[^>]*>[\s\S]*?<\/table>/i);
  if (!infoboxMatch) return null;
  
  const infoboxHtml = infoboxMatch[0];
  const data: Record<string, string> = {};
  
  // Extract key-value pairs from infobox rows
  const rowRegex = /<tr[^>]*>[\s\S]*?<th[^>]*>([\s\S]*?)<\/th>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gi;
  let match;
  
  while ((match = rowRegex.exec(infoboxHtml)) !== null) {
    const key = match[1].replace(/<[^>]+>/g, '').trim();
    const value = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (key && value) {
      data[key] = value;
    }
  }
  
  return { html: infoboxHtml, data };
}

// Extract lead section (content before first h2)
function extractLeadSection(html: string): string {
  // Find content after infobox but before first h2
  let content = html;
  
  // Remove infobox if present
  content = content.replace(/<table[^>]*class="[^"]*infobox[^"]*"[^>]*>[\s\S]*?<\/table>/gi, '');
  
  // Find first h2
  const firstH2Index = content.search(/<h2/i);
  if (firstH2Index === -1) return content;
  
  // Get content before first h2
  let leadContent = content.substring(0, firstH2Index);
  
  // Remove any remaining tables at the start
  leadContent = leadContent.replace(/^[\s\S]*?<\/table>/i, '');
  
  // Find the first paragraph
  const paragraphsMatch = leadContent.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
  if (paragraphsMatch) {
    return paragraphsMatch.join('');
  }
  
  return leadContent;
}

// Extract all sections with their content
function extractAllSections(
  html: string,
  sections: Array<{ line: string; anchor: string; index: string; level: string; toclevel: number }>
): Array<{ id: string; title: string; level: number; content: string }> {
  const result: Array<{ id: string; title: string; level: number; content: string }> = [];
  
  // Sort sections by index
  const sortedSections = [...sections].sort((a, b) => parseInt(a.index) - parseInt(b.index));
  
  for (let i = 0; i < sortedSections.length; i++) {
    const section = sortedSections[i];
    const sectionTitle = section.line.replace(/<[^>]*>/g, '').trim();
    
    // Skip certain sections
    const skipSections = ['see also', 'references', 'external links', 'notes', 'further reading', 'bibliography'];
    if (skipSections.some(s => sectionTitle.toLowerCase() === s)) continue;
    
    // Find the section start in HTML
    const anchor = section.anchor;
    const patterns = [
      new RegExp(`<span[^>]*id="${anchor}"[^>]*>`, 'i'),
      new RegExp(`<h\\d[^>]*id="${anchor}"[^>]*>`, 'i'),
      new RegExp(`id="${anchor}"`, 'i'),
    ];
    
    let startMatch = -1;
    for (const pattern of patterns) {
      const match = html.search(pattern);
      if (match !== -1) {
        startMatch = match;
        break;
      }
    }
    
    if (startMatch === -1) continue;
    
    // Find the section end (next section of same or higher level)
    let endMatch = html.length;
    const currentLevel = parseInt(section.level) || 2;
    
    for (let j = i + 1; j < sortedSections.length; j++) {
      const nextSection = sortedSections[j];
      const nextLevel = parseInt(nextSection.level) || 2;
      
      if (nextLevel <= currentLevel) {
        for (const pattern of [
          new RegExp(`<span[^>]*id="${nextSection.anchor}"[^>]*>`, 'i'),
          new RegExp(`<h\\d[^>]*id="${nextSection.anchor}"[^>]*>`, 'i'),
        ]) {
          const match = html.slice(startMatch + 50).search(pattern);
          if (match !== -1) {
            endMatch = startMatch + 50 + match;
            break;
          }
        }
        break;
      }
    }
    
    // Extract section content
    const sectionHtml = html.slice(startMatch, endMatch);
    
    // Skip if content is too short
    if (sectionHtml.length < 50) continue;
    
    result.push({
      id: anchor,
      title: sectionTitle,
      level: parseInt(section.level) || 2,
      content: sanitizeHtml(sectionHtml),
    });
  }
  
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, year, mediaType, fullContent = false } = await req.json();
    
    if (!title) {
      throw new Error('Title is required');
    }

    console.log(`Searching Wikipedia for: ${title} (${year}) - ${mediaType} [fullContent: ${fullContent}]`);

    // Generate multiple search query variations
    const searchQueries = generateSearchQueries(title, year, mediaType);
    
    let foundPage = null;
    let searchAttempts = 0;

    // Try each search query until we find a good match
    for (const searchQuery of searchQueries) {
      if (searchAttempts >= 10) break;
      
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&srlimit=10`;
      
      console.log(`Trying search query: ${searchQuery}`);
      searchAttempts++;
      
      const searchResponse = await fetch(searchUrl);
      const searchData: WikipediaSearchResult = await searchResponse.json();
      
      if (searchData.query?.search && searchData.query.search.length > 0) {
        for (const result of searchData.query.search) {
          const resultTitle = result.title.toLowerCase();
          const searchTitle = title.toLowerCase();
          
          if (resultTitle.includes('disambiguation')) continue;
          
          const isExactMatch = resultTitle === searchTitle || 
            resultTitle.startsWith(searchTitle + ' (') ||
            resultTitle === `${searchTitle} (${mediaType === 'tv' ? 'tv series' : 'film'})`;
          
          const containsTitle = resultTitle.includes(searchTitle);
          const containsMediaType = resultTitle.includes(mediaType === 'tv' ? 'series' : 'film');
          const containsYear = year ? resultTitle.includes(year) : false;
          
          const isDisambig = await isDisambiguationPage(result.pageid);
          if (isDisambig) {
            console.log(`Skipping disambiguation page: ${result.title}`);
            continue;
          }
          
          if (isExactMatch || (containsTitle && (containsMediaType || containsYear))) {
            foundPage = result;
            console.log(`Found matching page: ${result.title}`);
            break;
          }
          
          if (!foundPage && containsTitle) {
            foundPage = result;
          }
        }
        
        if (foundPage) break;
        
        if (!foundPage && searchData.query.search.length > 0) {
          for (const result of searchData.query.search) {
            const isDisambig = await isDisambiguationPage(result.pageid);
            if (!isDisambig) {
              foundPage = result;
              break;
            }
          }
        }
        
        if (foundPage) break;
      }
    }

    if (!foundPage) {
      console.log('No Wikipedia article found');
      return new Response(JSON.stringify({ 
        error: 'not_found',
        message: 'No Wikipedia article found for this title' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching full content for page: ${foundPage.title} (ID: ${foundPage.pageid})`);

    // Get the full page content with sections and images
    const parseUrl = `https://en.wikipedia.org/w/api.php?action=parse&pageid=${foundPage.pageid}&format=json&prop=text|sections|images`;
    const parseResponse = await fetch(parseUrl);
    const parseData: WikipediaParsedResult = await parseResponse.json();

    // Get page info for the URL
    const pageInfoUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${foundPage.pageid}&format=json&prop=info&inprop=url`;
    const pageInfoResponse = await fetch(pageInfoUrl);
    const pageInfoData: WikipediaPageResult = await pageInfoResponse.json();
    
    const pageInfo = pageInfoData.query?.pages?.[foundPage.pageid.toString()];
    const fullUrl = pageInfo?.fullurl || `https://en.wikipedia.org/?curid=${foundPage.pageid}`;

    const htmlContent = parseData.parse?.text?.["*"] || "";
    const sections = parseData.parse?.sections || [];
    const images = parseData.parse?.images || [];

    // If fullContent mode, return structured HTML data
    if (fullContent) {
      const sanitizedHtml = sanitizeHtml(htmlContent);
      const infobox = extractInfobox(htmlContent);
      const leadSection = extractLeadSection(sanitizedHtml);
      const allSections = extractAllSections(sanitizedHtml, sections);
      
      // Build table of contents
      const toc = sections
        .filter(s => {
          const title = s.line.replace(/<[^>]*>/g, '').trim().toLowerCase();
          const skipSections = ['see also', 'references', 'external links', 'notes', 'further reading', 'bibliography'];
          return !skipSections.includes(title);
        })
        .map(s => ({
          id: s.anchor,
          title: s.line.replace(/<[^>]*>/g, '').trim(),
          level: s.toclevel,
        }));

      const result = {
        title: foundPage.title,
        pageId: foundPage.pageid,
        url: fullUrl,
        infobox: infobox,
        leadSection: leadSection,
        sections: allSections,
        toc: toc,
        images: images.slice(0, 10),
        hasSections: allSections.length > 0,
        isLimited: allSections.length === 0,
      };

      console.log(`Successfully extracted ${allSections.length} sections for: ${foundPage.title}`);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Legacy mode: return simplified sections
    const TARGET_SECTIONS = [
      'plot', 'synopsis', 'premise', 'summary', 'story', 'storyline',
      'episodes', 'episode list', 'series overview',
      'production', 'development', 'filming', 'music', 'casting',
      'cast', 'cast and characters',
      'release', 'broadcast', 'distribution', 'marketing', 'box office',
      'reception', 'critical response', 'reviews', 'ratings',
      'themes', 'analysis',
      'awards', 'awards and nominations', 'accolades',
      'legacy', 'impact', 'influence',
    ];

    const extractedSections: { [key: string]: string } = {};
    
    // Extract and clean sections for legacy mode
    for (const section of sections) {
      const sectionName = section.line.replace(/<[^>]*>/g, '').trim();
      const sectionNameLower = sectionName.toLowerCase();
      
      const isTarget = TARGET_SECTIONS.some(t => 
        sectionNameLower === t || sectionNameLower.includes(t) || t.includes(sectionNameLower)
      );
      
      if (!isTarget) continue;
      
      // Find section content
      const anchor = section.anchor;
      const startPattern = new RegExp(`id="${anchor}"`, 'i');
      const startMatch = htmlContent.search(startPattern);
      
      if (startMatch === -1) continue;
      
      // Find end of section
      let endMatch = htmlContent.length;
      const currentLevel = parseInt(section.level) || 2;
      
      for (const nextSection of sections) {
        if (parseInt(nextSection.index) <= parseInt(section.index)) continue;
        const nextLevel = parseInt(nextSection.level) || 2;
        if (nextLevel <= currentLevel) {
          const nextPattern = new RegExp(`id="${nextSection.anchor}"`, 'i');
          const nextMatch = htmlContent.slice(startMatch + 50).search(nextPattern);
          if (nextMatch !== -1) {
            endMatch = startMatch + 50 + nextMatch;
            break;
          }
        }
      }
      
      const sectionHtml = htmlContent.slice(startMatch, endMatch);
      const cleanText = sectionHtml
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\[\d+\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanText.length > 100) {
        extractedSections[sectionName] = cleanText.slice(0, 8000);
      }
    }
    
    // Get lead section as Overview
    const leadText = await getPageSummary(foundPage.pageid);
    if (leadText && !extractedSections['Overview']) {
      extractedSections['Overview'] = leadText;
    }

    const result = {
      title: foundPage.title,
      pageId: foundPage.pageid,
      url: fullUrl,
      sections: extractedSections,
      hasSections: Object.keys(extractedSections).length > 0,
      isLimited: Object.keys(extractedSections).length <= 1,
    };

    console.log(`Successfully extracted ${Object.keys(extractedSections).length} sections for: ${foundPage.title}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in wikipedia function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
