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
                    return callback(null, null);
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
                console.log('Processing Basic HTTP Authenticatin Credentials...'); // !!!
                getUserFromDB(username, function(err, user) {
                    if (err) {
                        console.log('Error occurred in "getUserFromDB"...');
                        return done(err);
                    }
                    if (!user) {
                        console.log('No need to process password, user not found...'); // !!!
                        return done(null, false);
                    }
                    crypt.compare(password, user.password, function(err, result) {
                        if (err) { 
                            console.log('Password provided does not match...');
                            return done(null, false);
                        }
                        console.log('Password matches, returning user object...');
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
            console.log('\n=== ERROR 500:', err.message, '\n[START STACK]\n', err.stack, '\n[END STACK]'); // !!!
            res.status(500)
                .set('Content-Type', 'application/json')
                .json({ error: err.message });
        })

        // listen on designated port. ==================================================================================
        app.listen(app.get('port'), function() {
            console.log('App (' + __dirname.split('/').pop() + ') listening at //localhost:' + app.get('port') + '...');
        });

    }
};

// export the server.
module.exports = server;