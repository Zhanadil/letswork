const express = require('express');
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

router.use('/company', companyRouter);

// ***************************  Students  *****************************

studentRouter.post('/ids/:page/:limit', GeneralStudentController.getStudentIds);

studentRouter.post('/:page/:limit', GeneralStudentController.getStudents);

studentRouter.post('/:id', GeneralStudentController.getStudentById);

router.use('/student', studentRouter);

module.exports = router;
