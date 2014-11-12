/* eslint-env node */
var keystone = require('keystone');
var utils = require('../utils');

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res),
        locals = res.locals;

    locals.submitted = {
        threadTitle: null,
        threadText: null
    };
    locals.csrf_token_key = keystone.security.csrf.TOKEN_KEY;
    locals.csrf_token_value = keystone.security.csrf.getToken(req, res);

    view.on('post', {action: 'newThread'}, function(next) {

        var formatTitle = function(title) {
            // trim and convert all whitespace to spaces
            title = title.trim();
            title = title.replace(/\s/g, ' ');
            return title;
        };

        var validateTitle = function(title) {
            if (title.length > 3 && title.length < 64) {
                return true;
            }
            return false;
        };

        var onSuccess = function(thread) {
            return res.redirect('/');
        };

        var onFail = function(err) {
            req.flash('error', err);
            return next();
        };

        if (!keystone.security.csrf.validate(req)) {
            req.flash('error', 'There was an error with your request, please try again.');
            return next();
        }

        if (!req.body.threadTitle || !validateTitle(formatTitle(req.body.threadTitle))) {
            req.flash('error', 'Titles must be alphanumeric characters, underscores, or spaces and longer than 8 characters and shorter than 64.');
            return next();
        }

        locals.submitted.threadTitle = formatTitle(req.body.threadTitle);
        locals.submitted.threadText = utils.sanitizeHtml(req.body.threadText);

        var Thread = keystone.list('Thread');
        var newThread = new Thread.model({'title': locals.submitted.threadTitle,
                                          'author': locals.user.id,
                                          'content': locals.submitted.threadText,
                                          'publishedDate': Date.now(),
                                          'sticky': false,
                                          'type': 'forum'});
        newThread.save(function(err) {
            if (err) {
                console.log(err);
                req.flash('error', 'There was an error creating your thread, please try again.');
                return next();
            }
            res.redirect('/forums/thread/' + newThread.slug);
        });
    });

    view.render('newThread');

};
