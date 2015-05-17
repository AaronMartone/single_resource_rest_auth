// require modules.
var express = require('express');
var router = express.Router();
var passport = require('passport');

// route handler business logic is externalized and brought in.
var bus = require('./bus');
var auth = require('./auth');

// these routes can be accessed by anyone.
router.post('/login', auth.login);

// these routes require the user to be authenticated.
router.get('/api/v1/bus', bus.list);
router.get('/api/v1/bus/:id', bus.view);
router.post('/api/v1/bus', bus.create);
router.put('/api/v1/bus/:id', bus.update);
router.delete('/api/v1/bus/:id', bus.delete);

// these require an authenticated and authorized user.


module.exports = router;