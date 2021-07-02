require('dotenv').config({ path: '.env' })

const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const { setData, getData } = require("./database");

const port = 3030

app.use(express.json({
    limit: '2mb'
}));

app.use(morgan('":url :status - :response-time ms (len: :req[content-length])', {}));

app.use(cors());

app.use('/get-data', (req, res) => {
    const token = req.body.token
    if (!token || token.length < 10) {
        res.status(401).json({ message: 'invalid token, no token?' })
    } else {
        getData(token, "data")
            .then(data => res.json({ data }))
            .catch(error => {
                console.log(error)
                res.status(error.status || 400).json({ message: 'invalid token' })
            })
    }
})

app.post('/set-data', (req, res) => {
    const token = req.body.token
    if (!token || token.length < 10) res.status(401)
    const data = req.body
    setData(token, "data", data)
        .then(() => res.sendStatus(200))
        .catch(error => {
            console.log(error)
            res.status(error.status || 400).json({ message: 'failed to save' })
        })
})

app.listen(port, () => console.log(`App listening on port ${port}!`));
