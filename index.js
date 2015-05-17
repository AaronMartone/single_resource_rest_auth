'use strict';

// add authentication using basic HTTP and tokens. make sure you use the async version of bcrypt hashing functions and
// provide validation to ensure all incoming email addresses are unique. rubric: unique emails, async bcrypt, testing,
// auth middleware.

// import the server.
var server = require('./server');

// start the server
server.start();