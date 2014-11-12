/* eslint-env node */
var keystone = require('keystone');
var utils = require('../utils');

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res),
        locals = res.locals;

    locals.submitted = req.body;
    locals.csrf_token_key = keystone.security.csrf.TOKEN_KEY;
    locals.csrf_token_value = keystone.security.csrf.getToken(req, res);

    var validateUsername = function(username) {
        var re = /^[a-zA-Z0-9_-]{3,32}$/;
        return re.test(username);
    };

    var validatePassword = function(password) {
        var re = /^[\S\s]{8,64}$/;
        return re.test(password);
    };

    var signup = function(req, res, onSuccess, onFail) {

        if (!req.body) {
            return onFail(new Error('There was an error with your request, please try again.'));
        }

        var User = keystone.list(keystone.get('user model'));

        if (typeof req.body.username === 'string' && typeof req.body.password === 'string') {

            // match email address and password
            User.model.findOne({ username: req.body.username }).exec(function(err, user) {

                if (err) {
                    console.log(err);
                }

                if (user) {
                    return onFail(new Error('A user with that name already exists.'));
                } else {

                    if (!validateUsername(req.body.username)) {
                        return onFail(new Error('Usernames must be alphanumeric characters, dashes, or underscores, longer than 3 characters and shorter than 32.'));
                    }

                    if (!validatePassword(req.body.password)) {
                        return onFail(new Error('Passwords must be between 8 and 64 characters long.'));
                    }

                    var newUser = new User.model({'username': req.body.username,
                                                  'password': req.body.password});
                    newUser.save(function(err) {
                        if (err) {
                            console.log(err);
                            return onFail(new Error(err));
                        }
                        return onSuccess(newUser);
                    });
                }
            });

        } else {
            onFail(new Error('There was an error with your request, please try again.'));
        }


    };


    view.on('post', { action: 'signup' }, function(next) {

        if (!keystone.security.csrf.validate(req)) {
            req.flash('error', 'There was an error with your request, please try again.');
            return next();
        }

        if (!req.body.username || !req.body.password) {
            req.flash('error', 'Please enter your username and password.');
            return next();
        }

        var onSuccess = function(user) {
            return res.redirect('/login');
        };

        var onFail = function(err) {
            req.flash('error', err);
            return next();
        };

        signup(req, res, onSuccess, onFail);

    });

    view.render('signup');

};
