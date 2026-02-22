const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;

const initialMovies = require('./movies_data');

/**
 * Async Validation middleware
 * Ensures the movieId in the request is a valid integer and exists in the database.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
const validateMovieId = async (req, res, next) => {
    const { movieId } = req.params;
    const id = Number.parseInt(movieId, 10);

    if (Number.isNaN(id) || id < 1) {
        return res.status(400).json({
            success: false,
            error: 'Invalid movie ID. Must be a positive integer.',
        });
    }

    try {
        const movie = await db.get('SELECT * FROM movies WHERE id = ?', [id]);
        if (!movie) {
            return res.status(404).json({
                success: false,
                error: `Movie with ID ${id} not found.`,
            });
        }
        req.movie = movie;
        next();
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

/**
 * GET /movies and /api/movies
 * Returns a complete list of all movies in the database.
 */
app.get(['/movies', '/api/movies'], async (req, res) => {
    try {
        const movies = await db.all('SELECT * FROM movies');
        res.json({
            success: true,
            count: movies.length,
            data: movies,
        });
    } catch (err) {
        console.error('Error fetching movies:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching movies.',
        });
    }
});

/**
 * GET /movies/search and /api/movies/search
 * Search movies by name, genre, or description using SQL LIKE.
 * 
 * @query {string} q - Search query term
 */
app.get(['/movies/search', '/api/movies/search'], async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) {
            return res.json({ success: true, count: 0, data: [] });
        }
        const searchTerm = `%${q.trim()}%`;
        const movies = await db.all(
            'SELECT * FROM movies WHERE name LIKE ? OR genre LIKE ? OR description LIKE ?',
            [searchTerm, searchTerm, searchTerm]
        );
        res.json({
            success: true,
            count: movies.length,
            data: movies,
        });
    } catch (err) {
        console.error('Error searching movies:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error while searching movies.',
        });
    }
});

/**
 * GET /movies/:movieId and /api/movies/:movieId
 * Returns a single movie metadata filtered by ID.
 */
app.get(['/movies/:movieId', '/api/movies/:movieId'], validateMovieId, (req, res) => {
    res.json({
        success: true,
        data: req.movie,
    });
});

/**
 * POST /play/:movieId and /api/play/:movieId
 * Simulates starting playback by logging the action and updating status.
 */
app.post(['/play/:movieId', '/api/play/:movieId'], validateMovieId, async (req, res) => {
    const movie = req.movie;
    const timestamp = new Date().toISOString();

    try {
        // Log the playback
        await db.run(
            'INSERT INTO playback_log (movie_id, movie_name, action, timestamp, status) VALUES (?, ?, ?, ?, ?)',
            [movie.id, movie.name, 'play', timestamp, 'streaming']
        );

        // Update movie status
        await db.run('UPDATE movies SET status = ? WHERE id = ?', ['streaming', movie.id]);

        console.log(`▶ Playback started: "${movie.name}" (ID: ${movie.id}) at ${timestamp}`);

        // Return updated movie
        const updatedMovie = await db.get('SELECT * FROM movies WHERE id = ?', [movie.id]);

        res.json({
            success: true,
            message: `Now streaming "${updatedMovie.name}"`,
            data: {
                ...updatedMovie,
                streamStatus: 'active',
                playbackStarted: timestamp,
            },
        });
    } catch (error) {
        console.error('Playback error:', error);
        res.status(500).json({ success: false, error: 'Failed to start playback' });
    }
});

/**
 * POST /stop/:movieId and /api/stop/:movieId
 * Simulates stopping playback and updates database status to 'available'.
 */
app.post(['/stop/:movieId', '/api/stop/:movieId'], validateMovieId, async (req, res) => {
    const movie = req.movie;
    const timestamp = new Date().toISOString();

    try {
        await db.run(
            'INSERT INTO playback_log (movie_id, movie_name, action, timestamp, status) VALUES (?, ?, ?, ?, ?)',
            [movie.id, movie.name, 'stop', timestamp, 'stopped']
        );

        await db.run('UPDATE movies SET status = ? WHERE id = ?', ['available', movie.id]);

        console.log(`⏹ Playback stopped: "${movie.name}" (ID: ${movie.id}) at ${timestamp}`);

        const updatedMovie = await db.get('SELECT * FROM movies WHERE id = ?', [movie.id]);

        res.json({
            success: true,
            message: `Playback stopped for "${movie.name}"`,
            data: {
                ...updatedMovie,
                streamStatus: 'inactive',
                playbackStopped: timestamp,
            },
        });
    } catch (error) {
        console.error('Stop error:', error);
        res.status(500).json({ success: false, error: 'Failed to stop playback' });
    }
});

/**
 * GET /api/playback-log
 * Returns the most recent 50 playback events (play/stop) from the log.
 */
app.get('/api/playback-log', async (req, res) => {
    try {
        const logs = await db.all('SELECT * FROM playback_log ORDER BY id DESC LIMIT 50');
        res.json({
            success: true,
            count: logs.length,
            data: logs,
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found.`,
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error.',
    });
});

// Initialize database and start server
const initDbAndStartServer = async () => {
    try {
        db = await open({
            filename: path.join(__dirname, 'database.sqlite'),
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS movies (
                id INTEGER PRIMARY KEY,
                name TEXT,
                genre TEXT,
                year INTEGER,
                rating TEXT,
                duration TEXT,
                description TEXT,
                logo TEXT,
                streamUrl TEXT,
                status TEXT DEFAULT 'available',
                match INTEGER
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS playback_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                movie_id INTEGER,
                movie_name TEXT,
                action TEXT,
                timestamp TEXT,
                status TEXT
            )
        `);

        // Check if movies are empty, if so, populate initial data
        const row = await db.get('SELECT COUNT(*) as count FROM movies');
        if (row.count === 0) {
            const stmt = await db.prepare(`
                INSERT INTO movies (id, name, genre, year, rating, duration, description, logo, streamUrl, status, match)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            for (const movie of initialMovies) {
                await stmt.run(
                    movie.id, movie.name, movie.genre, movie.year, movie.rating,
                    movie.duration, movie.description, movie.logo, movie.streamUrl,
                    movie.status, movie.match
                );
            }
            await stmt.finalize();
            console.log('Database initialized with initial movie data.');
        }

        app.listen(PORT, () => {
            console.log(`
            Netflix Clone API Server           
            Running on http://localhost:${PORT}       
            Endpoints:                             
            GET  /movies                       
            GET  /movies/:id                   
            POST /play/:id                     
            POST /stop/:id                     
            GET  /api/playback-log                 
            GET  /api/health                       
            `);
        });
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
};

initDbAndStartServer();
