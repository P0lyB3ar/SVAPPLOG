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
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const crypto = require('crypto');
const cors = require('cors');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 8000;
app.set('view engine', 'ejs');

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // Frontend URL
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    if (req.method === "OPTIONS") {
      // Preflight request handling
      return res.sendStatus(200);
    }
  
    next();
  });

const opts = {
    jwtFromRequest: (req) => req.cookies.jwt, // Extract token from cookies
    secretOrKey: process.env.JWT_SECRET,
};

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

            // Log the token for debugging purposes
            console.log('JWT Token from Cookies:', token);

            if (!token) {
                return res.redirect('/login');
            }

            // Verify the JWT token
            jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
                if (err) {
                    console.error('JWT Verification Error:', err);
                    return res.redirect('/login');
                }
            
                // Log the decoded token payload for debugging
                console.log('Decoded token payload:', decodedToken);
            
                // Extract the user_id and username from the token
                const userId = decodedToken && decodedToken.user_id;
                const username = decodedToken && decodedToken.username;
            
                if (!userId || !username) {
                    console.error('Missing user_id or username in token');
                    return res.redirect('/login');
                }
            
                // Attach user info to the request object for later use
                req.user = { user_id: userId, username: username };
            
                // Modify the query to use username to fetch the user's role
                const query = 'SELECT role FROM users WHERE username = $1';
                const values = [username];
            
                try {
                    const result = await pool.query(query, values);
            
                    // Log the result for debugging
                    console.log('Database query result:', result);
            
                    if (result.rowCount === 0) {
                        return res.status(404).json({ message: 'User not found' });
                    }
            
                    const userRole = result.rows[0].role;
                    console.log('User role from database:', userRole);
            
                    // Check if the user's role is included in the requiredRoles array
                    if (!requiredRoles.includes(userRole)) {
                        console.warn('Unauthorized access attempt by user:', username);
                        return res.redirect('/login');
                    }
            
                    next();
                } catch (error) {
                    console.error('Database Query Error:', error);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
            });            
        } catch (error) {
            console.error('Authentication/Authorization Error:', error.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};



passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        // Find user by username (since you stored the username in the token payload)
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [jwt_payload.username]);

        if (result.rowCount > 0) {
            const user = result.rows[0];
            return done(null, user);  // User found, pass it along to `req.user`
        } else {
            return done(null, false);  // No user found
        }
    } catch (err) {
        return done(err, false);  // Error occurred during database query
    }
}));


