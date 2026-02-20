import { useRef, useState, useCallback, useEffect } from 'react';
import useMovieStore from '../store/useMovieStore';

export default function MovieCard({ movie, index }) {
    const videoRef = useRef(null);
    const hoverTimeoutRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { setHoveredMovie, playMovie, hoveredMovieId, playbackStatus } = useMovieStore();

    const isCurrentlyHovered = hoveredMovieId === movie.id;
    const status = playbackStatus[movie.id] || 'available';

    const handleMouseEnter = useCallback(() => {
        // Small delay to prevent accidental hovers
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(true);
            setHoveredMovie(movie.id);
        }, 300);
    }, [movie.id, setHoveredMovie]);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setIsHovered(false);
        setHoveredMovie(null);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [setHoveredMovie]);

    const handleClick = useCallback(() => {
        playMovie(movie);
    }, [movie, playMovie]);

    // Play/pause video based on hover state
    useEffect(() => {
        if (isCurrentlyHovered && videoRef.current && videoLoaded) {
            videoRef.current.play().catch(() => { });
        } else if (!isCurrentlyHovered && videoRef.current) {
            videoRef.current.pause();
        }
    }, [isCurrentlyHovered, videoLoaded]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    const animationDelay = `${index * 0.08}s`;

    return (
        <div
            className="movie-card animate-fade-in-up"
            style={{ animationDelay }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            id={`movie-card-${movie.id}`}
            role="button"
            tabIndex={0}
            aria-label={`Play ${movie.name}`}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
            {/* Thumbnail Image */}
            {!imageError ? (
                <img
                    src={movie.logo}
                    alt={movie.name}
                    loading="lazy"
                    className={`transition-opacity duration-500 ${isCurrentlyHovered && videoLoaded ? 'opacity-0' : 'opacity-100'}`}
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-netflix-card to-netflix-black flex items-center justify-center">
                    <span className="text-lg font-bold text-white/50">{movie.name}</span>
                </div>
            )}

            {/* Preview Video (loaded on hover) */}
            {isHovered && (
                <video
                    ref={videoRef}
                    src={movie.streamUrl}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className={`transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoadedData={() => setVideoLoaded(true)}
                    onError={() => setVideoLoaded(false)}
                />
            )}

            {/* Status Indicator */}
            <div className="absolute top-3 right-3 z-10">
                <span className={`status-dot ${status}`} title={status} />
            </div>

            {/* Info Overlay */}
            <div className="movie-card-info">
                <h3 className="text-sm md:text-base font-bold text-white mb-1 line-clamp-1">
                    {movie.name}
                </h3>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="match-badge text-xs">{movie.match}% Match</span>
                    <span className="text-xs text-gray-400">{movie.rating}</span>
                    <span className="text-xs text-gray-400">{movie.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="genre-badge">{movie.genre}</span>
                    <span className="text-xs text-gray-500">{movie.year}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3">
                    <button
                        className="play-btn text-xs py-1.5 px-3"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                        id={`play-btn-${movie.id}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                    </button>
                    <button
                        className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center text-white hover:border-white transition-colors bg-black/40"
                        aria-label="Add to My List"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <button
                        className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center text-white hover:border-white transition-colors bg-black/40"
                        aria-label="Like"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
