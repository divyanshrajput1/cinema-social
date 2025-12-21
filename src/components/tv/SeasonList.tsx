import { useState } from "react";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { TMDBSeason, TMDBSeasonDetails, useTVSeason } from "@/hooks/useTMDBTV";
import { getImageUrl } from "@/hooks/useTMDB";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SeasonListProps {
  tvId: number;
  seasons: TMDBSeason[];
}

const SeasonList = ({ tvId, seasons }: SeasonListProps) => {
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  // Filter out specials (season 0) and sort by season number
  const regularSeasons = seasons
    .filter(s => s.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  const toggleSeason = (seasonNumber: number) => {
    setExpandedSeason(prev => prev === seasonNumber ? null : seasonNumber);
  };

  return (
    <div className="space-y-3">
      {regularSeasons.map((season) => (
        <SeasonItem
          key={season.id}
          tvId={tvId}
          season={season}
          isExpanded={expandedSeason === season.season_number}
          onToggle={() => toggleSeason(season.season_number)}
        />
      ))}
    </div>
  );
};

interface SeasonItemProps {
  tvId: number;
  season: TMDBSeason;
  isExpanded: boolean;
  onToggle: () => void;
}

const SeasonItem = ({ tvId, season, isExpanded, onToggle }: SeasonItemProps) => {
  const { data: seasonDetails, isLoading } = useTVSeason(
    isExpanded ? tvId : undefined, 
    isExpanded ? season.season_number : undefined
  );

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        {/* Season poster */}
        <div className="w-16 h-24 rounded overflow-hidden flex-shrink-0 bg-muted">
          <img
            src={getImageUrl(season.poster_path, 'w200')}
            alt={season.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Season info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground">{season.name}</h4>
          <p className="text-sm text-muted-foreground">
            {season.episode_count} episodes
            {season.air_date && ` • ${new Date(season.air_date).getFullYear()}`}
          </p>
          {season.overview && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {season.overview}
            </p>
          )}
        </div>
        
        {/* Expand icon */}
        <div className="text-muted-foreground">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      
      {/* Episodes list */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/30">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-32 h-20 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : seasonDetails ? (
            <EpisodesList episodes={seasonDetails.episodes} />
          ) : null}
        </div>
      )}
    </div>
  );
};

interface EpisodesListProps {
  episodes: TMDBSeasonDetails['episodes'];
}

const EpisodesList = ({ episodes }: EpisodesListProps) => {
  return (
    <div className="divide-y divide-border">
      {episodes.map((episode) => (
        <div key={episode.id} className="p-4 flex gap-4">
          {/* Episode still */}
          <div className="w-32 h-20 rounded overflow-hidden flex-shrink-0 bg-muted relative group">
            {episode.still_path ? (
              <img
                src={getImageUrl(episode.still_path, 'w300')}
                alt={episode.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Episode info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h5 className="font-medium text-foreground">
                  {episode.episode_number}. {episode.name}
                </h5>
                <p className="text-xs text-muted-foreground">
                  {episode.air_date && new Date(episode.air_date).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}
                  {episode.runtime && ` • ${episode.runtime}m`}
                </p>
              </div>
              {episode.vote_average > 0 && (
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                  {episode.vote_average.toFixed(1)}
                </span>
              )}
            </div>
            {episode.overview && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {episode.overview}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeasonList;
