const express = require('express');
const path = require('path');
const config = require('config');
const router = express.Router();
const authRouter = express.Router();
const privateRouter = express.Router();
const vacancyRouter = express.Router();

const passport = require('passport');
const passportConfig = require('@root/passport');
const { validateBody, schemas } = require('@helpers/routeHelpers');

const StudentsAuthController = require('@controllers/student/auth');
const StudentsProfileController = require('@controllers/student/profile');
const StudentsVacancyController = require('@controllers/student/vacancy');

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
privateRouter.route('/first-name')
    .post(StudentsProfileController.updateFirstName)
    .get(StudentsProfileController.getFirstName);

// same.
privateRouter.route('/last-name')
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
    validateBody(schemas.studentVacancyApplicationSchema),
    StudentsVacancyController.apply);

vacancyRouter.post('/accept',
    validateBody(schemas.studentVacancyApplicationSchema),
    StudentsVacancyController.accept);

vacancyRouter.post('/reject',
    validateBody(schemas.studentVacancyApplicationSchema),
    StudentsVacancyController.reject);

vacancyRouter.post('/discard',
    validateBody(schemas.studentVacancyApplicationSchema),
    StudentsVacancyController.discard);

vacancyRouter.post('/get',
    validateBody(schemas.getVacancySchema),
    StudentsVacancyController.getVacancies);

router.use('/vacancy', vacancyRouter);

module.exports = router;
