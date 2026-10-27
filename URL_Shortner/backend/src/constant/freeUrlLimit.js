const configuredLimit = Number.parseInt(process.env.FREE_URL_LIMIT, 10);

// Free accounts are limited to seven active URLs unless an explicit valid
// environment override is supplied.
const FREE_URL_LIMIT = Number.isInteger(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : 7;

module.exports = { FREE_URL_LIMIT };
