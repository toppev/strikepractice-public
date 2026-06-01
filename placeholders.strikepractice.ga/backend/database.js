const Redis = require("ioredis");
console.log("Connecting to Redis at " + process.env.REDIS)
const redis = new Redis(6379, process.env.REDIS)

const expirySeconds = 60 * 60 * 24 * 30

async function getData(token, key) {
    return JSON.parse(await redis.get(token + ":" + key))
}

async function setData(token, key, data) {
    return redis.set(token + ":" + key, JSON.stringify(data), 'EX', expirySeconds)
}

module.exports = {
    getData,
    setData
}
