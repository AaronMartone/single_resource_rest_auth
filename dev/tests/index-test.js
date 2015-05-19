var chai = require('chai');
var chaiHTTP = require('chai-http');
var expect = chai.expect;

chai.use(chaiHTTP);

describe('Authentication-Based Single Resource REST API...', function() {

    var app = 'http://localhost:3000';
    var token;
    var new_user_id;
    var username_good = 'aaronmartone';
    var username_bad = 'rainbow-farting-unicorn';
    var password_good = 'superman'; // cause it's the 'strongest' password I could thinkn of.
    var password_bad = 'secure123';
    var document_id_bad = -1;
    var document_id_good = 1;
    var new_user = { 
        token: token,
        username: 'test',
        email: 'test@example.com',
        password: 'password'
    };
    var updated_user = {
        token: undefined,
        username: 'test2',
        email: 'test2@example.com'
    };


    it('Should fail to issue a token if authentication headers are not sent.', function(done) {
        chai.request(app)
            .get('/sign-in')
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.eql(500);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(false);
                expect(res.body.message).to.eql('Authentication Failed.');
                done();
            });
    });

    it('Should fail to issue a token if username doesn\'t exist in the database', function(done) {
        chai.request(app)
            .get('/sign-in')
            .auth(username_bad, password_good)
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.eql(500);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(false);
                expect(res.body.message).to.eql('Authentication Failed.');
                done();
            });
    });

    it('Should fail to issue a token if authentication credentials supplied are invalid.', function(done) {
        chai.request(app)
            .get('/sign-in')
            .auth(username_bad, password_bad)
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.eql(500);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(false);
                expect(res.body.message).to.eql('Authentication Failed.');
                done();
            });
    });

    it('Should issue a token if valid authentication credentials are supplied.', function(done) {
        chai.request(app)
            .get('/sign-in')
            .auth(username_good, password_good)
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.eql(200);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(true);
                expect(res.body.message).to.eql('Token successfully created.');
                expect(res.body.token).to.exist;
                expect(res.body.token).to.have.length.above(0);
                token = res.body.token;
                console.log('(Info): Using token: ' + token + ' for remainder of tests...');
                new_user.token = token;
                done();
            });
    });

    it('Should fail to process a request at an endpoint that requires a token, and none is provided.', function(done) {
        chai.request(app)
            .get('/users')
            .auth(username_good, password_good)
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.eql(401);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(false);
                expect(res.body.message).to.eql('The endpoint requested requires an authenticated token.');
                done();
            });
    });

    it('Should list users when a token-based request is made to GET /users.', function(done) {
        chai.request(app)
            .get('/users')
            .auth(username_good, password_good)
            .send({ token: token })
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.eql(200);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(true);
                done();
            });
    });

    it('Should indicate the nonexistence of a record when a token-based request is made to GET /users/<nonexistent_id>.', function(done) {
        chai.request(app)
            .get('/users/' + document_id_bad)
            .auth(username_good, password_good)
            .send({ token: token })
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.eql(200);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(false);
                expect(res.body.message).to.eql('Document does not exist.');
                done();
            });
    });

    it('Should return a single record when a token-based request is made to GET /users/<id>.', function(done) {
        chai.request(app)
            .get('/users/' + document_id_good)
            .auth(username_good, password_good)
            .send({ token: token })
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.eql(200);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(false);
                expect(res.body.message).to.eql('Document does not exist.');
                done();
            });
    });

    it('Should create a user when a token-based request is made to POST /users.', function(done) {
        chai.request(app)
            .post('/users')
            .auth(username_good, password_good)
            .send(new_user)
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.eql(200);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(true)
                expect(res.body.message).to.eql('User was successfully created.');
                new_user_id = res.body.id;
                console.log('(Info): Setting new user id as: ' + res.body.id);
                done();
            });
    });

    it('Should refuse to create a user if the email address provided already exists when a token-based request is made to POST /users.', function(done){
        chai.request(app)
            .post('/users')
            .auth(username_good, password_good)
            .send(new_user)
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.eql(200);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(false)
                expect(res.body.message).to.eql('Email is not unique.');
                done();
            });
    });

    it('Should update an existing user when a token-based request is made to PUT /users/<id>.', function(done) {
        updated_user.token = token;
        chai.request(app)
            .put('/users/' + new_user_id)
            .auth(username_good, password_good)
            .send(updated_user)
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.eql(200);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(true);
                expect(res.body.message).to.eql('User was successfully updated.');
                done();
            });
    });

    it('Should delete an existing user when a token-based request is made to DELETE /users/<id>.', function(done) {
        chai.request(app)
            .delete('/users/' + new_user_id)
            .auth(username_good, password_good)
            .send({ token: token })
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.eql(200);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(true);
                expect(res.body.message).to.eql('User was successfully deleted.');
                done();
            });
    });

    /*

    it.skip('...should fail to generate a token on a bad credential', function(done) {
        chai.request(app)
            .get('/sign-in')
            .auth('aaronmartone', 'batman')
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.status(401);
                expect(res).to.be.json;
                expect(res.body.success).to.eql(false);
                done();
            })
    })

    it.skip('...should generate a token on valid authentication', function(done) {
        chai.request(app)            
            .get('/sign-in')
            .auth('aaronmartone', 'superman')
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.token).to.exist;
                token = res.body.token;
                done();
            });
    });

    it.skip('...should not accept a request to endpoint without a token', function(done) {
        chai.request(app)
            .get('/api/v1/user')
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.status(401);
                expect(res).to.be.json;
                epxect(res.body.result).to.eql('failure');
                expect(res.body.msg).to.eql('The endpoint requeted requires an authenticated token.');
                done();           
            })
    });

    it.skip('...should be able to request a list of users with the access token.', function(done) {
        console.log('======== USING TOKEN: ' + token);
        chai.request(app)
            .get('/api/v1/user')
            .auth('aaronmartone', 'superman')
            .send({ token: token })            
            .end(function(err, res) {                
                expect(err).to.eql(null);
                expect(res).to.have.status(200);
                expect(res).to.be.json;                
                done();
            });
    });

    it.skip('...should return a single user when performing a GET with an endpoint ID', function(done) {
        chai.request(app)
            .get('/api/v1/user/aaronmartone')
            .auth('aaronmartone', 'superman')
            .send({ token: token })
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                if (Array.isArray(res.body)) {
                    expect(res.body.length).to.eql(1);
                }
                done();
            });
    });

    it.skip('...should allow the creation of a user', function(done) {
        chai.request(app)
            .post('/api/v1/user')
            .auth('aaronmartone', 'superman')
            .send({ 
                token: token,
                username: 'test',
                email: 'test@example.com',
                password: 'password'
            })
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.result).to.eql('success');
                done();
            });
    });

    it.skip('...should not allow a user with the same email address to be created', function(done) {
        chai.request(app)
            .post('/api/v1/user')
            .auth('aaronmartone', 'superman')
            .send({ 
                token: token,
                username: 'test',
                email: 'test@example.com',
                password: 'password'
            })
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.result).to.eql('failure');
                expect(res.body.msg).to.eql('Email provided is not unique.');
                done();
            });
    });

    it.skip('...should allow the modification of an existing user', function(done) {
        chai.request(app)
            .put('/api/v1/user/test')
            .auth('aaronmartone', 'superman')
            .send({
                token: token,
                username: 'test2',
                email: 'test2@example.com'
            })
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.result).to.eql('success');
                expect(res.body.msg).to.eql('User was updated.');
                done();
            });
    });

    it.skip('...should allow the deletion of a user', function(done) {
        chai.request(app)
            .delete('/api/v1/user/test2')
            .auth('aaronmartone', 'superman')
            .send({ token: token })
            .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.result).to.eql('success');
                expect(res.body.msg).to.eql('User was deleted.');
                done();
            });
    });

    */

});