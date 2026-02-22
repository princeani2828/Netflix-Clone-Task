import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import useMovieStore from '../../store/useMovieStore';

export default function HeroSection() {
    const navigate = useNavigate();
    const { movies, playMovie } = useMovieStore();
    const [heroMovies, setHeroMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoContainerRef = useRef(null);
    const [videoReady, setVideoReady] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const playerRef = useRef(null);

    useEffect(() => {
        if (movies.length > 0) {
            // Feature Avatar (ID 1), Spider-Man (ID 21), and Stranger Things (ID 2)
            const ids = [1, 21, 2];
            const featured = ids.map(id => movies.find(m => m.id === id)).filter(Boolean);
            if (featured.length === 0) {
                setHeroMovies(movies.slice(0, 3));
            } else {
                setHeroMovies(featured);
            }
        }
    }, [movies]);

    const heroMovie = heroMovies[currentIndex];

    // Initialize Video.js for hero background
    useEffect(() => {
        if (!heroMovie || !videoContainerRef.current) return;

        setVideoReady(false);
        const videoElement = document.createElement('video-js');
        videoContainerRef.current.innerHTML = '';
        videoContainerRef.current.appendChild(videoElement);

        const player = videojs(videoElement, {
            autoplay: true,
            controls: false,
            muted: isMuted,
            loop: true,
            preload: 'auto',
            fluid: false,
            fill: true,
            sources: [{
                src: heroMovie.streamUrl,
                type: 'video/mp4',
            }],
        }, () => {
            setVideoReady(true);
            console.log('Hero Video.js player ready');
        });

        playerRef.current = player;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [heroMovie]);

    // Auto-cycle through hero movies
    useEffect(() => {
        if (heroMovies.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % heroMovies.length);
        }, 15000); // Switch every 15 seconds

        return () => clearInterval(interval);
    }, [heroMovies]);

    const toggleMute = () => {
        const player = playerRef.current;
        if (player && !player.isDisposed()) {
            const newMuted = !player.muted();
            player.muted(newMuted);
            setIsMuted(newMuted);
        }
    };

    const handlePlay = () => {
        if (heroMovie) {
            playMovie(heroMovie);
            navigate(`/play/${heroMovie.id}`);
        }
    };

    const nextHero = () => {
        setCurrentIndex(prev => (prev + 1) % heroMovies.length);
    };

    const prevHero = () => {
        setCurrentIndex(prev => (prev - 1 + heroMovies.length) % heroMovies.length);
    };

    if (!heroMovie) return null;

    return (
        <section className="hero-section group" id="hero-section">
            {/* Background Video via Video.js */}
            <div className="absolute inset-0">
                {/* Poster/Fallback Image */}
                <img
                    key={`poster-${heroMovie.id}`}
                    src={heroMovie.logo}
                    alt={heroMovie.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoReady ? 'opacity-0' : 'opacity-100'}`}
                />
                {/* Video.js Container */}
                <div
                    ref={videoContainerRef}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${videoReady ? 'opacity-100' : 'opacity-0'
                        } [&_.video-js]:w-full [&_.video-js]:h-full [&_.video-js_.vjs-tech]:object-cover [&_.video-js]:bg-transparent [&_.vjs-control-bar]:hidden [&_.vjs-big-play-button]:hidden`}
                />
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-2xl text-left animate-fade-in-up" key={`content-${heroMovie.id}`}>
                <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-bold text-netflix-red tracking-widest uppercase">
                        Featured
                    </span>
                    <span className="match-badge text-sm">{heroMovie.match}% Match</span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight">
                    {heroMovie.name}
                </h1>

                <p className="text-sm md:text-base text-gray-200 mb-7 line-clamp-3 max-w-lg font-normal leading-relaxed">
                    {heroMovie.description}
                </p>

                <div className="flex items-center gap-2.5 mb-8 flex-wrap">
                    <span className="text-sm text-gray-300">{heroMovie.year}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-300">{heroMovie.rating}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-300">{heroMovie.duration}</span>
                    <span className="genre-badge">{heroMovie.genre}</span>
                </div>

                <div className="flex items-center gap-3" style={{ marginTop: '40px' }}>
                    <button
                        className="play-btn"
                        onClick={handlePlay}
                        id="hero-play-btn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                    </button>
                    <button
                        className="info-btn"
                        id="hero-info-btn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        More Info
                    </button>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevHero}
                className="absolute left-[1%] top-1/2 -translate-y-1/2 z-30 text-white/40 hover:text-white transition-all duration-300 group/prev"
                aria-label="Previous preview"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 transform group-hover/prev:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={nextHero}
                className="absolute right-[1%] top-1/2 -translate-y-1/2 z-30 text-white/40 hover:text-white transition-all duration-300 group/next"
                aria-label="Next preview"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 transform group-hover/next:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Slider Dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {heroMovies.map((m, idx) => (
                    <button
                        key={m.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-netflix-red w-8' : 'bg-gray-500 hover:bg-gray-400'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Volume / Mute Toggle */}
            <div className="absolute bottom-24 right-[4%] z-10 flex items-center gap-4">
                <button
                    className="volume-btn"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    id="hero-mute-btn"
                >
                    {isMuted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                    )}
                </button>
            </div>
        </section>
    );
}
