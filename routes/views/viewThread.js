/* eslint-env node */
var keystone = require('keystone');
var async = require('async');
var utils = require('../utils');
var _ = require('underscore');

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res),
        locals = res.locals;

    // Init locals
    locals.data = {
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
            callback(err, comments);
        });
    };

    var getThread = function(slug, callback) {

        keystone.list('Thread').model.findOne().where('slug', slug).populate('author').exec(function(err, thread) {

            if (err || !thread) {
                return callback(err);
            }

            getComments(thread, function(err, comments) {
                if (err) {
                    return callback(err);
                }

                callback(err, thread, comments);

            });
        });
    };

    view.on('init', function(next) {

        // TODO: Pagination - we show all comments now.
        // TODO: Is slug sufficiently sanitized?
        getThread(req.params.slug, function(err, thread, comments) {

            if (!thread) {
                return res.notfound();
            }

            locals.data.thread = thread;
            if (!_.isEmpty(comments)) {
                locals.data.comments = comments;
            }

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
            return res.redirect('/forums/thread/' + locals.data.thread.slug);
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

        locals.data.thread.remove(function (err) {
            if (err) {
                console.log(err);
                req.flash('error', 'There was an error deleting your thread.');
                return res.redirect('/forums');
            }

            req.flash('info', 'Thread deleted.');
            return res.redirect('/forums');
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
                return res.redirect('/forums');
            }

            req.flash('info', 'Comment deleted.');
            return res.redirect('/forums/thread/' + locals.data.thread.slug);
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
                req.flash('error', 'There was an error editing your thread.');
                return res.redirect('/forums');
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
                return res.redirect('/forums');
            }

            req.flash('info', 'Comment updated.');
            next();
        });
    });

    // Render the view
    view.render('thread');

 };
