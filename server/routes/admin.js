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

router.use('/questionnaire', questionnaireRouter);

module.exports = router;
