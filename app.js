const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const morgan = require('morgan');

const crypto = require('crypto');

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

app.get('/genapikey', (req, res) => {
    if (req.session.loggedin) {
        try {
            const secret = 'your-secret-key'; // You should use a secure, private key here
            const token = crypto.randomUUID();
            const hashedToken = crypto.createHmac('sha256', secret)
                                      .update(token)
                                      .digest('hex');
            res.json({ apiKey: hashedToken });
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
    const dictId = req.query.dict;
    const predefinedTypes = dictionaries[dictId];
    const path = req.path; // Get the request path

    if (predefinedTypes) {
        const entries = Object.entries(jsonData);
        const results = [];

        for (const [type, data] of entries) {
            if (predefinedTypes.includes(type)) {
                try {
                    const result = await pool.query(
                        'INSERT INTO logs (dict_id, type, data, path) VALUES ($1, $2, $3, $4) RETURNING *',
                        [dictId, type, data, path]
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
    } else {
        return res.status(400).json({ error: `Invalid dictionary ID: ${dictId}` });
    }
});


// Read endpoint
app.get('/read', async (req, res) => {
    const logs = req.query.logs;
    const sort = req.query.sort;
    const dictId = req.query.dict;

    if (logs !== 'all') {
        return res.status(400).json({ error: 'Invalid query parameter' });
    }

    try {
        let query = 'SELECT * FROM logs';
        let queryParams = [];

        if (dictId) {
            query += ' WHERE dict_id = $1';
            queryParams.push(dictId);
        }

        if (sort) {
            query += queryParams.length ? ' AND' : ' WHERE';
            query += ` type = $${queryParams.length + 1}`;
            queryParams.push(sort);
        }

        const result = await pool.query(query, queryParams);

        if (dictId) {
            const dictResult = result.rows.reduce((acc, log) => {
                const type = log.type || 'undefined';
                if (!acc[type]) {
                    acc[type] = [];
                }
                acc[type].push(log.data);
                return acc;
            }, {});
            return res.status(200).json(dictResult);
        } else {
            return res.status(200).json(result.rows);
        }
    } catch (error) {
        console.error('Error reading from database:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
