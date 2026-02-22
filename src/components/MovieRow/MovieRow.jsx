import MovieCard from '../MovieCard/MovieCard';

export default function MovieRow({ title, movies, showRank = false }) {
    if (!movies || movies.length === 0) return null;

    return (
        <section className="movie-row" id={`row-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            <h2>{title}</h2>
            <div className="netflix-row-scroll">
                {movies.map((movie, index) => (
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                        index={index}
                        rank={showRank ? index + 1 : null}
                    />
                ))}
            </div>
        </section>
    );
}
