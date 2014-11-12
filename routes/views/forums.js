/* eslint-env node */
var keystone = require('keystone');
var async = require('async');
var _ = require('underscore');

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res),
        locals = res.locals;

    // Init locals
    locals.data = {
        threads: [],
        stickies: []
    };

    // Count all comments on a given thread.
    var getCommentCount = function(thread, callback) {

        keystone.list('Comment').model.find().where('thread', thread).count().exec(function(err, count) {
            callback(err, count);
        });
    };

    // Find and return the most recent comment.
    var getLastComment = function(thread, callback) {

        keystone.list('Comment').model.findOne().populate('author').where('thread', thread).sort('-publishedDate').limit(1).exec(function(err, comment) {
            callback(err, comment);
        });
    };

    // Given a model query, find all threads and populate relevant metadata (commentCount, lastComment, etc)
    var getThreads = function(query, callback) {

        query.exec(function(err, results) {

            if (err || !results.length) {
                return callback(err);
            }

            // For each thread...
            async.map(results, function(thread, callback) {

                // Look up (in parallel) how many comments it has, and the last comment
                async.parallel({commentCount: async.apply(getCommentCount, thread),
                                lastComment: async.apply(getLastComment, thread)},
                                function(err, results) {

                    if (err) {
                        return callback(err);
                    }
                    // We are called back with with commentCount and lastComment, so we save the original thread here as well.
                    results.thread = thread;
                    results.link = '/forums/thread/' + thread.slug;
                    callback(null, results);
                });

            // This callback happens after all threads are processed, so we can proceed.
            }, function(err, results) {
                callback(err, results);
            });

        });

    };

    view.on('init', function(next) {

        // Find all threads sorted by date
        // TODO: Pagination - for now we show the latest 20 threads.
        var threadQuery = keystone.list('Thread').model.find().populate('author').sort('-publishedDate').limit(20).where('sticky', false).where('type', 'forum');
        var stickiesQuery = keystone.list('Thread').model.find().populate('author').sort('-publishedDate').limit(20).where('sticky', true).where('type', 'forum');

        async.parallel({threads: async.apply(getThreads, threadQuery),
                        stickies: async.apply(getThreads, stickiesQuery)},
                        function(err, results) {
                            if (!_.isEmpty(results.threads)) {
                                locals.data.threads = results.threads;
                            }

                            if (!_.isEmpty(results.stickies)) {
                                locals.data.stickies = results.stickies;
                            }

                            return next(err);
        });
    });

    // Render the view
    view.render('forums');

};
