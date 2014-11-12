/* eslint-env node */
var keystone = require('keystone');
var async = require('async');
var _ = require('underscore');

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res),
        locals = res.locals;

    // Init locals
    locals.data = {
        applications: []
    };

    view.on('init', function(next) {

    	var appQuery = keystone.list('Application').model.find().populate('applicant').sort('-publishedDate')
    	// If the user isn't a member, we only want to show them their own application
    	if (!req.user.isMember) {
    		appQuery = appQuery.where('applicant', req.user.id)
    	}

        appQuery.exec(function (err, applications) {

        	if (applications) {
        		locals.data.applications = applications;
        	}

            // if the user isn't a member, take them to the new application page or their existing application
        	if (!req.user.isMember) {
        		if (!_.isEmpty(applications)) {
        			return res.redirect("/applications/" + req.user.username)
        		} else {
        			return res.redirect("/applications/new")
        		}
        	}

        	return next(err);
        });
    });

    // Render the view
    view.render('applications');

};
