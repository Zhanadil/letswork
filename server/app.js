require('module-alias/register');

const express = require('express');
const morgan = require('morgan');
const body_parser = require('body-parser');
const mongoose = require('mongoose');
const config = require('config');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');

mongoose.Promise = global.Promise;
mongoose.connect(config.DBHost);

const student = require('@routes/student');
const company = require('@routes/company');

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

app.use('/student', student);
app.use('/company', company);

const port = process.env.PORT || 3000;
app.listen(port);

module.exports = app;
