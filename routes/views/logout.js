/* eslint-env node */
var keystone = require('keystone');
var utils = require('../utils');

exports = module.exports = function(req, res) {

	utils.logout(req, res, function() {
		return res.redirect('/');
	});

};
