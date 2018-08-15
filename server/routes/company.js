const express = require('express');
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

// **************  All company authorization related requests ****************

authRouter.post('/signup',
    validateBody(schemas.companyRegSchema),
    CompanyAuthController.signUp);

authRouter.post('/signin',
    validateBody(schemas.authSchema),
    passport.authorize('local-company', {session: false}),
    CompanyAuthController.signIn);

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

router.use('/private', privateRouter);

// ***************************  Vacancies  *********************************

vacancyRouter.use(passport.authorize('jwt-company', {session: false}));

vacancyRouter.post('/',
    validateBody(schemas.newVacancySchema),
    CompanyVacancyController.newVacancy);

vacancyRouter.post('/apply',
    validateBody(schemas.companyVacancyApplicationSchema),
    CompanyVacancyController.apply);

vacancyRouter.post('/accept',
    validateBody(schemas.companyVacancyApplicationSchema),
    CompanyVacancyController.accept);

vacancyRouter.post('/reject',
    validateBody(schemas.companyVacancyApplicationSchema),
    CompanyVacancyController.reject);

vacancyRouter.post('/discard',
    validateBody(schemas.companyVacancyApplicationSchema),
    CompanyVacancyController.discard);

vacancyRouter.post('/get',
    validateBody(schemas.getVacancySchema),
    CompanyVacancyController.getVacancies);

router.use('/vacancy', vacancyRouter);

module.exports = router;
