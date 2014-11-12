/* eslint-env node */
var keystone = require('keystone');
var utils = require('../utils');

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res),
        locals = res.locals;

    locals.data = {
    	baseApplication: null
    }
    locals.submitted = {
        applicationText: null
    };
    locals.csrf_token_key = keystone.security.csrf.TOKEN_KEY;
    locals.csrf_token_value = keystone.security.csrf.getToken(req, res);

    view.on('init', function(next) {
   		keystone.list('BaseApplication').model.findOne().exec(function(err, baseApplication) {
   			if (err) {
   				console.log(err);
   				return next(err);
   			}

   			locals.data.baseApplication = baseApplication;

			// if a user already has an application, redirect them to it
    		if (!req.user.isMember) {
   				keystone.list('Application').model.findOne().where('applicant', req.user.id).exec(function(err, application) {
   					if (application) {
   						return res.redirect('/applications/' + req.user.username)
   					}
   					return next(err);
   				});
    		} else {
    			return next();
    		}
   		});
    });

    view.on('post', {action: 'newApplication'}, function(next) {

        if (!keystone.security.csrf.validate(req)) {
            req.flash('error', 'There was an error with your request, please try again.');
            return next();
        }

        var applicationTitle = "Application: " + req.user.username;
        locals.submitted.applicationText = utils.sanitizeHtml(req.body.applicationText);

        var Thread = keystone.list('Thread');
        var newThread = new Thread.model({'title': applicationTitle,
                                          'author': req.user.id,
                                          'content': locals.submitted.applicationText,
                                          'publishedDate': Date.now(),
                                          'sticky': false,
                                          'type': 'application'});
        newThread.save(function(err) {
            if (err) {
                console.log(err);
                req.flash('error', 'There was an error creating your application, please try again.');
                return next(err);
            }

            var Application = keystone.list('Application');
            var newApplication = new Application.model({'applicant': req.user,
            											'state': 'in review',
            											'date': Date.now(),
            											'thread': newThread});
            newApplication.save(function(err) {
            	if (err) {
            	    console.log(err);
            	    req.flash('error', 'There was an error creating your application, please try again.');
            	    return next(err);
            	}

            	return res.redirect('/applications');
            })
        });
    });

    view.render('newApplication');

};