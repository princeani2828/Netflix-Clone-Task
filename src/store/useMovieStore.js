import { create } from 'zustand';
import axios from 'axios';

const API_BASE = '/api';

const useMovieStore = create((set, get) => ({
    // State
    movies: [],
    loading: true,
    error: null,
    currentlyPlaying: null, // movie being played fullscreen
    hoveredMovieId: null,
    playbackStatus: {}, // { [movieId]: 'available' | 'streaming' }
    watchedMovieIds: [], // IDs of movies user has played (most recent first)
    searchQuery: '',
    searchResults: [],
    isSearching: false,

    // Actions
    fetchMovies: async () => {
        try {
            set({ loading: true, error: null });
            const response = await axios.get(`${API_BASE}/movies`);
            if (response.data.success) {
                const movies = response.data.data;
                const playbackStatus = {};
                movies.forEach((m) => {
                    playbackStatus[m.id] = m.status;
                });
                set({ movies, playbackStatus, loading: false });
            }
        } catch (error) {
            console.error('Failed to fetch movies:', error);
            set({
                error: 'Failed to load movies. Please try again.',
                loading: false,
            });
        }
    },

    setHoveredMovie: (movieId) => {
        set({ hoveredMovieId: movieId });
    },

    playMovie: async (movie) => {
        try {
            // Call backend to simulate playback
            await axios.post(`${API_BASE}/play/${movie.id}`);
            set((state) => ({
                currentlyPlaying: movie,
                playbackStatus: {
                    ...state.playbackStatus,
                    [movie.id]: 'streaming',
                },
                // Add to watched list (most recent first, no duplicates)
                watchedMovieIds: [
                    movie.id,
                    ...state.watchedMovieIds.filter((id) => id !== movie.id),
                ],
            }));
        } catch (error) {
            console.error('Failed to start playback:', error);
            // Still play locally even if backend call fails
            set((state) => ({
                currentlyPlaying: movie,
                watchedMovieIds: [
                    movie.id,
                    ...state.watchedMovieIds.filter((id) => id !== movie.id),
                ],
            }));
        }
    },

    stopPlayback: async () => {
        const { currentlyPlaying } = get();
        if (currentlyPlaying) {
            try {
                await axios.post(`${API_BASE}/stop/${currentlyPlaying.id}`);
            } catch (error) {
                console.error('Failed to log stop:', error);
            }
            set((state) => ({
                currentlyPlaying: null,
                playbackStatus: {
                    ...state.playbackStatus,
                    [currentlyPlaying.id]: 'available',
                },
            }));
        }
    },

    searchMovies: async (query) => {
        set({ searchQuery: query });
        if (!query || query.trim().length === 0) {
            set({ searchResults: [], isSearching: false });
            return;
        }
        set({ isSearching: true });
        try {
            const response = await axios.get(`${API_BASE}/movies/search`, {
                params: { q: query },
            });
            // Only update if the query hasn't changed while we were fetching
            if (get().searchQuery === query) {
                set({
                    searchResults: response.data.success ? response.data.data : [],
                    isSearching: false,
                });
            }
        } catch (error) {
            console.error('Search failed:', error);
            if (get().searchQuery === query) {
                set({ searchResults: [], isSearching: false });
            }
        }
    },

    clearSearch: () => {
        set({ searchQuery: '', searchResults: [], isSearching: false });
    },
}));

export default useMovieStore;
