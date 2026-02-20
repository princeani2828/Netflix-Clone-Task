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

// In-memory initial data for the database
const initialMovies = [
    {
        id: 1,
        name: 'Big Buck Bunny',
        genre: 'Animation',
        year: 2008,
        rating: 'PG',
        duration: '9 min',
        description: 'A large and lovable rabbit deals with three tiny bullies, led by a flying squirrel, who are determined to squelch his happiness.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        status: 'available',
        match: 98,
    },
    {
        id: 2,
        name: 'Stranger Things',
        genre: 'Sci-Fi',
        year: 2016,
        rating: 'TV-14',
        duration: '4 Seasons',
        description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/595/1489169.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        status: 'available',
        match: 95,
    },
    {
        id: 3,
        name: 'Breaking Bad',
        genre: 'Drama',
        year: 2008,
        rating: 'TV-MA',
        duration: '5 Seasons',
        description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/501/1253519.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        status: 'available',
        match: 99,
    },
    {
        id: 4,
        name: 'Chernobyl',
        genre: 'Drama',
        year: 2019,
        rating: 'TV-MA',
        duration: '1 Season',
        description: 'In April 1986, an explosion at the Chernobyl nuclear power plant in the Union of Soviet Socialist Republics becomes one of the world\'s worst man-made catastrophes.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/193/482599.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        status: 'available',
        match: 92,
    },
    {
        id: 5,
        name: 'Game of Thrones',
        genre: 'Fantasy',
        year: 2011,
        rating: 'TV-MA',
        duration: '8 Seasons',
        description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/498/1245274.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        status: 'available',
        match: 97,
    },
    {
        id: 6,
        name: 'The Mandalorian',
        genre: 'Sci-Fi',
        year: 2019,
        rating: 'TV-14',
        duration: '3 Seasons',
        description: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/501/1253498.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        status: 'available',
        match: 94,
    },
    {
        id: 7,
        name: 'Peaky Blinders',
        genre: 'Drama',
        year: 2013,
        rating: 'TV-MA',
        duration: '6 Seasons',
        description: 'A gangster family epic set in 1900s England, centering on a gang who sew razor blades in the peaks of their caps, and their fierce boss Tommy Shelby.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/48/122213.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        status: 'available',
        match: 91,
    },
    {
        id: 8,
        name: 'Narcos',
        genre: 'Crime',
        year: 2015,
        rating: 'TV-MA',
        duration: '3 Seasons',
        description: 'A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar, as well as the many other drug kingpins who plagued the country through the years.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/498/1246087.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        status: 'available',
        match: 96,
    },
    {
        id: 9,
        name: 'Sherlock',
        genre: 'Mystery',
        year: 2010,
        rating: 'TV-14',
        duration: '4 Seasons',
        description: 'A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.',
        logo: 'https://static.tvmaze.com/uploads/images/original_untouched/171/428042.jpg',
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        status: 'available',
        match: 98,
    }
];

// Async Validation middleware
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

// GET /movies and /api/movies - Returns list of all movies
app.get(['/movies', '/api/movies'], async (req, res) => {
    try {
        // As per requirements: "returns list of movies with name, logo, id, status, and stream URL"
        // Also retaining other fields for backward compatibility with frontend
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

// GET /movies/:movieId and /api/movies/:movieId - Returns a single movie by ID
app.get(['/movies/:movieId', '/api/movies/:movieId'], validateMovieId, (req, res) => {
    res.json({
        success: true,
        data: req.movie,
    });
});

// POST /play/:movieId and /api/play/:movieId - Simulates starting playback
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

// POST /stop/:movieId and /api/stop/:movieId - Simulates stopping playback
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

// GET /api/playback-log - Returns playback history
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
