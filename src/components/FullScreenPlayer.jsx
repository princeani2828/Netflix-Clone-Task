import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import useMovieStore from '../store/useMovieStore';

export default function FullScreenPlayer() {
    const videoContainerRef = useRef(null);
    const playerRef = useRef(null);
    const hideTimerRef = useRef(null);
    const { currentlyPlaying, stopPlayback } = useMovieStore();
    const [showControls, setShowControls] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [bufferedPercent, setBufferedPercent] = useState(0);

    const handleBack = useCallback(() => {
        stopPlayback();
    }, [stopPlayback]);

    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    }, []);

    const togglePlay = useCallback(() => {
        const player = playerRef.current;
        if (player) {
            if (player.paused()) {
                player.play();
            } else {
                player.pause();
            }
        }
    }, []);

    const toggleMute = useCallback(() => {
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

    const handleProgressClick = useCallback((e) => {
        const player = playerRef.current;
        if (player && duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            player.currentTime(newTime);
        }
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

        const videoElement = document.createElement('video-js');
        videoElement.classList.add('vjs-big-play-centered');
        videoContainerRef.current.appendChild(videoElement);

        const player = videojs(videoElement, {
            autoplay: true,
            controls: false, // We use our own custom controls
            responsive: true,
            fluid: false,
            fill: true,
            preload: 'auto',
            playbackRates: [0.5, 1, 1.25, 1.5, 2],
            sources: [{
                src: currentlyPlaying.streamUrl,
                type: 'video/mp4',
            }],
            html5: {
                vhs: {
                    overrideNative: true,
                },
                nativeAudioTracks: false,
                nativeVideoTracks: false,
            },
        }, () => {
            console.log(`🎬 Video.js player ready — streaming "${currentlyPlaying.name}"`);
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
            setBufferedPercent(player.bufferedPercent() * 100);
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
    }, [handleBack, togglePlay, toggleMute]);

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, []);

    if (!currentlyPlaying) return null;

    return (
        <div
            className="fullscreen-player"
            onMouseMove={handleMouseMove}
            onClick={togglePlay}
            id="fullscreen-player"
        >
            {/* Video.js Player Container */}
            <div
                ref={videoContainerRef}
                className="absolute inset-0 w-full h-full [&_.video-js]:w-full [&_.video-js]:h-full [&_.video-js_.vjs-tech]:object-contain [&_.video-js]:bg-black"
            />

            {/* Player Badge */}
            <div className={`fixed top-5 right-5 z-[70] transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-xs font-semibold text-white/80 tracking-wide">VLC.js Player</span>
                </div>
            </div>

            {/* Back Button (top-left, transparent) */}
            <button
                className={`back-btn ${showControls ? 'visible' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    handleBack();
                }}
                id="back-button"
                aria-label="Go back"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
            </button>

            {/* Bottom Controls */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[60] transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                <div className="relative px-4 md:px-8 pb-6 pt-16">
                    {/* Movie Title */}
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg md:text-2xl font-bold text-white">
                            {currentlyPlaying.name}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-orange-400 font-semibold">● LIVE</span>
                            <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded">
                                {currentlyPlaying.rating}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div
                        className="w-full h-1 bg-white/20 rounded-full cursor-pointer group mb-4 hover:h-1.5 transition-all relative"
                        onClick={handleProgressClick}
                        id="progress-bar"
                    >
                        {/* Buffered */}
                        <div
                            className="absolute h-full bg-white/20 rounded-full"
                            style={{ width: `${bufferedPercent}%` }}
                        />
                        {/* Progress */}
                        <div
                            className="h-full bg-netflix-red rounded-full relative z-10 transition-all"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-netflix-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                        </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Play/Pause */}
                            <button
                                className="text-white hover:text-gray-300 transition-colors"
                                onClick={togglePlay}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                                id="play-pause-btn"
                            >
                                {isPlaying ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* Skip Back 10s */}
                            <button
                                className="text-white hover:text-gray-300 transition-colors hidden sm:block"
                                onClick={() => playerRef.current && playerRef.current.currentTime(playerRef.current.currentTime() - 10)}
                                aria-label="Rewind 10 seconds"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                                </svg>
                            </button>

                            {/* Skip Forward 10s */}
                            <button
                                className="text-white hover:text-gray-300 transition-colors hidden sm:block"
                                onClick={() => playerRef.current && playerRef.current.currentTime(playerRef.current.currentTime() + 10)}
                                aria-label="Forward 10 seconds"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                                </svg>
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-2 group/vol">
                                <button
                                    className="text-white hover:text-gray-300 transition-colors"
                                    onClick={toggleMute}
                                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                                    id="mute-btn"
                                >
                                    {isMuted || volume === 0 ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-0 group-hover/vol:w-20 transition-all duration-300 accent-netflix-red cursor-pointer"
                                    aria-label="Volume"
                                    id="volume-slider"
                                />
                            </div>

                            {/* Time */}
                            <span className="text-sm text-gray-400 font-medium tabular-nums">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 hidden sm:inline">
                                {currentlyPlaying.genre} • {currentlyPlaying.year} • {currentlyPlaying.duration}
                            </span>
                            {/* Fullscreen Toggle */}
                            <button
                                className="text-white hover:text-gray-300 transition-colors"
                                onClick={() => {
                                    const player = playerRef.current;
                                    if (player) {
                                        if (player.isFullscreen()) player.exitFullscreen();
                                        else player.requestFullscreen();
                                    }
                                }}
                                aria-label="Toggle fullscreen"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
