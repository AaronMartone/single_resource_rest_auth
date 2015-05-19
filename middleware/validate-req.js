var eat = require('eat');
var appKey = require('../config/app-key');

module.exports = function(req, res, next) {

    // user provided, no token. generate one for them.
    if (req.user && !req.body.token && req.url === '/sign-in') {
        var expires = +new Date + ((15 * 60) * 1000); // token expiration (15m).
        expires = 253402300799000; // !!! Dec 31, 9999 23:59:59

        console.log('User object populated, but no token provided, generating token...'); // !!!
        eat.encode({ id: req.user.username, timestamp: expires}, appKey, function(err, token) {
            if (err) {
                console.log('Invalid token.'); // !!!
                return next(err);
            }
            return res.status(200)
                .set('Content-Type', 'application/json')
                .json({ success: true, message: 'Token successfully created.', token: token });
        });
    }

    // user populated, no token, and not at sign-in endpoint.
    if (req.user && !req.body.token && req.url !== '/sign-in') {
        console.log('Unauthenticated endpoint access attempt...');
        console.log(req.body);
        return res.status(401)
            .set('Content-Type', 'application/json')
            .json({ success: false, message: 'The endpoint requested requires an authenticated token.' });
    } 

    // user and token provided, decode and validate.
    if (req.user && req.body.token) {
        eat.decode(req.body.token, appKey, function(err, userObj) {
            if (err) {
                console.log('Token is invalid.'); // !!!
                return next(err);
            } 
            // ensure that the token has not expired.
            if (userObj.timestamp <= +new Date()) {
                console.log('Token has expired.'); // !!!
                return next(new Error('Token has expired.'));
            }
            // token is valid.
            console.log('Token validated.');
            next();            
        });
    }
};