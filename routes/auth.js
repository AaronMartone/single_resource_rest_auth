var auth = {

    // authenticate the user's credentials
    signIn: function(req, res, next) {

        console.log('Executing route handler: auth.signIn...'); // !!!
        next();   
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