import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import MovieRow from './components/MovieRow/MovieRow';
import MovieCard from './components/MovieCard/MovieCard';
import FullScreenPlayer from './components/FullScreenPlayer/FullScreenPlayer';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import Footer from './components/Footer/Footer';
import useMovieStore from './store/useMovieStore';

function App() {
  const { movies, loading, error, fetchMovies, watchedMovieIds, searchQuery, searchResults, isSearching } = useMovieStore();

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
      <div className="flex items-center justify-center bg-netflix-black" id="error-screen">
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
  const newAndPopular = movies.filter(m => m.match >= 90);
  const newReleases = movies.filter(m => m.year >= 2012);
  const tvShows = movies.filter(m => m.duration?.includes('Season'));


  const continueWatchingMovies = watchedMovieIds
    .map(id => movies.find(m => m.id === id))
    .filter(Boolean);

  const isSearchActive = searchQuery && searchQuery.trim().length > 0;

  const homeElement = (
    <div>
      <Navbar />
      <main>
        {isSearchActive ? (
          /* Search Results View */
          <div className="pb-16 px-[4%]" style={{ paddingTop: '140px' }} id="search-results">
            <div className="mb-10">
              <h2 className="text-xl md:text-2xl font-semibold text-netflix-light">
                {isSearching ? (
                  <span className="flex items-center gap-3">
                    <span className="inline-block w-5 h-5 border-2 border-netflix-red border-t-transparent rounded-full animate-spin"></span>
                    Searching...
                  </span>
                ) : searchResults.length > 0 ? (
                  <>Results for &quot;<span className="text-white">{searchQuery}</span>&quot;</>
                ) : (
                  <>No results for &quot;<span className="text-white">{searchQuery}</span>&quot;</>
                )}
              </h2>
              {!isSearching && searchResults.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">{searchResults.length} title{searchResults.length !== 1 ? 's' : ''} found</p>
              )}
            </div>

            {!isSearching && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-gray-700 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-400 text-lg mb-2">No movies or shows matched your search.</p>
                <p className="text-gray-500 text-sm">Try searching for a different title, genre, or keyword.</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="search-results-grid">
                {searchResults.map((movie, index) => (
                  <MovieCard key={movie.id} movie={movie} index={index} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Normal Home View */
          <>
            <HeroSection />
            <div className="relative -mt-24 pb-12" id="movie-rows">
              <MovieRow title="Top 10 in the World Today" movies={top10Movies} showRank />
              <MovieRow title="New Releases" movies={[...newReleases].reverse()} />
              <MovieRow title="TV Shows" movies={tvShows} />
              <MovieRow title="Movies" movies={[...newReleases].reverse()} />
              <MovieRow title="New & Popular" movies={newAndPopular} />
              {continueWatchingMovies.length > 0 && (
                <MovieRow title="Continue Watching" movies={continueWatchingMovies} />
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="bg-netflix-black" id="app-container">
      <Routes>
        <Route path="/" element={homeElement} />
        <Route path="/play/:id" element={<FullScreenPlayer />} />
      </Routes>
    </div>
  );
}

export default App;
