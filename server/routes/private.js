const express = require('express');
const router = express.Router();
const studentRouter = express.Router();
const companyRouter = express.Router();
const vacancyRouter = express.Router();

const JWT = require('jsonwebtoken');
const { JWT_SECRET } = require('@configuration');

const passport = require('passport');
const passportConfig = require('@root/passport');
const { validateBody, schemas } = require('@helpers/routeHelpers');

const PrivateVacancyController = require('@controllers/private/vacancy');
//const PrivateCompanyController = require('@controllers/private/company');
const PrivateStudentController = require('@controllers/private/student');

// ***************************  Vacancies  *****************************

vacancyRouter.use('/', (req, res, next) => {
    console.log(req.sub);
    next();
});

vacancyRouter.get('/:id', PrivateVacancyController.getVacancyById);

router.use('/vacancy', vacancyRouter);

// ***************************  Companies  *****************************

// ***************************  Students  ******************************

studentRouter.get('/:id', async (req, res, next) => {
    JWT.verify(req.headers.authorization, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(400).send({error: err});
        }
        if (decoded.sub.type === 'company') {
            console.log('company');
            return next('route');
        }
        if (req.params.id !== decoded.sub.id) {
            return res.status(403).send({error: "Student ids do not match"});
        }
        return next();
    })
}, passport.authorize('jwt-student', {session: false}));

studentRouter.get('/:id', async (req, res, next) => {
    JWT.verify(req.headers.authorization, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(400).send({error: err});
        }
        if (decoded.sub.type === 'student') {
            console.log('student, ok');
            return next('route');
        }
        return next();
    })
}, passport.authorize('jwt-company', {session: false}));

studentRouter.get('/:id', PrivateStudentController.getStudentById);

router.use('/student', studentRouter);

module.exports = router;
