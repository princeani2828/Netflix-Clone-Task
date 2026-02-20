import MovieCard from './MovieCard';

export default function MovieRow({ title, movies }) {
    if (!movies || movies.length === 0) return null;

    return (
        <section className="movie-row" id={`row-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            <h2>{title}</h2>
            <div className="movie-grid">
                {movies.map((movie, index) => (
                    <MovieCard key={movie.id} movie={movie} index={index} />
                ))}
            </div>
        </section>
    );
}
