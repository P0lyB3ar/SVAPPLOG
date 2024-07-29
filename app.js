const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const argon2 = require('argon2')

dotenv.config(); // Load environment variables from .env file

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_PORT:', process.env.DB_PORT);

const app = express();
const port = 8000;
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL pool setup using environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(bodyParser.json());

// Predefined dictionaries
const dictionaries = {
    v1: ['login', 'logout', 'register'],
    v2: ['create', 'delete', 'update']
};

app.get('/', async (req, res) => {
    res.render('index.html');
});


app.get('/register', (req, res) => {
    res.render('register');
  });
  

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const createdOn = new Date();
    const role = 'user'; // Default role, you can change it as needed
  
    try {
      // Hash the password
      const hashedPassword = await argon2.hash(password);
  
      const result = await pool.query(
        'INSERT INTO users (username, password, created_on, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, hashedPassword, createdOn, role]
      );
      res.status(201).json({ user: result.rows[0] });
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

// Write endpoint
app.post('/write', async (req, res) => {
    const jsonData = req.body;
    const dictId = req.query.dict;
    const predefinedTypes = dictionaries[dictId];

    if (predefinedTypes) {
        const entries = Object.entries(jsonData);
        const results = [];

        for (const [type, data] of entries) {
            if (predefinedTypes.includes(type)) {
                try {
                    const result = await pool.query('INSERT INTO logs (dict_id, type, data) VALUES ($1, $2, $3) RETURNING *', [dictId, type, data]);
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
