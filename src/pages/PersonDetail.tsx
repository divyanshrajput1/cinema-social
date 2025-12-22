import { useParams, useNavigate } from "react-router-dom";
import { usePersonDetails, getProfileUrl, TMDBPersonCredit } from "@/hooks/useTMDBPerson";
import { getImageUrl } from "@/hooks/useTMDB";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TMDBAttribution from "@/components/common/TMDBAttribution";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Tv, Calendar, MapPin, User, Star } from "lucide-react";
import { format } from "date-fns";

const PersonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: person, isLoading, error } = usePersonDetails(id);

  const calculateAge = (birthday: string, deathday?: string | null) => {
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const sortCredits = (credits: TMDBPersonCredit[]) => {
    return [...credits].sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || '';
      const dateB = b.release_date || b.first_air_date || '';
      return dateB.localeCompare(dateA);
    });
  };

  const getKnownFor = (credits: TMDBPersonCredit[]) => {
    return [...credits]
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 8);
  };

  const handleCreditClick = (credit: TMDBPersonCredit) => {
    if (credit.media_type === 'movie') {
      navigate(`/film/${credit.id}`);
    } else {
      navigate(`/tv/${credit.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            <Skeleton className="aspect-[2/3] rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Person not found</h1>
          <p className="text-muted-foreground">The person you're looking for doesn't exist or couldn't be loaded.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const castCredits = sortCredits(person.combined_credits?.cast || []);
  const crewCredits = sortCredits(person.combined_credits?.crew || []);
  const knownFor = getKnownFor(person.combined_credits?.cast || []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
          {/* Profile Image */}
          <div className="space-y-4">
            {person.profile_path ? (
              <img
                src={getProfileUrl(person.profile_path, 'h632')!}
                alt={person.name}
                className="w-full rounded-lg shadow-xl"
              />
            ) : (
              <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                <User className="w-20 h-20 text-muted-foreground" />
              </div>
            )}
            <TMDBAttribution />
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
                {person.name}
              </h1>
              <Badge variant="secondary" className="text-sm">
                {person.known_for_department}
              </Badge>
            </div>

            {/* Personal Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              {person.birthday && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(person.birthday), 'MMMM d, yyyy')}
                    {!person.deathday && ` (${calculateAge(person.birthday)} years old)`}
                  </span>
                </div>
              )}
              {person.deathday && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Died: {format(new Date(person.deathday), 'MMMM d, yyyy')} ({calculateAge(person.birthday, person.deathday)} years old)
                  </span>
                </div>
              )}
              {person.place_of_birth && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{person.place_of_birth}</span>
                </div>
              )}
            </div>

            {/* Biography */}
            {person.biography && (
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">Biography</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {person.biography}
                </p>
              </div>
            )}

            {/* Also Known As */}
            {person.also_known_as?.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Also Known As</h3>
                <div className="flex flex-wrap gap-2">
                  {person.also_known_as.slice(0, 5).map((name, i) => (
                    <Badge key={i} variant="outline">{name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Known For Section */}
        {knownFor.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Known For</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {knownFor.map((credit) => (
                <div
                  key={`${credit.media_type}-${credit.id}`}
                  className="cursor-pointer group"
                  onClick={() => handleCreditClick(credit)}
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
                    {credit.poster_path ? (
                      <img
                        src={getImageUrl(credit.poster_path, 'w200')!}
                        alt={credit.title || credit.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {credit.media_type === 'movie' ? (
                          <Film className="w-8 h-8 text-muted-foreground" />
                        ) : (
                          <Tv className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {credit.title || credit.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Credits Tabs */}
        <Tabs defaultValue="acting" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="acting" className="gap-2">
              <User className="w-4 h-4" />
              Acting ({castCredits.length})
            </TabsTrigger>
            {crewCredits.length > 0 && (
              <TabsTrigger value="crew" className="gap-2">
                <Film className="w-4 h-4" />
                Crew ({crewCredits.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="acting">
            <div className="space-y-2">
              {castCredits.map((credit, index) => (
                <Card
                  key={`${credit.media_type}-${credit.id}-${index}`}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleCreditClick(credit)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Poster Thumbnail */}
                    <div className="w-12 h-18 flex-shrink-0 rounded overflow-hidden bg-muted">
                      {credit.poster_path ? (
                        <img
                          src={getImageUrl(credit.poster_path, 'w200')!}
                          alt={credit.title || credit.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {credit.media_type === 'movie' ? (
                            <Film className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Tv className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Credit Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {credit.media_type === 'movie' ? (
                          <Film className="w-4 h-4 text-primary" />
                        ) : (
                          <Tv className="w-4 h-4 text-primary" />
                        )}
                        <span className="font-medium text-foreground truncate">
                          {credit.title || credit.name}
                        </span>
                      </div>
                      {credit.character && (
                        <p className="text-sm text-muted-foreground truncate">
                          as {credit.character}
                          {credit.episode_count && ` (${credit.episode_count} episodes)`}
                        </p>
                      )}
                    </div>

                    {/* Year & Rating */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {(credit.release_date || credit.first_air_date) && (
                        <span>
                          {new Date(credit.release_date || credit.first_air_date || '').getFullYear() || '—'}
                        </span>
                      )}
                      {credit.vote_average > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{credit.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crew">
            <div className="space-y-2">
              {crewCredits.map((credit, index) => (
                <Card
                  key={`${credit.media_type}-${credit.id}-${credit.job}-${index}`}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleCreditClick(credit)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Poster Thumbnail */}
                    <div className="w-12 h-18 flex-shrink-0 rounded overflow-hidden bg-muted">
                      {credit.poster_path ? (
                        <img
                          src={getImageUrl(credit.poster_path, 'w200')!}
                          alt={credit.title || credit.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {credit.media_type === 'movie' ? (
                            <Film className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Tv className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Credit Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {credit.media_type === 'movie' ? (
                          <Film className="w-4 h-4 text-primary" />
                        ) : (
                          <Tv className="w-4 h-4 text-primary" />
                        )}
                        <span className="font-medium text-foreground truncate">
                          {credit.title || credit.name}
                        </span>
                      </div>
                      {credit.job && (
                        <p className="text-sm text-muted-foreground truncate">
                          {credit.department}: {credit.job}
                        </p>
                      )}
                    </div>

                    {/* Year & Rating */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {(credit.release_date || credit.first_air_date) && (
                        <span>
                          {new Date(credit.release_date || credit.first_air_date || '').getFullYear() || '—'}
                        </span>
                      )}
                      {credit.vote_average > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{credit.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default PersonDetail;
