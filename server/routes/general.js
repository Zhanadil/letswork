const express = require('express');
const path = require('path');
const config = require('config');
const router = express.Router();
const companyRouter = express.Router();
const studentRouter = express.Router();
const vacancyRouter = express.Router();

const GeneralCompanyController = require('@controllers/general/company');
const GeneralStudentController = require('@controllers/general/student');
const GeneralVacancyController = require('@controllers/general/vacancy');

// ***************************  Vacancies  *****************************

vacancyRouter.post('/ids/:page/:limit', GeneralVacancyController.getVacancyIds);

vacancyRouter.post('/:page/:limit', GeneralVacancyController.getVacancies);

vacancyRouter.post('/:id', GeneralVacancyController.getVacancyById);

router.use('/vacancy', vacancyRouter);

// ***************************  Companies  *****************************

companyRouter.post('/:id', GeneralCompanyController.getCompanyById);

// Gets avatar image from default directory.
companyRouter.use('/image-avatar',
    express.static(path.join(config.RESOURCES_DIRECTORY, 'avatar/company')));

// If no image was found, returns default image.
companyRouter.get('/image-avatar/*', function(req, res, next) {
    res.sendFile(path.join(config.RESOURCES_DIRECTORY, '/avatar/company/default_avatar.png'));
});


router.use('/company', companyRouter);

// ***************************  Students  *****************************

studentRouter.post('/ids/:page/:limit', GeneralStudentController.getStudentIds);

studentRouter.post('/:page/:limit', GeneralStudentController.getStudents);

studentRouter.post('/:id', GeneralStudentController.getStudentById);

// Gets avatar image from default directory.
studentRouter.use('/image-avatar',
    express.static(path.join(config.RESOURCES_DIRECTORY, 'avatar/student')));

// If no image was found, returns default image.
studentRouter.get('/image-avatar/*', function(req, res, next) {
    res.sendFile(path.join(config.RESOURCES_DIRECTORY, '/avatar/student/default_avatar.png'));
});

router.use('/student', studentRouter);

module.exports = router;
