var User = require('../models/User');
var crypt = require('bcrypt-nodejs');

module.exports = {

    // get a list of all users
    list: function(req, res, next) { 
        console.log(req.method + ' ' + req.url + '...');               
        User.find({}, '_id username email', function(err, results) {
            if (err) { return next(new Error('Error occured while finding user.')); }             
            res.status(200)
                .set('Content-Type', 'application/json')
                .json(results);
        });      
    }, 

    // list a specific user.
    view: function(req, res, next) {
        console.log(req.method + ' ' + req.url + '...');
        User.findOne({ username: req.params.id }, '_id username email', function(err, result) {
            if (err) {
                console.log('Error in ' + req.method + ' ' + req.url);
                return next(err);
            }
            if (!result) {
                return res.status(200)
                    .set('Content-Type', 'application/json')
                    .json({ result: 'failure', msg: 'Resource does not exist.' });
            }
            return res.status(200)
                .set('Content-Type', 'application/json')
                .json(result);
        });
    },

    // creates a new user (ensure unique email).
    create: function(req, res, next) {
        console.log(req.method + ' ' + req.url + '...');
        var user = new User({
            username: req.body.username,
            email: req.body.email,
            salt: undefined,
            password: undefined
        });

        // create a salt and salt the password
        crypt.genSalt(8, function(err, salt) {
            if (err) {
                console.log('Error generating salt');
                return res.json({ result: 'failure', msg: 'Error generating salt' });
            }
            
            user.salt = salt;
            crypt.hash(req.body.password, salt, null, function(err, saltedPW) {
                if (err) {
                    console.log('Error hashing password');
                    return res.json({ result: 'failure', msg: 'Error hashing password' });
                }
                
                user.password = saltedPW;
                User.findOne({ email: req.body.email }, function(err, results) {
                    if (err || results) {
                        console.log('Email provided is not unique.');
                        return res.json({ result: 'failure', msg: 'Email provided is not unique.' });
                    }
                    
                    user.save(function(err) {
                        if (err) {
                            console.log('Error saving new user.');
                            return res.json({ result: 'failure', msg: 'Error saving new user.' });
                        }

                        res.status(200)
                            .set('Content-Type', 'application/json')
                            .json(results);
                    });                    
                });
            });            
        });        
    },

    // updates an existing user (ensure unique email).
    update: function(req, res, next) {
        console.log(req.method + ' ' + req.url + '...');
        var conditions = {
            username: req.params.id
        };
        var update = {};
        for (key in req.body) {
            update[key] = req.body[key];
        }

        User.update(conditions, update, null, function(err, doc) {
            if (err) {
                console.log('Error updating document.');
                return next(err);
            }
            res.status(200)
                .set('Content-Type', 'application/json')
                .json({ result: 'success', msg: 'User was updated.' });
        });        
    },

    // deletes an existing user.
    delete: function(req, res, next) {
        console.log(req.method + ' ' + req.url + '...');
        User.find({ username: req.body.username }).remove(function(err) {
            if (err) {
                console.log('Error deleting document.');
                return next(err);
            }
            res.status(200)
                .set('Content-Type', 'application/json')
                .json({ result: 'success', msg: 'User was deleted.' });
        });
    }

};