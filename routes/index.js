// require modules.
var express = require('express');
var router = express.Router();
var passport = require('passport');

// route handles business logic is externalized and brought in.
var userHandler = require('./user');
var auth = require('./auth');

// these routes can be accessed by anyone.
router.get('/sign-in', auth.signIn);

// these routes require the user to be authenticated.
router.route('/api/v1/user')
    .get(userHandler.list)
    .post(userHandler.create);

router.route('/api/v1/user/:id')
    .get(userHandler.view)
    .put(userHandler.update)
    .delete(userHandler.delete);

// export router.
module.exports = router;