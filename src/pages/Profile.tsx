import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useDiary } from "@/hooks/useDiary";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getImageUrl } from "@/hooks/useTMDB";
import { Film, Clock, Calendar, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/profile/AvatarUpload";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { watchlist } = useWatchlist();
  const { diary } = useDiary();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio: bio,
      })
      .eq("user_id", user.id);
    
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
      setIsEditing(false);
      refetch();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <Skeleton className="h-48 rounded-lg mb-8" />
        </div>
      </div>
    );
  }

  const recentDiary = diary.slice(0, 4);
  const recentWatchlist = watchlist.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 container mx-auto px-4">
        {/* Profile Header */}
        <div className="glass-card rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <AvatarUpload
              userId={user!.id}
              currentAvatarUrl={profile?.avatar_url || null}
              onAvatarChange={() => refetch()}
            />
            
            {isEditing ? (
              <div className="flex-1 space-y-4">
                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-input max-w-sm"
                  />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-input max-w-lg"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="letterboxd" onClick={handleSaveProfile}>
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <h1 className="font-display text-2xl font-semibold">
                  {profile?.display_name || user?.email?.split("@")[0] || "User"}
                </h1>
                <p className="text-muted-foreground mb-4">{user?.email}</p>
                {profile?.bio && <p className="text-foreground/80 mb-4">{profile.bio}</p>}
                
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="font-semibold text-foreground">{diary.length}</span>
                    <span className="text-muted-foreground ml-1">Films</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{watchlist.length}</span>
                    <span className="text-muted-foreground ml-1">Watchlist</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Diary */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">Recent Diary</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/diary">View All</Link>
              </Button>
            </div>
            
            {recentDiary.length === 0 ? (
              <div className="glass-card rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No diary entries yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {recentDiary.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/film/${entry.tmdb_id}`}
                    className="aspect-[2/3] rounded overflow-hidden bg-muted poster-hover"
                  >
                    {entry.poster_path ? (
                      <img
                        src={getImageUrl(entry.poster_path, "w200")}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Watchlist Preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">Watchlist</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/watchlist">View All</Link>
              </Button>
            </div>
            
            {recentWatchlist.length === 0 ? (
              <div className="glass-card rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No films in watchlist</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {recentWatchlist.map((item) => (
                  <Link
                    key={item.id}
                    to={`/film/${item.tmdb_id}`}
                    className="aspect-[2/3] rounded overflow-hidden bg-muted poster-hover"
                  >
                    {item.poster_path ? (
                      <img
                        src={getImageUrl(item.poster_path, "w200")}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
