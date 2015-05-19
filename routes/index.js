// require modules.
var express = require('express');
var router = express.Router();
var passport = require('passport');

// route handles business logic is externalized and brought in.
var usersHandler = require('./users');
var auth = require('./auth');

// these routes can be accessed by anyone.
router.get('/sign-in', auth.signIn);

// these routes require the user to be authenticated.
router.route('/users')
    .get(usersHandler.list)
    .post(usersHandler.create);

router.route('/users/:id')
    .get(usersHandler.view)
    .put(usersHandler.update)
    .delete(usersHandler.delete);

// export router.
module.exports = router;