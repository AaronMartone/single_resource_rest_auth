'use strict';

// add basic http auth and tokens to single resource rest api. use async version of bcrypt hashing and provide 
// validation to make sure all incoming email addresses are unique. should use mongo for persistence. connect via
// mongoose.

// define 'server' object functionality.
var server = {
    start: function() {

        // require core modules.
        var express = require('express');
        var app = express();
        var bodyParser = require('body-parser');
        var mongoose = require('mongoose');
        var passport = require('passport');
        var BasicStrategy = require('passport-http').BasicStrategy;

        // define application variables.
        app.set('port', process.env.PORT || 3000);

        // attempt a connection to the database.
        mongoose.connect('mongodb://localhost/sr_api_auth', {}, function(err) {
            if (err) {
                console.log('DATABASE CONNECTION ERROR:', err.message, err.stack);
                process.exit(1);
            }
        });

        // global middleware.
        app.use(bodyParser.json(), passport.initialize());

        // define routes that will require authentication.
        app.all('/api/v1/*', [require('./middleware/validate-req')]);
        app.use('/', require('./routes'));

        // Error 404 handler.
        app.use(function(req, res) {
            console.log('Error 404:', req.url);
            res.status(404)
                .set('Content-Type', 'application/json')
                .json({ msg: 'Resource not found.' });
        });

        // Error 500 handler.
        app.use(function(err, req, res) {
            console.log('Error 500:', err.message, err.stack);
            res.status(500)
                .set('Content-Type', 'application/json')
                .json({ msg: 'Server encountered error.' });
        })

        // listen on designated port.
        app.listen(app.get('port'), function() {
            console.log('App (' + __dirname.split('/').pop() + ') listening at //localhost:' + app.get('port') + '...');
        });

    }
};

// export the server.
module.exports = server;