var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/sr_api_auth');
var User = require('../models/user');

var salt = '$2a$08$m6L9nsJcoJSDUWGGxOvkqe';
console.log(bcrypt.hashSync('superman', salt));
process.exit(0);

var auth = {

    // authenticate the user's credentials
    login: function(req, res, next) {

        // we generate a salt per user. it is ok to store this as plain text in a db because it is abstract of the
        // hashing process. so if user A and user B use the same password, each gets a unique salt generated and stored
        // into the db along with the hashed salt value. because it is a hash, it is one way, unlike an encryption
        // which can, with a key, be decrypted.

        console.log('User requested: POST /login, authenticating credentials...');
        var dbQuery = {
            username: req.body.username,
            email: req.body.email
        };

        // ensure a user with the provided username/email exists.
        var dbUser = db.findOne(dbQuery);
        console.log('dbUser:', dbUser);

        // generate the salt asynchronously. the salt is used to encrypt the data into a hash. because it is based on
        // a static key, the salt that is generated can be different on each invocation.
        bcrypt.genSalt(8, function(err, salt) {
            if (err) {

            }

        });

        console.log(db.users.find({}));
        res.status(200)
            .set('Content-Type', 'application/json')
            .json({ msg: 'TESTING...' });        
    }, 

    // authenticates credentials against the database.
    validate: function(un, pw) {

    },

    // validates the user exists in the database.
    validateUser: function(un) {

    },

    // validates the email is unique.
    validateUniqueEmail: function(email) {

    }

};

module.exports = auth;