const express = require('express');
const morgan = require('morgan');
const body_parser = require('body-parser');
const mongoose = require('mongoose');
const config = require('config');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const cors = require('cors');

config.RESOURCES_DIRECTORY = path.join(require('os').homedir(), config.RESOURCES_DIRECTORY);

mongoose.Promise = global.Promise;
mongoose.connect(config.DBHost);

const studentRouter = require('@routes/student');
const companyRouter = require('@routes/company');
const generalRouter = require('@routes/general');
const privateRouter = require('@routes/private');

const app = express();

// In development, print dev logs to command line and combined logs to access_dev
if(config.util.getEnv('NODE_ENV') === 'dev') {
    app.use(morgan('dev'));
    app.use(morgan('combined', {
        stream: fs.createWriteStream(path.join(__dirname, '../logs/access_dev.log'), {flags: 'a'})
    }));
} else if (config.util.getEnv('NODE_ENV') === 'prod') {
    // In production, print only to file
    app.use(morgan('combined', {
        stream: fs.createWriteStream(path.join(__dirname, '../logs/access.log'), {flags: 'a'})
    }));
}
app.use(body_parser.json());
app.use(fileUpload());
app.use(cors());

app.use('/student', studentRouter);
app.use('/company', companyRouter);
app.use('/', generalRouter);
app.use('/private', privateRouter);

module.exports = app;
