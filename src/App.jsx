import { useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MovieRow from './components/MovieRow';
import FullScreenPlayer from './components/FullScreenPlayer';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';
import useMovieStore from './store/useMovieStore';

function App() {
  const { movies, loading, error, currentlyPlaying, fetchMovies, watchedMovieIds } = useMovieStore();

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
  const top10Movies = movies.slice(0, 10);
  const popularMovies = movies.filter(m => m.match >= 90);
  const newReleases = movies.filter(m => m.year >= 2012);

  // Continue Watching — only movies the user has actually played, in watch order
  const continueWatchingMovies = watchedMovieIds
    .map(id => movies.find(m => m.id === id))
    .filter(Boolean);

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
          <div className="relative z-10 -mt-24 pb-12" id="movie-rows">
            <MovieRow title="Top 10 in India Today" movies={top10Movies} showRank />
            <MovieRow title="Popular on Netflix" movies={popularMovies} />
            <MovieRow title="New Releases" movies={newReleases} />
            {continueWatchingMovies.length > 0 && (
              <MovieRow title="Continue Watching" movies={continueWatchingMovies} />
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
