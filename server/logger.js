const winston = require('winston');
const config = require('config');
const format = winston.format;

const logDirectory = 'logs';

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: config.util.getEnv('NODE_ENV') === 'dev'
                ? `${logDirectory}/access_dev.log` : `${logDirectory}/access_prod.log`,
            level: config.util.getEnv('NODE_ENV') === 'dev' ? 'debug' : 'info',
        }),
        new winston.transports.Console({
            level: config.util.getEnv('NODE_ENV') === 'dev' ? 'debug' : 'info',
        })
    ],
    format: format.combine(
        format.timestamp(),
        format.printf(options =>
            `${options.timestamp} [${options.email || "general log"}] ${options.level}: ${options.message}`
        )
    )
});

module.exports = logger;
