const Redis = require("ioredis");
const redis = new Redis(6379, process.env.REDIS)

const expirySeconds = 60 * 60 * 24 * 30

async function getData(token, key) {
    return JSON.parse(await redis.get(token + ":" + key))
}

async function setData(token, key, data) {
    // Update all addresses list
    // TODO: prevent overriding
    redis.set(token + ":" + key, JSON.stringify(data), 'ex', expirySeconds)
        .catch(err => console.log(err))
}

module.exports = {
    getData,
    setData
}
