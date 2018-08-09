const express = require('express');
const router = express.Router();
const studentRouter = express.Router();
const companyRouter = express.Router();
const vacancyRouter = express.Router();

const PublicCompanyController = require('@controllers/public/company');
const PublicStudentController = require('@controllers/public/student');
const PublicVacancyController = require('@controllers/public/vacancy');

// ***************************  Vacancies  *****************************

vacancyRouter.get('/all-ids', PublicVacancyController.getVacancyIds);

router.use('/vacancy', vacancyRouter);

// ***************************  Companies  *****************************

companyRouter.get('/all-ids', PublicCompanyController.getCompanyIds);

router.use('/company', companyRouter);

// ***************************  Students  *****************************

studentRouter.get('/all-ids', PublicStudentController.getStudentIds);

router.use('/student', studentRouter);

module.exports = router;
