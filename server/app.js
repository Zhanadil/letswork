const express = require('express');
const morgan = require('morgan');
const body_parser = require('body-parser');
const mongoose = require('mongoose');
const config = require('config');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const JWT = require('jsonwebtoken');
const { JWT_SECRET } = require('@configuration');

// WARNING: This line has to be above all router files.
config.RESOURCES_DIRECTORY = path.join(require('os').homedir(), config.RESOURCES_DIRECTORY);

const logger = require('@root/logger');
const studentRouter = require('@routes/student');
const companyRouter = require('@routes/company');
const generalRouter = require('@routes/general');
const privateRouter = require('@routes/private');

mongoose.Promise = global.Promise;
mongoose.connect(config.DBHost, { useNewUrlParser: true }, function(err, db){
    if(err){
        logger.emerg(`mongodb error: ${err.message}`);
    } else {
        logger.info('mongodb successfully started');
    }
})

const app = express();

// In development, print dev logs to command line and combined logs to access_dev
if(config.util.getEnv('NODE_ENV') === 'dev') {
    //app.use(morgan('dev'));
    /*app.use(morgan('combined', {
        stream: fs.createWriteStream(path.join(__dirname, '../logs/access_dev.log'), {flags: 'a'})
    }));*/
} else if (config.util.getEnv('NODE_ENV') === 'prod') {
    // In production, print only to file
    /*app.use(morgan('combined', {
        stream: fs.createWriteStream(path.join(__dirname, '../logs/access.log'), {flags: 'a'})
    }));*/
}

app.use(body_parser.json());
app.use(fileUpload());
app.use(cors());

// Log all requests
app.use((req, res, next) => {
    // If no token received
    if (req.headers.authorization === undefined) {
        logger.info(req.url, {info: "no token"})
        next();
    } else {
        // If token is received, then decode
        JWT.verify(req.headers.authorization, JWT_SECRET, (err, decoded) => {
            if (err) {
                logger.info(req.url, {info: "incorrect token"});
            } else {
                // If token is correct, then log credentials
                logger.info(req.url, {sub: decoded.sub});
            }
            next();
        });
    }
});

app.use('/student', studentRouter);
app.use('/company', companyRouter);
app.use('/', generalRouter);
app.use('/private', privateRouter);

module.exports = app;
