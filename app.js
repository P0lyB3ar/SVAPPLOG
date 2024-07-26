const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = 8000;

app.use(express.static(path.join(__dirname, 'public')));


// PostgreSQL pool setup
const pool = new Pool({
    user: '',
    host: '',
    database: '',
    password: '',
    port: 5432,
});

app.use(bodyParser.json());

// Predefined dictionaries
const dictionaries = {
    v1: ['login', 'logout', 'register'],
    v2: ['create', 'delete', 'update']
};


app.get('/', async (req, res) => {
    res.render('index.html');
})
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