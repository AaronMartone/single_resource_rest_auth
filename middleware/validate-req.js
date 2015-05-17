var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

// configure basic http authenticate strategy with passport.
passport.use(new BasicStrategy(
    function(un, pw, done) {

        // authenticate the un/pw.
        console.log('Basic Strat called!', un, pw)
        // sanity check credentials.

        // validate credentials against database.
        //var dbUser = auth.validate(un, pw);

        // on validation, generate and return token.
        return done(null, 'applesauce');
    }
));

module.exports = function(req, res, next) {

    passport.authenticate('basic', { session: false });
    
    // get token from request.
    // ensure token has not expired.
    console.log('The Val-Req, on a POST /login, got:' + req.body);

};