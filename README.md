# 🎬 Cinevault

Cinevault is a modern, cinematic movie and TV show discovery platform inspired by Letterboxd.  
It allows users to explore films and TV series, write reviews, maintain diaries and watchlists, view cast/crew details, and access rich information from trusted sources like TMDB, Wikipedia — all wrapped in a beautiful, immersive UI with 3D and parallax effects.

---

## ✨ Features

### 🎥 Movies & TV Shows
- Browse trending, popular, and top-rated movies and TV series
- Detailed movie & TV pages with posters, backdrops, cast, and crew
- Separate support for movies and TV shows

### ⭐ Reviews & Ratings
- Write and manage personal reviews
- Rate movies and TV shows
- Dedicated **Reviews** page showing only reviewed titles
- View **TMDB community reviews** alongside user reviews

### 📓 Diary & Watchlist
- Track watched movies and TV shows in a diary
- Maintain a personal watchlist
- Quick access from the navbar

### 👤 Profiles
- User profiles with profile pictures
- View reviewed titles, diary entries, and watchlist
- Profile picture upload with fallback avatar

### 📚 Extended Information
- **Wikipedia View**: Read full Wikipedia-style information inside the app
- **Fandom View**: Access Fandom-style pages with rich lore and trivia
- Clean parsing and rendering (no raw wiki markup)

### 🔍 Search & Discovery
- Unified search for movies, TV shows, and people
- Person pages with biography and filmography

### 🎞️ Watch Options (Legal)
- Watch official trailers (YouTube via TMDB)
- “Where to Watch” links to official streaming platforms

### 🎨 UI & Experience
- Dark, cinema-inspired theme
- 3D hover effects on posters
- Parallax hero sections
- Smooth page transitions and micro-interactions
- Responsive across desktop, tablet, and mobile
- Global **Back button** on all pages

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion (animations & transitions)

### Backend / Services
- Supabase (PostgreSQL, Auth, Storage)
- TMDB API (movies, TV shows, trailers, reviews, watch providers)
- Wikipedia MediaWiki API

---

## 🔐 Authentication & Security
- Supabase Authentication
- Row Level Security (RLS) enabled on all tables
- Secure environment variables (no secrets exposed)

---

## 🚀 Getting Started (Local Development)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/cinevault.git
cd cinevault

👤 Author
Divyansh Rajput
Full Stack Developer
Project built for Movies/Tv Shows
