/* eslint-env node */
var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;

	// Init locals
	locals.data = {
		posts: []
	};

	// Load all categories
	view.on('init', function(next) {

		keystone.list('Post').model.find().populate('author').sort('publishedDate').exec(function(err, results) {

			if (err || !results.length) {
				return next(err);
			}
			locals.data.posts = results;
			next(err);
		});
	});

	// Render the view
	view.render('index');

};
