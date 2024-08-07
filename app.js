const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const morgan = require('morgan');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken


dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 8000;
app.set('view engine', 'ejs');

// Add morgan for logging
app.use(morgan('dev'));

// Session setup
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files middleware for the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

const dictionaries = {
    1: ["login", "logout", "signup", "register"],
    // Add other dictionary IDs and their types here
};

// PostgreSQL pool setup using environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Debugging middleware to log session
app.use((req, res, next) => {
    console.log('Session:', req.session);
    next();
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// Render the registration form
app.get('/register', (req, res) => {
    res.render('register');
});

// Endpoint to handle user registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const createdOn = new Date();
    const role = 'user'; // Default role, you can change it as needed

    try {
        const result = await pool.query(
            'INSERT INTO users (username, password, created_on, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, password, createdOn, role] // Storing plain text password
        );
        res.status(201).redirect('/login');
    } catch (error) {
        if (error.code === '23505') {
            // Unique constraint violation (username already exists)
            res.status(409).json({ error: 'Username already exists' });
        } else {
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Render the login form
app.get('/login', (req, res) => {
    res.render('login');
});

// Endpoint to handle user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        const user = result.rows[0];

        if (user) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/home');
        } else {
            res.send('Incorrect Username and/or Password!');
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Root route to render login or redirect to home based on authentication
app.get('/', (req, res) => {
    console.log('Root route accessed, redirecting to /home');
    res.redirect('/home');
});

// Render the home page if logged in
app.get('/home', (req, res) => {
    console.log('Home route accessed');
    if (req.session.loggedin) {
        console.log('User is logged in, serving index.html');
        res.sendFile(path.join(__dirname, 'views', 'index.html')); // Serve index.html if logged in
    } else {
        console.log('User is not logged in, redirecting to /login');
        res.redirect('/login');
    }
});

// Generate JWT API Key
app.get('/genapikey', (req, res) => {
    if (req.session.loggedin) {
        try {
            const payload = { username: req.session.username };
            const options = { expiresIn: '30d' }; // Token valid for 30 days
            const token = jwt.sign(payload, JWT_SECRET, options);
            res.json({ apiKey: token });
        } catch (error) {
            console.error('Error generating API key:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        console.log('User is not logged in, redirecting to /login');
        res.redirect('/login');
    }
});

// Write endpoint
app.post('/write', async (req, res) => {
    const jsonData = req.body;
    const dictName = req.query.name; // Get dictionary name from query parameter
    const path = req.path; // Get the request path

    if (!dictName) {
        return res.status(400).json({ error: 'Dictionary name is required' });
    }

    try {
        // Fetch dictionary types from the database
        const dictResult = await pool.query(
            'SELECT data FROM dictionaries WHERE name = $1',
            [dictName]
        );

        if (dictResult.rowCount === 0) {
            return res.status(404).json({ error: `Dictionary with name '${dictName}' not found` });
        }

        const predefinedTypes = Object.keys(dictResult.rows[0].data);

        const entries = Object.entries(jsonData);
        const results = [];

        for (const [type, data] of entries) {
            if (predefinedTypes.includes(type)) {
                try {
                    const result = await pool.query(
                        'INSERT INTO logs (dict_name, type, data, path) VALUES ($1, $2, $3, $4) RETURNING *',
                        [dictName, type, data, path]
                    );
                    results.push(result.rows[0]);
                } catch (error) {
                    console.error('Error writing to database:', error);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
            } else {
                return res.status(400).json({ error: `Invalid type: ${type}` });
            }
        }
        return res.status(201).json(results);
    } catch (error) {
        console.error('Error fetching dictionary data:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Read endpoint
app.get('/read', async (req, res) => {
    const logs = req.query.logs;
    const sort = req.query.sort;
    const dictName = req.query.name;

    if (logs !== 'all') {
        return res.status(400).json({ error: 'Invalid query parameter' });
    }

    try {
        let query = 'SELECT * FROM logs';
        let queryParams = [];

        if (dictName) {
            query += ' WHERE dict_name = $1';
            queryParams.push(dictName);
        }

        if (sort) {
            query += queryParams.length ? ' AND' : ' WHERE';
            query += ` type = $${queryParams.length + 1}`;
            queryParams.push(sort);
        }

        const result = await pool.query(query, queryParams);

        if (dictName) {
            // Fetch dictionary data to format the response
            const dictResult = await pool.query(
                'SELECT data FROM dictionaries WHERE name = $1',
                [dictName]
            );

            if (dictResult.rowCount === 0) {
                return res.status(404).json({ error: `Dictionary with name '${dictName}' not found` });
            }

            const predefinedTypes = dictResult.rows[0].data;

            const dictResultFormatted = result.rows.reduce((acc, log) => {
                const type = log.type || 'undefined';
                if (predefinedTypes[type]) {
                    if (!acc[type]) {
                        acc[type] = [];
                    }
                    acc[type].push(log.data);
                }
                return acc;
            }, {});

            return res.status(200).json(dictResultFormatted);
        } else {
            return res.status(200).json(result.rows);
        }
    } catch (error) {
        console.error('Error reading from database:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/create-dictionary', async (req, res) => {
    const { name, actions } = req.body;

    // Debugging: Log the received data
    console.log('Received data:', req.body);

    if (!name || !actions || actions.length === 0) {
        return res.status(400).json({ error: 'Name and actions are required' });
    }

    const data = { [name]: actions };

    try {
        // Insert dictionary into the database
        const result = await pool.query(
            'INSERT INTO dictionaries (name, data) VALUES ($1, $2) RETURNING *',
            [name, JSON.stringify(data)]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            // Unique constraint violation (dictionary name already exists)
            res.status(409).json({ error: 'Dictionary name already exists' });
        } else {
            console.error('Error creating dictionary:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.get('/create-dictionary', (req, res) => {
    res.render('createdict');
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