app.use(passport.initialize());

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
            const payload = { user_id: user.user_id, username: user.username, role: user.role };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

            res.cookie('jwt', token, {
                httpOnly: true,
                sameSite: 'Strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            res.json({ token });
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
app.get('/genapikey', passport.authenticate('jwt', { session: false }), (req, res) => {
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


app.get('/create-organisation', authenticateAndAuthorize(['user','admin','owner']), (req, res) => {
    res.render('organisations'); // Assuming 'organisations' is your form view
});

app.post('/create-organisation', authenticateAndAuthorize(['user', 'admin', 'owner']), async (req, res) => {
    const { organisationName } = req.body;
    const userId = req.user.user_id;

    console.log('Request body:', req.body);
    console.log('User ID from JWT:', userId);

    if (!organisationName) {
        return res.status(400).json({ error: 'Organisation name is required' });
    }

    try {
        const userUpdateQuery = `
            UPDATE users
            SET organisation = $1
            WHERE user_id = $2
            RETURNING *;
        `;
        const userUpdateValues = [organisationName, userId];
        
        const userResult = await pool.query(userUpdateQuery, userUpdateValues);
        console.log('User update result:', userResult.rows);

        const updatedUser = userResult.rows[0];

        if (!updatedUser) {
            console.log('No user found with provided user ID');
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(201).json({
            message: 'Organisation created and assigned to user',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error creating organisation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/list-organisations', authenticateAndAuthorize(['user', 'admin', 'owner']), async (req, res) => {
    const userId = req.user.user_id;  // Extract user_id from the authenticated request

    console.log('User ID from JWT:', userId);

    try {
        // Query to fetch all organizations the user is associated with
        const organisationQuery = `
            SELECT organisation 
            FROM users 
            WHERE user_id = $1
        `;
        const organisationValues = [userId];
        
        const result = await pool.query(organisationQuery, organisationValues);

        // Log the result for debugging
        console.log('User organisation query result:', result.rows);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'No organisations found for the user' });
        }

        const organisations = result.rows.map(row => row.organisation);  // Extract organization names

        res.status(200).json({
            message: 'Organisations retrieved successfully',
            organisations: organisations
        });
    } catch (error) {
        console.error('Error fetching organisations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// GET /create-application: Render the application creation form
app.get('/create-application', authenticateAndAuthorize(['user', 'admin', 'owner']), (req, res) => {
    res.render('applications');
});

app.post('/create-application', authenticateAndAuthorize(['user', 'admin', 'owner']), async (req, res) => {
    try {
        // Extract required fields from the JSON body
        const { applicationName, organisationName } = req.body;
        const userId = req.user.user_id;

        // Validate required fields
        if (!applicationName || !organisationName) {
            return res.status(400).json({
                success: false,
                error: 'Application name and organisation name are required',
            });
        }

        // Generate a secure application secret
        const applicationSecret = crypto.randomBytes(32).toString('hex');

        // Insert new application into the database
        const query = `
            INSERT INTO applications (name, secret, organisation, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [applicationName, applicationSecret, organisationName, userId];

        const result = await pool.query(query, values);

        // Check if the application was successfully created
        const createdApplication = result.rows[0];
        if (!createdApplication) {
            return res.status(500).json({
                success: false,
                error: 'Failed to create application',
            });
        }

        // Return the created application details
        res.status(201).json({
            success: true,
            message: 'Application created successfully',
            application: {
                name: createdApplication.name,
                secret: createdApplication.secret,
                organisation: createdApplication.organisation,
                user_id: createdApplication.user_id,
            },
        });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
});



app.get('/list-applications', authenticateAndAuthorize(['user', 'admin', 'owner']), async (req, res) => {
    const userId = req.user.user_id;  // Extract user_id from the authenticated request

    console.log('User ID from JWT:', userId);

    try {
        // Query to fetch all applications associated with the user
        const applicationQuery = `
            SELECT name
            FROM applications
            WHERE user_id = $1
        `;
        const applicationValues = [userId];
        
        const result = await pool.query(applicationQuery, applicationValues);

        // Log the result for debugging
        console.log('User application query result:', result.rows);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'No applications found for the user' });
        }

        // Corrected line: Extract application names using the 'name' column
        const applications = result.rows.map(row => row.name);

        res.status(200).json({
            message: 'Applications retrieved successfully',
            applications: applications
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/write', async (req, res) => {
    const { name } = req.query; // Extract dictionary name from query parameters
    const inputData = req.body; // Extract log data from request body

    if (!name) {
        return res.status(400).json({ error: 'Dictionary name is required' });
    }

    try {
        // Fetch dictionary details from the database
        const dictResult = await pool.query('SELECT * FROM dictionaries WHERE name = $1', [name]);

        if (dictResult.rowCount === 0) {
            return res.status(404).json({ error: `Dictionary with name '${name}' not found` });
        }

        // Extract dictionary data fields
        const dictData = dictResult.rows[0].data;
        const dictFields = dictData[name]; // e.g., ["user", "path", "method", "ip", "timestamp"]

        if (!Array.isArray(dictFields)) {
            return res.status(400).json({ error: `Invalid dictionary format for '${name}'` });
        }

        // Validate input data contains all required fields
        const missingFields = dictFields.filter((field) => !(field in inputData));
        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        }

        // Insert the log into the database
        const logData = dictFields.reduce((acc, field) => {
            acc[field] = inputData[field]; // Dynamically map each field from input
            return acc;
        }, {});

        await pool.query(
            `INSERT INTO logs (dict_id, data) VALUES ($1, $2)`,
            [dictResult.rows[0].id, JSON.stringify(logData)]
        );

        return res.status(201).json({ message: 'Log successfully saved', log: logData });
    } catch (error) {
        console.error('Error writing log:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Read endpoint (accessible by all authenticated users)
app.get('/read', authenticateAndAuthorize(['user', 'admin', 'owner']), async (req, res) => {
    const logs = req.query.logs;
    const sort = req.query.sort;
    const dictName = req.query.name;
    const dictId = req.query.dict_id;

    if (logs !== 'all') {
        return res.status(400).json({ error: 'Invalid query parameter. Expected logs=all.' });
    }

    try {
        let queryParams = [];
        let query = 'SELECT * FROM logs';

        // Add filters dynamically based on provided parameters
        if (dictId) {
            query += ' WHERE dict_id = $1';
            queryParams.push(dictId);
        }

        if (dictName) {
            query += queryParams.length ? ' AND dict_name = $2' : ' WHERE dict_name = $1';
            queryParams.push(dictName);
        }

        if (sort) {
            query += queryParams.length ? ' AND' : ' WHERE';
            query += ` type = $${queryParams.length + 1}`;
            queryParams.push(sort);
        }

        const logsResult = await pool.query(query, queryParams);

        // Return the filtered logs
        return res.status(200).json(logsResult.rows);
    } catch (error) {
        console.error('Error reading from database:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Create dictionary endpoint (requires 'admin' role)
app.post('/create-dictionary', authenticateAndAuthorize(['admin','owner', 'user']), async (req, res) => {
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

app.get('/list-dictionaries', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM dictionaries');
        res.status(200).json({ dictionaries: result.rows });
    } catch (error) {
        console.error('Error fetching dictionaries:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Fetch a specific dictionary (accessible by all authenticated users)
app.get('/dictionary/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const result = await pool.query('SELECT * FROM dictionaries WHERE name = $1', [name]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Dictionary not found' });
        }

        let dictionary = result.rows[0].data;

        if (typeof dictionary === 'string') {
            dictionary = JSON.parse(dictionary);
        }

        res.status(200).json({ dictionary });
    } catch (error) {
        console.error('Error fetching dictionary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update dictionary (requires 'admin' role)
app.post('/update-dictionary', authenticateAndAuthorize(['admin','owner','user']), async (req, res) => {
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
app.get('/create-dictionary', authenticateAndAuthorize(['admin','owner', 'user']), (req, res) => {
    res.render('createdict');
});

app.get("/user-dashboard", authenticateAndAuthorize(['owner', 'admin', 'user']), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.status(200).json({ users: result.rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/update-role', authenticateAndAuthorize(['owner','admin','user']), async (req, res) => {
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