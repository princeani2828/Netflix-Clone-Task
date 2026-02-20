import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import useMovieStore from '../store/useMovieStore';

export default function MovieCard({ movie, index, rank }) {
    const navigate = useNavigate();
    const videoContainerRef = useRef(null);
    const playerRef = useRef(null);
    const hoverTimeoutRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { setHoveredMovie, playMovie, hoveredMovieId, watchedMovieIds } = useMovieStore();

    const isCurrentlyHovered = hoveredMovieId === movie.id;
    const isWatched = watchedMovieIds.includes(movie.id);

    // Simulated watch progress for "Continue Watching" style
    const watchProgress = useMemo(() => {
        const seed = movie.id * 17 + 23;
        return (seed % 46) + 40; // 40% to 85%
    }, [movie.id]);

    // Initialize Video.js player on hover
    useEffect(() => {
        if (isHovered && videoContainerRef.current && !playerRef.current) {
            const videoElement = document.createElement('video-js');
            videoContainerRef.current.innerHTML = '';
            videoContainerRef.current.appendChild(videoElement);

            const player = videojs(videoElement, {
                autoplay: false,
                controls: false,
                muted: true,
                loop: true,
                preload: 'auto',
                fluid: false,
                fill: true,
                sources: [{
                    src: movie.streamUrl,
                    type: 'video/mp4',
                }],
            }, () => {
                setVideoReady(true);
            });

            playerRef.current = player;
        }
    }, [isHovered, movie.streamUrl]);

    // Play/pause based on hover state
    useEffect(() => {
        const player = playerRef.current;
        if (!player || player.isDisposed()) return;

        if (isCurrentlyHovered && videoReady) {
            player.play().catch(() => { });
        } else {
            player.pause();
        }
    }, [isCurrentlyHovered, videoReady]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    const handleMouseEnter = useCallback(() => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(true);
            setHoveredMovie(movie.id);
        }, 300);
    }, [movie.id, setHoveredMovie]);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsHovered(false);
        setHoveredMovie(null);
        const player = playerRef.current;
        if (player && !player.isDisposed()) {
            player.pause();
            player.currentTime(0);
        }
    }, [setHoveredMovie]);

    const handleClick = useCallback(() => {
        if (playerRef.current && !playerRef.current.isDisposed()) {
            playerRef.current.dispose();
            playerRef.current = null;
            setVideoReady(false);
            setIsHovered(false);
        }
        playMovie(movie);
        navigate(`/play/${movie.id}`);
    }, [movie, playMovie, navigate]);

    return (
        <div
            className="netflix-card group"
            style={{ animationDelay: `${index * 0.06}s` }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            id={`movie-card-${movie.id}`}
            tabIndex={0}
            aria-label={`Play ${movie.name}`}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
            {/* Rank Number */}
            {rank && (
                <div className="netflix-card-rank">
                    <span className="netflix-rank-number" data-rank={rank}>
                        {rank}
                    </span>
                </div>
            )}

            {/* Poster */}
            <div className="netflix-card-poster">
                {/* Thumbnail */}
                {!imageError ? (
                    <img
                        src={movie.logo}
                        alt={movie.name}
                        loading="lazy"
                        className={`w-full h-full object-cover transition-opacity duration-500 ${isCurrentlyHovered && videoReady ? 'opacity-0' : 'opacity-100'
                            }`}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-netflix-card to-netflix-black flex items-center justify-center">
                        <span className="text-xs font-bold text-white/50 text-center px-1">{movie.name}</span>
                    </div>
                )}

                {/* Video.js Preview */}
                {isHovered && (
                    <div
                        ref={videoContainerRef}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${videoReady ? 'opacity-100' : 'opacity-0'
                            } [&_.video-js]:w-full [&_.video-js]:h-full [&_.video-js_.vjs-tech]:object-cover [&_.video-js]:bg-transparent [&_.vjs-control-bar]:hidden`}
                    />
                )}

                {/* Hover overlay with info */}
                <div className="netflix-card-overlay">
                    <p className="text-white text-[11px] font-semibold leading-tight line-clamp-1">
                        {movie.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-green-400 font-bold">{movie.match}%</span>
                        <span className="text-[10px] text-gray-400">{movie.rating}</span>
                    </div>
                </div>

                {/* Continue Watching Progress Bar — only for actually watched movies */}
                {isWatched && (
                    <div className="absolute bottom-0 left-0 right-0 z-20">
                        <div className="w-full h-[3px] bg-gray-600/80">
                            <div
                                className="h-full bg-netflix-red rounded-r-sm"
                                style={{ width: `${watchProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
