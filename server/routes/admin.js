const express = require('express');
const path = require('path');
const config = require('config');
const router = express.Router();
const questionnaireRouter = express.Router();

const passport = require('passport');
const passportConfig = require('@root/passport');
const { validateBody, schemas } = require('@helpers/routeHelpers');

const AdminController = require('@controllers/admin.js');

// ***************************  Questionnaire  *****************************

questionnaireRouter.use(passport.authorize('jwt-admin', {session: false}));

questionnaireRouter.post('/question/update',
    validateBody(schemas.updateQuestionSchema),
    AdminController.updateQuestion);

questionnaireRouter.post('/question/delete',
    validateBody(schemas.deleteQuestionSchema),
    AdminController.deleteQuestion);

questionnaireRouter.post('/set/create',
    validateBody(schemas.createQuestionSetSchema),
    AdminController.createQuestionSet);

questionnaireRouter.post('/set/delete',
    validateBody(schemas.deleteQuestionSetSchema),
    AdminController.deleteQuestionSet);

questionnaireRouter.post('/set/update',
    validateBody(schemas.updateQuestionSetSchema),
    AdminController.updateQuestionSet);

router.use('/questionnaire', questionnaireRouter);

module.exports = router;
