const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const cookieParser = require('cookie-parser');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 8000;
app.set('view engine', 'ejs');

// Add morgan for logging
app.use(morgan('dev'));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET, // Use environment variable for session secret
    resave: true,
    saveUninitialized: true
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files middleware for the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

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

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
app.use(cookieParser());

const authenticateAndAuthorize = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            // Extract JWT token from cookies
            const token = req.cookies.jwt;

            if (!token) {
                return res.redirect('/login');
                
            }

            jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
                if (err) {
                    return res.redirect('/login');
                }

                // Log the entire decoded user object
                console.log('Decoded token payload:', user);

                // Check for the username in the decoded token
                const username = user && user.username;
                console.log('Username from token:', username);

                if (!username) {
                    return res.redirect('/login');
                }

                req.user = { username: username };

                // Modify the query to use username instead of user_id
                const query = 'SELECT role FROM users WHERE username = $1';
                const values = [username];

                const result = await pool.query(query, values);

                // Log the raw result from the database query
                console.log('Raw result from database:', result);

                if (result.rowCount === 0) {
                    return res.status(404).json({ message: 'User not found' });
                }

                const userRole = result.rows[0].role;
                console.log('User role from database:', userRole);

                // Check if the user's role is included in the requiredRoles array
                if (!requiredRoles.includes(userRole)) {
                    return res.redirect('/login');
                }

                next();
            });
        } catch (error) {
            console.error('Authentication/Authorization Error:', error.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};


// Render the registration form
app.get('/register', (req, res) => {
    res.render('register');
});

// Handle user registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const createdOn = new Date();
    const role = 'user'; // Default role

    try {
        // Hash the password with Argon2 before storing it
        const hashedPassword = await argon2.hash(password);

        await pool.query(
            'INSERT INTO users (username, password, created_on, role) VALUES ($1, $2, $3, $4)',
            [username, hashedPassword, createdOn, role]
        );

        res.status(201).redirect('/login');
    } catch (error) {
        if (error.code === '23505') {
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

// Handle user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        console.log('Fetched user:', user);

        if (user && await argon2.verify(user.password, password)) {
            const payload = { username: user.username, role: user.role };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

            res.cookie('jwt', token, {
                httpOnly: true,  // JavaScript can't access this cookie
                sameSite: 'Strict',  // Helps prevent CSRF attacks
                maxAge: 30 * 24 * 60 * 60 * 1000 // Cookie expiry (30 days)
            });

            res.json({ token }); // Send the token as response
        } else {
            console.log('Login failed: Incorrect credentials');
            res.status(401).send('Incorrect Username or Password!');
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/', (req, res) => {
    res.redirect('/home');
});


app.get('/home', authenticateAndAuthorize(['user','admin','owner']), (req, res) => {

        console.log('User is logged in, serving index.html');
        res.sendFile(path.join(__dirname, 'views', 'index.html')); // Serve index.html if logged in
});

// Generate JWT API Key (accessible with JWT token)
app.get('/genapikey', (req, res) => {
    try {
        const payload = { username: req.user.username };
        const options = { expiresIn: '30d' }; // Token valid for 30 days
        const token = jwt.sign(payload, JWT_SECRET, options);
        res.json({ apiKey: token });
    } catch (error) {
        console.error('Error generating API key:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Write endpoint (only accessible by users with 'admin' role)
app.post('/write', authenticateAndAuthorize(['admin','owner']), async (req, res) => {
    const jsonData = req.body;
    const dictName = req.query.name;
    const path = req.path;

    if (!dictName) {
        return res.status(400).json({ error: 'Dictionary name is required' });
    }

    try {
        const dictResult = await pool.query('SELECT data FROM dictionaries WHERE name = $1', [dictName]);

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

// Read endpoint (accessible by all authenticated users)
app.get('/read',  authenticateAndAuthorize(['user','admin','owner']), async (req, res) => {
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
            const dictResult = await pool.query('SELECT data FROM dictionaries WHERE name = $1', [dictName]);

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

// Create dictionary endpoint (requires 'admin' role)
app.post('/create-dictionary', authenticateAndAuthorize(['admin','owner']), async (req, res) => {
    const { name, actions } = req.body;

    if (!name || !actions || actions.length === 0) {
        return res.status(400).json({ error: 'Name and actions are required' });
    }

    const data = { [name]: actions };

    try {
        const result = await pool.query(
            'INSERT INTO dictionaries (name, data) VALUES ($1, $2) RETURNING *',
            [name, JSON.stringify(data)]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            res.status(409).json({ error: 'Dictionary name already exists' });
        } else {
            console.error('Error creating dictionary:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Fetch dictionaries (accessible by all authenticated users)
app.get('/dictionaries', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM dictionaries');
        res.status(200).render('dictionaries', { dictionaries: result.rows });
    } catch (error) {
        console.error('Error fetching dictionaries:', error);
        res.status(500).render('error', { error: 'Internal server error' });
    }
});

// Fetch a specific dictionary (accessible by all authenticated users)
app.get('/dictionary/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const result = await pool.query('SELECT * FROM dictionaries WHERE name = $1', [name]);
        if (result.rows.length === 0) {
            return res.status(404).render('error', { error: 'Dictionary not found' });
        }

        let dictionary = result.rows[0].data;

        if (typeof dictionary === 'string') {
            dictionary = JSON.parse(dictionary);
        }

        res.status(200).render('dictionary', { dictionary });
    } catch (error) {
        console.error('Error fetching dictionary:', error);
        res.status(500).render('error', { error: 'Internal server error' });
    }
});

// Update dictionary (requires 'admin' role)
app.post('/update-dictionary', authenticateAndAuthorize(['admin','owner']), async (req, res) => {
    const { name, newActions } = req.body;

    if (!name || !newActions || newActions.length === 0) {
        return res.status(400).json({ error: 'Name and new actions are required' });
    }

    try {
        const result = await pool.query(
            'UPDATE dictionaries SET data = $1 WHERE name = $2 RETURNING *',
            [JSON.stringify({ [name]: newActions }), name]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Dictionary not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating dictionary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Render dictionary creation form (requires 'admin' role)
app.get('/create-dictionary', authenticateAndAuthorize(['admin','owner']), (req, res) => {
    res.render('createdict');
});

app.get("/user-dashboard", authenticateAndAuthorize(['owner']), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.status(200).render('users', {users: result.rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).render('error', { error: 'Internal server error' });
    }
});

app.post('/update-role', authenticateAndAuthorize(['owner']), async (req, res) => {
    const { user_id, role } = req.body;

    if (!user_id || !role) {
        return res.status(400).json({ error: 'User ID and role are required' });
    }

    try {
        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE user_id = $2 RETURNING *',
            [role, user_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.redirect('/user-dashboard');
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});