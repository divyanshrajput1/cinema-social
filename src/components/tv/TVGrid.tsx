import TVCard from "./TVCard";
import { Skeleton } from "@/components/ui/skeleton";

interface TVShow {
  id: number;
  name: string;
  posterPath: string | null;
  year: string;
  rating: number;
}

interface TVGridProps {
  title: string;
  subtitle?: string;
  shows: TVShow[];
  onShowClick?: (id: number) => void;
  isLoading?: boolean;
}

const TVGrid = ({ title, subtitle, shows, onShowClick, isLoading }: TVGridProps) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!isLoading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6">
            {shows.map((show, index) => (
              <div
                key={show.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <TVCard
                  id={show.id}
                  name={show.name}
                  posterPath={show.posterPath}
                  year={show.year}
                  rating={show.rating}
                  onClick={() => onShowClick?.(show.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TVGrid;
