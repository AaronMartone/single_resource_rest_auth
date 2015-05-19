var auth = {
    signIn: function(req, res, next) {
        console.log('Attempting to sign in...');
        next();
    }
};

module.exports = auth;