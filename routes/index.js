/* eslint-env node */
var keystone = require('keystone');
var _ = require('underscore');
var	middleware = require('./middleware');
var	importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('routes', middleware.initErrorHandlers);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views')
};

// Setup Route Bindings
exports = module.exports = function(app) {

	// Homepage/Blog
	app.get('/', routes.views.index);

	// Application System
	app.all('/applications*', middleware.requireUser);
	app.all('/applications/new', routes.views.newApplication);
	app.all('/applications', routes.views.applications);
	app.all('/applications/:applicant', routes.views.viewApplication);

	// Forums
	app.all('/forums*', middleware.requireMember);
	app.get('/forums', routes.views.forums);
	app.all('/forums/thread/new', routes.views.newThread);
	app.all('/forums/thread/:slug', routes.views.viewThread);

	// Login/Logout/Signup
	app.all('/login', routes.views.login);
	app.get('/logout', routes.views.logout);
	app.all('/signup', routes.views.signup);

	// User Profile
	app.all('/profile*', middleware.requireUser);
	app.all('/profile', routes.views.profile);

};
