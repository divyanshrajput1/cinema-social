const TMDBAttribution = () => {
  return (
    <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
      <span>Powered by</span>
      <a
        href="https://www.themoviedb.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
      >
        <svg 
          className="w-20 h-auto"
          viewBox="0 0 185.04 133.4" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="tmdb-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#90CEA1" />
              <stop offset="100%" stopColor="#01B4E4" />
            </linearGradient>
          </defs>
          <g fill="url(#tmdb-gradient)">
            <path d="M51.06,66.7h0A17.67,17.67,0,0,1,68.73,49h0a17.67,17.67,0,0,1,17.67,17.67h0A17.67,17.67,0,0,1,68.73,84.37h0A17.67,17.67,0,0,1,51.06,66.7Zm-6.35,0h0A24,24,0,0,0,68.73,90.72h0A24,24,0,0,0,92.75,66.7h0A24,24,0,0,0,68.73,42.68h0A24,24,0,0,0,44.71,66.7Z"/>
            <path d="M0,49h6.35V84.37H0Z"/>
            <path d="M17.67,49H35.35a24,24,0,0,1,0,48H17.67Zm6.35,6.35V78h11.33a17.67,17.67,0,0,0,0-35.34Z"/>
            <path d="M103.41,66.7h0a24,24,0,0,1,24-24h0a24,24,0,0,1,24,24h0a24,24,0,0,1-24,24h0A24,24,0,0,1,103.41,66.7Zm6.35,0h0a17.67,17.67,0,0,0,17.67,17.67h0A17.67,17.67,0,0,0,145.1,66.7h0A17.67,17.67,0,0,0,127.43,49h0A17.67,17.67,0,0,0,109.76,66.7Z"/>
            <path d="M162,66.7V49h6.35v35.35H162V78h0a17.67,17.67,0,0,1,0-11.33Z"/>
            <path d="M179.64,49h5.4l-12.7,35.35h-6.35L153.29,49h5.4l10.48,29.1Z"/>
          </g>
        </svg>
      </a>
    </div>
  );
};

export default TMDBAttribution;
