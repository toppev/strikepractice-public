require('dotenv').config({ path: '.env' })

const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const { setData, getData } = require("./database");

const port = 3030

// Behind a single reverse proxy (nginx), so trust exactly one hop. This makes
// req.ip the real client for rate limiting without letting clients spoof
// arbitrary X-Forwarded-For values.
app.set('trust proxy', 1);

app.use(express.json({
    limit: '2mb'
}));

app.use(morgan('":url :status - :response-time ms (len: :req[content-length])', {}));

app.use(cors());

// Lightweight in-memory fixed-window rate limiter (no external deps). Good
// enough for a single-instance tool; bounds token brute-forcing and write spam.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60; // requests per IP per window
let hits = new Map();
const rateLimitTimer = setInterval(() => { hits = new Map(); }, RATE_LIMIT_WINDOW_MS);
if (rateLimitTimer.unref) rateLimitTimer.unref();

app.use((req, res, next) => {
    const ip = req.ip || 'unknown';
    const count = (hits.get(ip) || 0) + 1;
    hits.set(ip, count);
    if (count > RATE_LIMIT_MAX) {
        return res.status(429).json({ message: 'too many requests' });
    }
    next();
});

function isValidToken(token) {
    return typeof token === 'string' && token.length >= 10 && token.length <= 200;
}

app.use('/get-data', (req, res) => {
    const token = req.body.token
    if (!isValidToken(token)) {
        return res.status(401).json({ message: 'invalid token, no token?' })
    }
    getData(token, "data")
        .then(data => res.json({ data }))
        .catch(error => {
            console.log(error)
            res.status(error.status || 400).json({ message: 'invalid token' })
        })
})

app.post('/set-data', (req, res) => {
    const token = req.body.token
    if (!isValidToken(token)) {
        return res.status(401).json({ message: 'invalid token' })
    }
    const data = req.body
    setData(token, "data", data)
        .then(() => res.sendStatus(200))
        .catch(error => {
            console.log(error)
            res.status(error.status || 400).json({ message: 'failed to save' })
        })
})

app.listen(port, () => console.log(`App listening on port ${port}!`));
