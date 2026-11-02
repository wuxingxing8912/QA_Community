const auth = require('./auth');
const errorHandler = require('./errorHandler');
const notFound = require('./notFound');

module.exports = { auth, optionalAuth: auth.optionalAuth, errorHandler, notFound };
