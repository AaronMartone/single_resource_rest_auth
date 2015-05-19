var User = require('../models/User');
var crypt = require('bcrypt-nodejs');

function renderJSON(res, data) {
    res.status(200)
        .set('Content-Type', 'application/json')
        .json(data);
}

module.exports = {

    // get a list of all users
    list: function(req, res, next) {         
        User.find({}, '_id username email', function(err, results) {
            // general error.
            if (err) { 
                console.log('User List Handler Encountered Error Querying Databasae');
                next(new Error('Server encountered an error.'));
            }
            renderJSON(res, { success: true, message: 'Document list generated.', data: results });
        });      
    }, 

    // list a specific user.
    view: function(req, res, next) {
        User.findOne({ username: req.params.id }, '_id username email', function(err, result) {
            // general error.
            if (err) {
                console.log('User View Handler Encountered Error Querying Database');
                next(new Error('Server encountered an error.'));
            }
            // no document.
            if (!result) {
                console.log('User View Handler: Document does not exist.');
                return renderJSON(res, { success: false, message: 'Document does not exist.' });
            }
            renderJSON(res, { success: true, message: 'Document generated.', data: result });
        });
    },

    // creates a new user (ensure unique email).
    create: function(req, res, next) {
        var user = new User({
            username: req.body.username,
            email: req.body.email,
            salt: undefined,
            password: undefined
        });

        // create a salt and salt the password
        crypt.genSalt(8, function(err, salt) {
            // general error.
            if (err) {
                console.log('User Create Handler: Error creating salt.');
                next(err);
            }           
            user.salt = salt;
            crypt.hash(req.body.password, salt, null, function(err, saltedPW) {
                // general error.
                if (err) {
                    console.log('User Create Handler: Error hashing password.');
                    next(err);
                }     
                user.password = saltedPW;
                User.findOne({ email: req.body.email }, function(err, results) {
                    // general error.
                    if (err) {
                        console.log('User Create Handler: Server Encountered Error Querying the Database.');
                        next(new Error('Server encountered error.'));
                    }
                    // email address is not unique.
                    if (results) {
                        console.log('User Create Handler: Email is not unique.');
                        return renderJSON(res, { success: false, message: 'Email is not unique.' });
                    }
                    user.save(function(err) {
                        // general error.
                        if (err) {
                            console.log('User Create Handler: Server Encountered an Error Saving User to Database.');
                            next(err);
                        }
                        renderJSON(res, { success: true, message: 'User was successfully created.', id: user._id });
                    });                    
                });
            });            
        });        
    },

    // updates an existing user (ensure unique email).
    update: function(req, res, next) {
        var conditions = {
            _id: req.params.id
        };
        var update = {};
        for (key in req.body) {
            update[key] = req.body[key];
        }

        User.update(conditions, update, null, function(err, doc) {
            // general error
            if (err) {
                console.log('User Update Handler: Server Encountered an Error Updating the User.');
                next(err);
            }
            renderJSON(res, { success: true, message: 'User was successfully updated.' });
        });        
    },

    // deletes an existing user.
    delete: function(req, res, next) {
        User.find({ _id: req.params.id }).remove(function(err) {
            // general error
            if (err) {
                console.log('User Delete Handler: Server Encountered an Error Deleting the User.');
                next(err);
            }
            renderJSON(res, { success: true, message: 'User was successfully deleted.' });
        });
    }

};