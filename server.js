/* eslint-env node */
// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

// Require keystone
var keystone = require('keystone');



keystone.init({

	'name': 'clockwork',
	'brand': 'clockwork',

	'less': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': 'jade',

	'signin redirect': '/',
	'signin url': '/login',
	'signout url': '/logout',
	'signout redirect': '/',

	'auto update': true,
	'session': true,
	'auth': true,
	'user model': 'User',
	'cookie secret': 'Q2W(.gnVX1[:0XEIL6*QPCGR&fLx7!q#eo/zys"$6ozw;x8`12{ocx&+x?{T`Uk}'

});

keystone.import('models');

keystone.set('locals', {
	_: require('underscore'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable
});

keystone.set('routes', require('./routes'));

keystone.set('nav', {
	'users': 'users',
	'frontpage': ['Post'],
	'applications': ['BaseApplication', 'Application'],
	'forums': ['Thread', 'Comment']
});

keystone.start();
