import { useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MovieRow from './components/MovieRow';
import FullScreenPlayer from './components/FullScreenPlayer';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';
import useMovieStore from './store/useMovieStore';

function App() {
  const { movies, loading, error, currentlyPlaying, fetchMovies } = useMovieStore();

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Show error screen
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-netflix-black" id="error-screen">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchMovies}
            className="px-6 py-3 bg-netflix-red text-white font-bold rounded hover:bg-netflix-red-dark transition-colors"
            id="retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Categorize movies into rows
  const trendingMovies = movies.slice(0, 3);
  const popularMovies = movies.slice(3, 6);
  const newReleases = movies.slice(6, 9);

  return (
    <div className="min-h-screen bg-netflix-black" id="app-container">
      {/* Full Screen Player (overlays everything when active) */}
      {currentlyPlaying && <FullScreenPlayer />}

      {/* Main Content (hidden when playing) */}
      <div className={currentlyPlaying ? 'hidden' : ''}>
        <Navbar />

        <main>
          {/* Hero Banner */}
          <HeroSection />

          {/* Movie Rows */}
          <div className="relative z-10 -mt-16 pb-8" id="movie-rows">
            <MovieRow title="🔥 Trending Now" movies={trendingMovies} />
            <MovieRow title="⭐ Popular on Netflix" movies={popularMovies} />
            <MovieRow title="🆕 New Releases" movies={newReleases} />
            <MovieRow title="🎬 All Movies" movies={movies} />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
