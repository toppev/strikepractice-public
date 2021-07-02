const Redis = require("ioredis");
const redis = new Redis(6379, process.env.REDIS)

const expirySeconds = 60 * 60 * 24 * 7 // 1 week

async function getData(token) {
    return JSON.parse(await redis.get(token))
}

async function setData(token, key, data) {
    // Update all addresses list
    redis.set(token + ":" + key, JSON.stringify(data), 'ex', expirySeconds)
        .catch(err => console.log(err))
}

module.exports = {
    getData,
    setData
}
