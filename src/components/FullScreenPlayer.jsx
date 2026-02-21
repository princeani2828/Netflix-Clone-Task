import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import useMovieStore from '../store/useMovieStore';

export default function FullScreenPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoContainerRef = useRef(null);
    const playerRef = useRef(null);
    const hideTimerRef = useRef(null);
    const { movies, currentlyPlaying, playMovie, stopPlayback } = useMovieStore();

    // Fall back to finding the movie from the store via the URL id if currentlyPlaying state is empty
    const movieToPlay = currentlyPlaying || movies.find(m => m.id === Number(id));

    const [showControls, setShowControls] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [bufferedPercent, setBufferedPercent] = useState(0);

    // Call backend API if user navigates directly here
    useEffect(() => {
        if (!currentlyPlaying && movieToPlay) {
            playMovie(movieToPlay);
        }
    }, [currentlyPlaying, movieToPlay, playMovie]);

    const handleBack = useCallback(() => {
        stopPlayback();
        navigate(-1);
    }, [stopPlayback, navigate]);

    const activityDetected = useCallback(() => {
        setShowControls(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    }, []);

    const togglePlay = useCallback((e) => {
        if (e) e.stopPropagation();
        const player = playerRef.current;
        if (player) {
            if (player.paused()) {
                player.play();
            } else {
                player.pause();
            }
        }
    }, []);

    const toggleMute = useCallback((e) => {
        if (e) e.stopPropagation();
        const player = playerRef.current;
        if (player) {
            player.muted(!player.muted());
        }
    }, []);

    const handleVolumeChange = useCallback((e) => {
        const newVolume = parseFloat(e.target.value);
        const player = playerRef.current;
        if (player) {
            player.volume(newVolume);
            player.muted(newVolume === 0);
        }
    }, []);

    const seekTo = (e) => {
        const player = playerRef.current;
        if (player && duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            // Handle both touch and mouse events
            const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
            const clickX = clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            player.currentTime(newTime);
        }
    };

    const handleProgressClick = useCallback((e) => {
        e.stopPropagation();
        seekTo(e);
    }, [duration]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Initialize Video.js player
    useEffect(() => {
        if (!currentlyPlaying || !videoContainerRef.current) return;

        // Clean up previous player if it exists
        if (playerRef.current) {
            playerRef.current.dispose();
            playerRef.current = null;
        }

        const videoElement = document.createElement('video-js');
        videoElement.classList.add('vjs-big-play-centered', 'vjs-fill');
        // Mobile optimization: playsinline is crucial for iOS autoplay/inline playback
        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('webkit-playsinline', 'true');
        videoElement.setAttribute('x5-playsinline', 'true');

        videoContainerRef.current.appendChild(videoElement);

        const player = videojs(videoElement, {
            autoplay: true,
            controls: false, // We use our own custom controls
            responsive: true,
            fluid: false,
            fill: true,
            preload: 'auto',
            playbackRates: [0.5, 1, 1.25, 1.5, 2],
            userActions: {
                doubleClick: false, // Disable default fullscreen on double click since we have custom controls
                hotkeys: true
            },
            sources: [{
                src: currentlyPlaying.streamUrl,
                type: 'video/mp4',
            }],
        }, () => {
            console.log(`🎬 Video.js player ready — streaming "${currentlyPlaying.name}"`);
            // Attempt to autoplay (browsers might block it if not muted)
            const playPromise = player.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay blocked, waiting for user interaction", error);
                    setIsPlaying(false);
                });
            }
        });

        // Event listeners
        player.on('timeupdate', () => {
            const ct = player.currentTime();
            const dur = player.duration();
            setCurrentTime(ct);
            setDuration(dur);
            setProgress((ct / dur) * 100 || 0);
        });

        player.on('progress', () => {
            if (player.buffered().length > 0) {
                setBufferedPercent(player.bufferedPercent() * 100);
            }
        });

        player.on('play', () => setIsPlaying(true));
        player.on('pause', () => setIsPlaying(false));
        player.on('volumechange', () => {
            setVolume(player.volume());
            setIsMuted(player.muted());
        });

        playerRef.current = player;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [currentlyPlaying]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const player = playerRef.current;
            if (!player) return;

            activityDetected(); // Show controls when key is pressed

            switch (e.key) {
                case 'Escape':
                    handleBack();
                    break;
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'm':
                case 'M':
                    toggleMute();
                    break;
                case 'ArrowLeft':
                    player.currentTime(player.currentTime() - 10);
                    break;
                case 'ArrowRight':
                    player.currentTime(player.currentTime() + 10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    player.volume(Math.min(1, player.volume() + 0.1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    player.volume(Math.max(0, player.volume() - 0.1));
                    break;
                case 'f':
                case 'F':
                    if (player.isFullscreen()) {
                        player.exitFullscreen();
                    } else {
                        player.requestFullscreen();
                    }
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleBack, togglePlay, toggleMute, activityDetected]);

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, []);

    if (!currentlyPlaying) return null;

    return (
        <div
            className="fullscreen-player select-none touch-none"
            onMouseMove={activityDetected}
            onTouchStart={activityDetected}
            onClick={togglePlay}
            id="fullscreen-player"
        >
            {/* Video.js Player Container */}
            <div
                ref={videoContainerRef}
                className="absolute inset-0 w-full h-full [&_.video-js]:w-full [&_.video-js]:h-full [&_.video-js_.vjs-tech]:object-contain [&_.video-js]:bg-black overflow-hidden"
            />

            {/* Back Button (top-left) */}
            <button
                className={`back-btn ${showControls ? 'visible' : ''} active:scale-90 transition-transform`}
                onClick={(e) => {
                    e.stopPropagation();
                    handleBack();
                }}
                id="back-button"
                aria-label="Go back"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-bold">Back</span>
            </button>

            {/* Bottom Controls Container */}
            <div
                className={`fixed inset-x-0 bottom-0 z-[60] transition-all duration-500 ease-in-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Visual Feedback: Dark Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />

                <div className="relative px-10 pb-12 md:px-24 md:pb-24 pt-10 max-w-[1920px] mx-auto">
                    {/* Progress Bar with larger hit area for mobile */}
                    <div className="mb-6 relative group h-6 flex items-center">
                        <div
                            className="w-full h-1 bg-white/30 rounded-full cursor-pointer transition-all relative overflow-hidden group-hover:h-2"
                            onClick={handleProgressClick}
                            onTouchStart={handleProgressClick}
                            id="progress-bar-container"
                        >
                            {/* Buffered Amount */}
                            <div
                                className="absolute h-full bg-white/20 rounded-full transition-all duration-500"
                                style={{ width: `${bufferedPercent}%` }}
                            />
                            {/* Progress Filled */}
                            <div
                                className="h-full bg-netflix-red relative z-10 transition-all duration-150"
                                style={{ width: `${progress}%` }}
                            >
                                {/* Knob - Visible on hover or active */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-netflix-red rounded-full shadow-[0_0_15px_rgba(229,9,20,0.8)] scale-0 group-hover:scale-100 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Meta info & Controls Row - Refactored for centered playback controls */}
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                        {/* Movie Info - Left */}
                        <div className="flex-1 flex flex-col gap-3 order-2 md:order-1 md:pr-12">
                            <h2 className="text-2xl md:text-4xl font-black text-white drop-shadow-2xl tracking-tight leading-tight">
                                {currentlyPlaying.name}
                            </h2>
                            <div className="flex items-center gap-5 text-xs md:text-sm font-bold">
                                <span className="text-green-500">98% Match</span>
                                <span className="text-gray-400">{currentlyPlaying.year}</span>
                                <span className="px-2.5 py-1 border border-white/20 text-white/60 rounded text-[10px] md:text-xs bg-white/5 uppercase tracking-wider">
                                    {currentlyPlaying.rating}
                                </span>
                                <span className="text-gray-400">{currentlyPlaying.duration}</span>
                            </div>
                        </div>

                        {/* Main Playback Controls - Center */}
                        <div className="flex items-center justify-center gap-8 md:gap-12 order-1 md:order-2">
                            {/* Playback Controls Group */}
                            <div className="flex items-center gap-8 md:gap-10">
                                {/* Rewind 10 */}
                                <button
                                    className="text-white hover:text-white/80 active:scale-90 transition-all flex flex-col items-center"
                                    onClick={() => playerRef.current && playerRef.current.currentTime(playerRef.current.currentTime() - 10)}
                                    title="Rewind 10s"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span className="text-[10px] font-bold mt-[-8px]">10</span>
                                </button>

                                {/* Main Play/Pause Button */}
                                <button
                                    className="bg-black/60 border border-white/20 text-white backdrop-blur-md w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
                                    onClick={togglePlay}
                                    aria-label={isPlaying ? 'Pause' : 'Play'}
                                    id="play-pause-btn"
                                >
                                    {isPlaying ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 ml-0.5 md:ml-1" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                </button>

                                {/* Forward 10 */}
                                <button
                                    className="text-white hover:text-white/80 active:scale-90 transition-all flex flex-col items-center"
                                    onClick={() => playerRef.current && playerRef.current.currentTime(playerRef.current.currentTime() + 10)}
                                    title="Forward 10s"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                    <span className="text-[10px] font-bold mt-[-8px]">10</span>
                                </button>
                            </div>
                        </div>

                        {/* Secondary Controls - Right */}
                        <div className="flex-1 flex items-center justify-between md:justify-end gap-6 order-3">
                            <div className="flex items-center gap-6">
                                {/* Time display - Always visible */}
                                <div className="text-sm md:text-base font-bold text-gray-200 tabular-nums pr-2">
                                    {formatTime(currentTime)} <span className="text-gray-500 mx-1">/</span> {formatTime(duration)}
                                </div>

                                {/* Volume */}
                                <div className="hidden md:flex items-center gap-2 group/vol">
                                    <button
                                        className="text-white hover:text-gray-300 transition-colors"
                                        onClick={toggleMute}
                                    >
                                        {isMuted || volume === 0 ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6h2.25l5.625-5.625v18.75L9 15.75H6.75A2.25 2.25 0 014.5 13.5v-3a2.25 2.25 0 012.25-2.25z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                                            </svg>
                                        )}
                                    </button>
                                    <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 ease-out">
                                        <input
                                            type="range" min="0" max="1" step="0.05"
                                            value={isMuted ? 0 : volume}
                                            onChange={handleVolumeChange}
                                            className="w-full accent-white cursor-pointer h-1 rounded-full"
                                        />
                                    </div>
                                </div>

                                {/* Fullscreen */}
                                <button
                                    className="text-white hover:scale-110 transition-all"
                                    onClick={() => {
                                        const player = playerRef.current;
                                        if (player) {
                                            if (player.isFullscreen()) player.exitFullscreen();
                                            else player.requestFullscreen();
                                        }
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

