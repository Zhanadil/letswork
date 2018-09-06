const express = require('express');
const path = require('path');
const config = require('config');
const router = express.Router();
const companyRouter = express.Router();
const studentRouter = express.Router();
const vacancyRouter = express.Router();
const questionnaireRouter = express.Router();

const QuestionnaireController = require('@controllers/questionnaire.js');
const GeneralCompanyController = require('@controllers/general/company');
const GeneralStudentController = require('@controllers/general/student');
const GeneralVacancyController = require('@controllers/general/vacancy');
const StudentProfileController = require('@controllers/student/profile');

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

// ***************************  Students  *****************************

questionnaireRouter.get('/question/:setNumber/:questionNumber',
    QuestionnaireController.getQuestion);

questionnaireRouter.get('/set-questions/:setNumber',
    QuestionnaireController.getSetQuestions);

questionnaireRouter.get('/all-questions',
    QuestionnaireController.getAllQuestions);

questionnaireRouter.get('/answer/:studentId/:setNumber/:questionNumber',
    StudentProfileController.getQuestionnaireAnswer);

questionnaireRouter.get('/set-answers/:studentId/:setNumber',
    StudentProfileController.getQuestionnaireSetAnswers);

questionnaireRouter.get('/all-answers/:studentId',
    StudentProfileController.getAllQuestionnaireAnswers);

router.use('/questionnaire', questionnaireRouter);

module.exports = router;
