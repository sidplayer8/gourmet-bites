// Simple in-memory store (shared across imports in same serverless instance)
global.verificationCodes = global.verificationCodes || {};

module.exports = global.verificationCodes;
