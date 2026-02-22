import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

/**
 * Reusable Video.js player wrapper component.
 * Uses VLC.js-style Video.js player for professional media playback.
 *
 * @param {Object} props
 * @param {Object} props.options - Video.js player options
 * @param {Function} props.onReady - Callback when player is ready
 * @param {string} props.className - Additional CSS classes
 */
export default function VideoJSPlayer({ options, onReady, className = '' }) {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        // Make sure Video.js player is only initialized once
        if (!playerRef.current) {
            const videoElement = document.createElement('video-js');
            videoElement.classList.add('vjs-big-play-centered');

            if (videoRef.current) {
                videoRef.current.appendChild(videoElement);
            }

            const player = videojs(videoElement, options, () => {
                if (onReady) {
                    onReady(player);
                }
            });

            playerRef.current = player;
        } else {
            // Update existing player with new source
            const player = playerRef.current;
            if (options.sources && options.sources.length > 0) {
                player.src(options.sources);
            }
            if (options.autoplay !== undefined) {
                player.autoplay(options.autoplay);
            }
        }
    }, [options, onReady]);

    // Dispose the Video.js player when the component unmounts
    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    return (
        <div data-vjs-player className={className}>
            <div ref={videoRef} />
        </div>
    );
}
