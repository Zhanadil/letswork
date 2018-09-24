const express = require('express');
const path = require('path');
const config = require('config');
const router = express.Router();
const authRouter = express.Router();
const privateRouter = express.Router();
const vacancyRouter = express.Router();
const questionnaireRouter = express.Router();

const passport = require('passport');
const passportConfig = require('@root/passport');
const { validateBody, schemas } = require('@helpers/routeHelpers');

const StudentsAuthController = require('@controllers/student/auth');
const StudentsProfileController = require('@controllers/student/profile');
const VacancyController = require('@controllers/vacancy');

// ***********  All student authorization related requests  *****************

authRouter.post('/signup',
    validateBody(schemas.studentRegSchema),
    StudentsAuthController.signUp);

authRouter.post('/signin',
    validateBody(schemas.authSchema),
    passport.authorize('local-student', {session: false}),
    StudentsAuthController.signIn);

authRouter.post('/google',
    passport.authorize('googleToken-student', {session: false}),
    StudentsAuthController.googleOAuth);

router.use('/auth', authRouter);

// ********************  All Getters and Setters  *************************

// Only authorized students can make these requests.
privateRouter.use(passport.authorize('jwt-student', {session: false}));

// Update student's first name and get student's first name by id.
privateRouter.route('/firstName')
    .post(StudentsProfileController.updateFirstName)
    .get(StudentsProfileController.getFirstName);

// same.
privateRouter.route('/lastName')
    .post(StudentsProfileController.updateLastName)
    .get(StudentsProfileController.getLastName);

privateRouter.route('/phone')
    .post(StudentsProfileController.updatePhone)
    .get(StudentsProfileController.getPhone);

privateRouter.route('/description')
    .post(StudentsProfileController.updateDescription)
    .get(StudentsProfileController.getDescription);

/*router.route('/private/profile-picture')
    .post(passport.authorize('jwt-student', {session: false}),
    StudentsController.saveProfilePicture);*/

// Get full profile information.
privateRouter.get('/profile', StudentsProfileController.getFullProfile);

// Get profile information based on request:
// Input example:
//      {"id": true, "email": true}
// Output:
//      {"id": "... company id ...", "email": "johndoe@hotmail.com"}
privateRouter.post('/profile', StudentsProfileController.getProfile);

// Update profile information
// Input example:
//      {"email": "some_email@gmail.com", "firstName": "John"}
privateRouter.post('/update-profile', StudentsProfileController.updateProfile);


// Puts avatar image to default directory(it's inside config folder, name=RESOURCES_DIRECTORY)
privateRouter.post('/image-avatar',
    StudentsProfileController.updateImage(path.join(config.RESOURCES_DIRECTORY, 'avatar/student')));

router.use('/private', privateRouter);

// ***************************  Vacancies  ********************************

vacancyRouter.use(passport.authorize('jwt-student', {session: false}));

vacancyRouter.post('/apply',
    validateBody(schemas.studentVacancyApplySchema),
    VacancyController.studentApplication);

vacancyRouter.post('/cancel',
    validateBody(schemas.studentVacancyApplicationSchema),
    VacancyController.changeStatus(VacancyController.statusRequirements.studentCancel, "canceled"));

vacancyRouter.post('/accept',
    validateBody(schemas.studentVacancyApplicationSchema),
    VacancyController.changeStatus(VacancyController.statusRequirements.studentAccept, "accepted"));

vacancyRouter.post('/reject',
    validateBody(schemas.studentVacancyApplicationSchema),
    VacancyController.changeStatus(VacancyController.statusRequirements.studentReject, "rejected"));

vacancyRouter.post('/discard',
    validateBody(schemas.studentVacancyApplicationSchema),
    VacancyController.studentDiscardApplication);

vacancyRouter.post('/:page/:limit',
    validateBody(schemas.getAllVacancies),
    VacancyController.getAllVacanciesAsStudent);

vacancyRouter.post('/:id',
    validateBody(schemas.getVacancyById),
    VacancyController.getVacancyByIdAsStudent);

vacancyRouter.route('/getApplications')
    .get(VacancyController.getStudentApplications)
    .post(VacancyController.getStudentApplications);

router.use('/vacancy', vacancyRouter);

// ***************************  Questionnaire  ********************************

questionnaireRouter.use(passport.authorize('jwt-student', {session: false}));

questionnaireRouter.post('/answer/:setNumber/:questionNumber',
    validateBody(schemas.studentAnswerSchema),
    StudentsProfileController.updateQuestionnaireAnswer);

router.use('/questionnaire', questionnaireRouter);

module.exports = router;
