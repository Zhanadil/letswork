const express = require('express');
const router = express.Router();
const studentRouter = express.Router();
const vacancyRouter = express.Router();

const GeneralStudentController = require('@controllers/general/student');
const GeneralVacancyController = require('@controllers/general/vacancy');

// ***************************  Vacancies  *****************************

vacancyRouter.post('/ids/:page/:limit', GeneralVacancyController.getVacancyIds);

vacancyRouter.post('/:page/:limit', GeneralVacancyController.getVacancies);

vacancyRouter.post('/:id', GeneralVacancyController.getVacancyById);

router.use('/vacancy', vacancyRouter);

// ***************************  Students  *****************************

studentRouter.post('/ids/:page/:limit', GeneralStudentController.getStudentIds);

studentRouter.post('/:page/:limit', GeneralStudentController.getStudents);

studentRouter.post('/:id', GeneralStudentController.getStudentById);

router.use('/student', studentRouter);

module.exports = router;
