'use strict';

// add basic http auth and tokens to single resource rest api. use async version of bcrypt hashing and provide 
// validation to make sure all incoming email addresses are unique. should use mongo for persistence. connect via
// mongoose.

// define 'server' object functionality.
var server = {
    start: function() {

        // require core modules. =======================================================================================
        var express = require('express');
        var app = express();
        var bodyParser = require('body-parser');
        var crypt = require('bcrypt-nodejs');
        var mongoose = require('mongoose');
        var passport = require('passport');
        var BasicStrategy = require('passport-http').BasicStrategy;
        var User = require('./models/User');

        function getUserFromDB(username, callback) {
            console.log('Determining if user: ' + username + ' exists in database...'); // !!!
            User.findOne({ 'username': username }, function(err, user) {
                if (err) { 
                    console.log('Error or No such user found...'); // !!!
                    res.status(401)
                        .set('Content-Type', 'application/json')
                        .json({ result: 'failure', msg: 'Authentication failed.' });
                    // return callback(null, null);
                }
                console.log('User found, returning for password verification...'); // !!!
                return callback(null, user);
            });
        }

        // define application variables.
        app.set('port', process.env.PORT || 3000);

        // attempt a connection to the database. =======================================================================
        mongoose.connect('mongodb://localhost/sr_api_auth', {}, function(err) {
            if (err) {
                console.log('Failed to connect to database', err.message, err.stack); // !!!
                process.exit(1);
            }
        });

        // get the username/password from the basic http request and authenticate it against the database. =============
        passport.use(new BasicStrategy(
            function(username, password, done) {
                console.log('Validating Basic HTTP Authentication Credentials...'); // !!!

                // ensure the user account exists in the database.
                getUserFromDB(username, function(err, user) {
                    // general error.
                    if (err) {
                        console.log('Authentication Failed: Error Occurred in Getting User from Database.');                        
                        return done(err, null);
                    }
                    // user not found in database.
                    if (!user) {
                        console.log('Authentication Failed: No Matching User In Database');                        
                        return done(new Error('Authentication Failed.'), null);                  
                    }
                    // validate the password provided.
                    crypt.compare(password, user.password, function(err, result) {
                        // general error.
                        if (err) { 
                            console.log('Authentication Failed: Password Not Valid.');                            
                            return done(new Error('Authentication Failed.'), null);              
                        }
                        if (!result) {
                            console.log('Authentication Failed: Invalid Credentials.');                            
                            return done(new Error('Authentication Failed'), null);
                        }                 
                        console.log('Authentication Successful.');
                        return done(null, user);
                    });
                });
            }
        ));

        // global middleware. ==========================================================================================
        app.use(function(req, res, next) {
                console.log('\n=======================================\n', req.method.toUpperCase() + ' ' + req.url + '...');
                next();
            },
            bodyParser.json(),
            passport.initialize()
        );

        app.use('/', [
            function(req, res, next) { 
                console.log(req.method + ' ' + req.url + '...');               
                if (!req.headers['authorization']) {
                    console.log('Authentication Failed: No Authorization Headers Sent.');
                    next(new Error('Authentication Failed.'));
                }
                next();
            },        
            passport.authenticate('basic', { session: false}),            
            require('./middleware/validate-req'), 
            require('./routes')
        ]);

        // error 404 handler. ==========================================================================================
        app.use(function(req, res, next) {
            console.log('\n\n=== ERROR 404:', req.url); // !!!
            res.status(404)
                .set('Content-Type', 'application/json')
                .json({ error: 'Resource not found.' });
        });

        // error 500 handler.
        app.use(function(err, req, res, next) {
            console.log('\n=== ERROR 500:', err.message, '\n[START ERROR STACK]\n', err.stack, '\n[END ERROR STACK]'); // !!!
            res.status(500)
                .set('Content-Type', 'application/json')
                .json({ success: false, message: err.message });
        })

        // listen on designated port. ==================================================================================
        app.listen(app.get('port'), function() {
            console.log('App (' + __dirname.split('/').pop() + ') listening at //localhost:' + app.get('port') + '...');
        });

    }
};

// export the server.
module.exports = server;