import { useRef, useState, useEffect, useCallback } from 'react';
import useMovieStore from '../store/useMovieStore';

export default function FullScreenPlayer() {
    const videoRef = useRef(null);
    const hideTimerRef = useRef(null);
    const { currentlyPlaying, stopPlayback } = useMovieStore();
    const [showControls, setShowControls] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

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
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const handleVolumeChange = useCallback((e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    }, []);

    const handleProgressClick = useCallback((e) => {
        if (videoRef.current && duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            videoRef.current.currentTime = newTime;
        }
    }, [duration]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            setProgress((video.currentTime / video.duration) * 100 || 0);
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);

        video.play().catch(() => { });

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [currentlyPlaying]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
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
                    if (videoRef.current) videoRef.current.currentTime -= 10;
                    break;
                case 'ArrowRight':
                    if (videoRef.current) videoRef.current.currentTime += 10;
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleBack, togglePlay, toggleMute]);

    // Clean up timer on unmount
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
            {/* Video */}
            <video
                ref={videoRef}
                src={currentlyPlaying.streamUrl}
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
            />

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
                    <h2 className="text-lg md:text-2xl font-bold text-white mb-2">
                        {currentlyPlaying.name}
                    </h2>

                    {/* Progress Bar */}
                    <div
                        className="w-full h-1 bg-white/20 rounded-full cursor-pointer group mb-4 hover:h-1.5 transition-all"
                        onClick={handleProgressClick}
                        id="progress-bar"
                    >
                        <div
                            className="h-full bg-netflix-red rounded-full relative transition-all"
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
                                {currentlyPlaying.genre} • {currentlyPlaying.year}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
