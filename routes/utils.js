/* eslint-env node */
var keystone = require('keystone');
var crypto = require('crypto');
var sanitizeHtml = require('sanitize-html');

/**
 * Creates a hash of str with the cookie secret.
 * Only hashes the first half of the string.
 */
var hash = function(str) {
    // force type
    str = '' + str;
    // get the first half
    str = str.substr(0, Math.round(str.length / 2));
    // hash using sha256
    return crypto
        .createHmac('sha256', keystone.get('cookie secret'))
        .update(str)
        .digest('base64')
        .replace(/\=+$/, '');
};

exports.login = function(req, res, onSuccess, onFail) {

    if (!req.body) {
        return onFail(new Error('There was an error with your request, please try again.'));
    }

    var User = keystone.list(keystone.get('user model'));

    var doLogin = function(user) {
        req.session.regenerate(function() {

            req.user = user;
            req.session.userId = user.id;

            // if the user has a password set, store a persistence cookie to resume sessions
            if (keystone.get('cookie signin') && user.password) {
                var userToken = user.id + ':' + hash(user.password);
                res.cookie('keystone.uid', userToken, { signed: true, httpOnly: true });
            }

            onSuccess(user);

        });
    };

    if (typeof req.body.username === 'string' && typeof req.body.password === 'string') {

        // match email address and password
        User.model.findOne({ username: req.body.username }).exec(function(err, user) {
            if (user) {
                user._.password.compare(req.body.password, function(err, isMatch) {
                    if (!err && isMatch) {
                        doLogin(user);
                    }
                    else {
                        onFail(err);
                    }
                });
            } else {
                onFail(err);
            }
        });

    } else {
        onFail(new Error('There was an error with your request, please try again.'));
    }
};

exports.logout = function(req, res, next) {

    res.clearCookie('keystone.uid');
    req.user = null;

    req.session.regenerate(next);

};

exports.sanitizeHtml = function(dirty) {
    return sanitizeHtml(dirty, {
        allowedTags: [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img' ],
        allowedAttributes: {
            a: [ 'href', 'name', 'target' ],
            img: [ 'src' ]
        },
        // Lots of these won't come up by default because we don't allow them
        selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
        // URL schemes we permit
        allowedSchemes: [ 'http', 'https', 'ftp', 'mailto' ]
    });
};
