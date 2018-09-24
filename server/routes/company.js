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
const { validateBody, schemas } = require('@helpers/routeHelpers');

const CompanyAuthController = require('@controllers/company/auth');
const CompanyProfileController = require('@controllers/company/profile');
const CompanyVacancyController = require('@controllers/company/vacancy');
const VacancyController = require('@controllers/vacancy');

// **************  All company authorization related requests ****************

authRouter.post('/signup',
    validateBody(schemas.companyRegSchema),
    CompanyAuthController.signUp);

authRouter.get('/verify/:token', CompanyAuthController.verify);

authRouter.post('/signin',
    validateBody(schemas.authSchema),
    passport.authorize('local-company', {session: false}),
    CompanyAuthController.signIn);

authRouter.post('/forgot-password',
    validateBody(schemas.forgotPasswordSchema),
    CompanyAuthController.sendForgotPasswordLink);

authRouter.get('/confirm-forgot-password/:url',
    CompanyAuthController.forgotPasswordConfirmation);

authRouter.post('/update-password/:url',
    validateBody(schemas.resetPasswordSchema),
    CompanyAuthController.changePassword);

authRouter.post('/google',
    passport.authorize('googleToken-company', {session: false}),
    CompanyAuthController.googleOAuth);

router.use('/auth', authRouter);

// *************************  All Getters and Setters ***********************

privateRouter.use(passport.authorize('jwt-company', {session: false}));

// Update company name and get company name by id.
privateRouter.route('/name')
    .post(CompanyProfileController.updateName)
    .get(CompanyProfileController.getName);

// .. so on ...
privateRouter.route('/phone')
    .post(CompanyProfileController.updatePhone)
    .get(CompanyProfileController.getPhone);

privateRouter.route('/description')
    .post(CompanyProfileController.updateDescription)
    .get(CompanyProfileController.getDescription);

// get full profile information.
privateRouter.get('/profile', CompanyProfileController.getFullProfile);

// Get profile information based on request:
// Input example:
//      {"id": true, "email": true}
// Output:
//      {"id": "... company id ...", "email": "johndoe@hotmail.com"}
privateRouter.post('/profile', CompanyProfileController.getProfile);

// Update profile information
// Input example:
//      {"email": "some_email@gmail.com", "firstName": "John"}
privateRouter.post('/update-profile', CompanyProfileController.updateProfile);

// Puts avatar image to default directory(it's inside config folder, name=RESOURCES_DIRECTORY)
privateRouter.post('/image-avatar',
    CompanyProfileController.updateImage(path.join(config.RESOURCES_DIRECTORY, 'avatar/company')));

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

vacancyRouter.get('/getVacancies', VacancyController.getCompanyVacancies);

vacancyRouter.route('/getApplications')
    .get(VacancyController.getCompanyApplications)
    .post(VacancyController.getCompanyApplications);

router.use('/vacancy', vacancyRouter);

module.exports = router;
