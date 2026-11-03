import { logger } from '#config/logger.js';

export const responseLogger = (req, res, next) => {
    const originalJson = res.json;
    const originalSend = res.send;
    let responseBody;

    // Intercept res.json()
    res.json = function (body) {
        responseBody = body;
        return originalJson.call(this, body);
    };

    // Intercept res.send() for non-JSON or stringified responses
    res.send = function (body) {
        if (responseBody === undefined) {
            responseBody = body;
        }
        return originalSend.call(this, body);
    };

    // Log once the response has finished sending
    res.on('finish', () => {
        logger.info({
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseBody: responseBody
        }, `Outgoing Response [${res.statusCode}] ${req.method} ${req.originalUrl}`);
    });

    next();
};