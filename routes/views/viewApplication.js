/* eslint-env node */
var keystone = require('keystone');
var async = require('async');
var utils = require('../utils');
var _ = require('underscore');

//TODO: Fuck it, this is copy/pasted from forums to make it work.
exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res),
        locals = res.locals;

    // Init locals
    locals.data = {
    	application: null,
        thread: null,
        comments: []
    };
    locals.submitted = {
        commentText: null
    };
    locals.csrf_token_key = keystone.security.csrf.TOKEN_KEY;
    locals.csrf_token_value = keystone.security.csrf.getToken(req, res);

    var getComments = function(thread, callback) {

        keystone.list('Comment').model.find().populate('author').where('thread', thread).exec(function(err, comments) {
            return callback(err, comments);
        });
    };

    var getThread = function(id, callback) {

        keystone.list('Thread').model.findOne().where('_id', id).populate('author').exec(function(err, thread) {

            if (err || !thread) {
                return callback(err);
            }

            getComments(thread, function(err, comments) {
                if (err) {
                    return callback(err);
                }
                return callback(err, thread, comments);
            });
        });
    };

    var getApplication = function(applicant, callback) {

    	keystone.list(keystone.get('user model')).model.findOne({ username: applicant }).exec(function(err, user) {

    		if (err) {
    			return callback(err);
    		}

    		if (!user) {
    			return callback();
    		}

        	keystone.list('Application').model.findOne().where('applicant', user).populate('applicant').exec(function(err, application) {

        		if (err) {
        			return callback(err);
        		}

        		if (!application) {
        			return callback();
        		}

        		getThread(application.thread, function (err, thread, comments) {

        			if (!thread) {
        				console.log("Thread not found for application.")
        				return callback();
        			}

        			return callback(err, application, thread, comments);
        		});

        	});
        });
    }

    view.on('init', function(next) {

        getApplication(req.params.applicant, function(err, application, thread, comments) {

            if (!application) {
                return res.notfound();
            }

            // non-members are only allowed to see their own applications
            if (!req.user.isMember && (application.applicant.id !== req.user.id)) {
            	return res.unauthorized();
            }

            locals.data.application = application;
            locals.data.thread = thread;
            locals.data.comments = _.isEmpty(comments) ? [] : comments

            return next(err);
        });
    });

    view.on('post', {action: 'newComment'}, function(next) {

        if (!keystone.security.csrf.validate(req)) {
            req.flash('error', 'There was an error with your request, please try again.');
            return next();
        }

        locals.submitted.commentText = utils.sanitizeHtml(req.body.commentText);

        var Comment = keystone.list('Comment');
        var newComment = new Comment.model({'author': req.user.id,
                                            'content': locals.submitted.commentText,
                                            'publishedDate': Date.now(),
                                            'thread': locals.data.thread.id});
        newComment.save(function(err) {
            if (err) {
                console.log(err);
                req.flash('error', 'There was an error creating your comment, please try again.');
                return next();
            }
            return res.redirect('/applications/' + locals.data.application.applicant.username);
        });
    });

    view.on('post', {action: 'deleteThread'}, function(next) {

        if (!keystone.security.csrf.validate(req)) {
            req.flash('error', 'There was an error with your request, please try again.');
            return next();
        }

        if (locals.data.thread.author.id !== req.user.id) {
            return res.unauthorized();
        }

        locals.data.application.remove(function (err) {
            if (err) {
                console.log(err);
            }

            locals.data.thread.remove(function (err2) {
            	if (err2) {
            		console.log(err);
            	}

            	if (err || err2) {
            		req.flash('error', 'There was an error deleting your application.');
            	} else {
            		req.flash('info', 'Application deleted.');
            	}
            	return res.redirect('/');

            });
        });
    });

    view.on('post', {action: 'deleteComment'}, function(next) {

        if (!keystone.security.csrf.validate(req)) {
            req.flash('error', 'There was an error with your request, please try again.');
            return next();
        }

        var commentId = req.body.commentId;
        var comment = _.find(locals.data.comments, function(c) { return c.id === commentId; });

        if (!comment) {
            req.flash('error', 'Comment not found.');
            return next();
        }

        if (comment.author.id !== req.user.id) {
            return res.unauthorized();
        }

        comment.remove(function (err) {
            if (err) {
                console.log(err);
                req.flash('error', 'There was an error deleting your comment.');
                return res.redirect('/applications');
            }

            req.flash('info', 'Comment deleted.');
            return res.redirect('/applications/' + locals.data.application.applicant.username);
        });
    });

    view.on('post', {action: 'editThread'}, function(next) {

        if (!keystone.security.csrf.validate(req)) {
            req.flash('error', 'There was an error with your request, please try again.');
            return next();
        }

        if (locals.data.thread.author.id !== req.user.id) {
            return res.unauthorized();
        }

        locals.data.thread.content = utils.sanitizeHtml(req.body.editThreadText);

        locals.data.thread.save(function (err) {
            if (err) {
                console.log(err);
                req.flash('error', 'There was an error editing your application.');
                return res.redirect('/applications');
            }
            req.flash('info', 'Thread updated.');
            next();
        });
    });

    view.on('post', {action: 'editComment'}, function(next) {

        if (!keystone.security.csrf.validate(req)) {
            req.flash('error', 'There was an error with your request, please try again.');
            return next();
        }

        var commentId = req.body.commentId;
        var comment = _.find(locals.data.comments, function(c) { return c.id === commentId; });

        if (!comment) {
            req.flash('error', 'Comment not found.');
            return next();
        }

        if (comment.author.id !== req.user.id) {
            return res.unauthorized();
        }

        comment.content = utils.sanitizeHtml(req.body.editCommentText);

        comment.save(function (err) {
            if (err) {
                console.log(err);
                req.flash('error', 'There was an error editing your comment.');
                return res.redirect('/applications');
            }

            req.flash('info', 'Comment updated.');
            next();
        });
    });

    // Render the view
    view.render('viewApplication');

 };
