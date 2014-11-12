/* eslint-env node */
var keystone = require('keystone');
var crypto = require('crypto');
var utils = require('../utils');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;

	locals.submitted = req.body;
	locals.csrf_token_key = keystone.security.csrf.TOKEN_KEY;
	locals.csrf_token_value = keystone.security.csrf.getToken(req, res);

	view.on('post', { action: 'login' }, function(next) {

		if (!keystone.security.csrf.validate(req)) {
			req.flash('error', 'There was an error with your request, please try again.');
			return next();
		}

		if (!req.body.username || !req.body.password) {
			req.flash('error', 'Please enter your username and password.');
			return next();
		}

		var onSuccess = function(user) {
			return res.redirect('/');
		};

		var onFail = function() {
			req.flash('error', 'Sorry, that username and password combo are not valid.');
			return next();
		};

		utils.login(req, res, onSuccess, onFail);

	});

	view.render('login');

};
