const express = require('express');
const fs = require('fs');
const config = require('config');
const path = require('path');
const router = express.Router();
const authRouter = express.Router();
const privateRouter = express.Router();
const vacancyRouter = express.Router();

const passport = require('passport');
const passportConfig = require('@root/passport');
const { validateBody, schemas } = require('@routes/helpers');

const AuthController = require('@controllers/auth');
const ProfileController = require('@controllers/profile');
const VacancyController = require('@controllers/vacancy');

// **************  All company authorization related requests ****************

authRouter.post('/signup',
    validateBody(schemas.companyRegSchema),
    AuthController.companySignUp);

authRouter.post('/signin',
    validateBody(schemas.authSchema),
    passport.authorize('local-company', {session: false}),
    AuthController.companySignIn);

authRouter.post('/google',
    passport.authorize('googleToken-company', {session: false}),
    AuthController.companyGoogleOAuth);

router.use('/auth', authRouter);

// *************************  All Getters and Setters ***********************

privateRouter.use(passport.authorize('jwt-company', {session: false}));

// Update company name and get company name by id.
privateRouter.route('/name')
    .post(ProfileController.companyUpdateName)
    .get(ProfileController.companyGetName);

// .. so on ...
privateRouter.route('/phone')
    .post(ProfileController.companyUpdatePhone)
    .get(ProfileController.companyGetPhone);

privateRouter.route('/description')
    .post(ProfileController.companyUpdateDescription)
    .get(ProfileController.companyGetDescription);

// get full profile information.
privateRouter.get('/profile', ProfileController.companyGetFullProfile);

// Get profile information based on request:
// Input example:
//      {"id": true, "email": true}
// Output:
//      {"id": "... company id ...", "email": "johndoe@hotmail.com"}
privateRouter.post('/profile', ProfileController.companyGetProfile);

// Update profile information
// Input example:
//      {"email": "some_email@gmail.com", "firstName": "John"}
privateRouter.post('/update-profile', ProfileController.companyUpdateProfile);

// Puts avatar image to default directory(it's inside config folder, name=RESOURCES_DIRECTORY)
privateRouter.post('/image-avatar',
    ProfileController.companyUpdateImage(path.join(config.RESOURCES_DIRECTORY, 'avatar/company')));

router.use('/private', privateRouter);

// ***************************  Vacancies  *********************************

vacancyRouter.use(passport.authorize('jwt-company', {session: false}));

vacancyRouter.post('/',
    validateBody(schemas.newVacancySchema),
    VacancyController.newVacancy);

vacancyRouter.post('/apply',
    validateBody(schemas.companyVacancyApplicationSchema),
    VacancyController.companyApplication);

vacancyRouter.post('/cancel',
    validateBody(schemas.companyVacancyApplicationSchema),
    VacancyController.changeStatus(VacancyController.statusRequirements.companyCancel, "canceled"));

vacancyRouter.post('/accept',
    validateBody(schemas.companyVacancyApplicationSchema),
    VacancyController.changeStatus(VacancyController.statusRequirements.companyAccept, "accepted"));

vacancyRouter.post('/reject',
    validateBody(schemas.companyVacancyApplicationSchema),
    VacancyController.changeStatus(VacancyController.statusRequirements.companyReject, "rejected"));

vacancyRouter.post('/discard',
    validateBody(schemas.companyVacancyApplicationSchema),
    VacancyController.companyDiscardApplication);

vacancyRouter.get('/remove/:id', VacancyController.removeVacancy);

vacancyRouter.get('/getVacancies', VacancyController.getCompanyVacancies);

vacancyRouter.route('/getApplications')
    .get(VacancyController.getCompanyApplications)
    .post(VacancyController.getCompanyApplications);

router.use('/vacancy', vacancyRouter);

module.exports = router;
