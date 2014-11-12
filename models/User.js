/* eslint-env node */
var keystone = require('keystone');
var Types = keystone.Field.Types;

var User = new keystone.List('User', {
	map: { name: 'username' }
});

User.add({
	username: { type: Types.Key, initial: true, required:true, index: true },
	password: { type: Types.Password, initial: true, required: true }
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Admin', index: true },
	level: { type: Types.Select, options: 'applicant, member, officer', default: 'applicant', index: true }
});

User.schema.virtual('canAccessKeystone').get(function() {
	return this.isAdmin;
});

User.schema.virtual('isMember').get(function() {
	return (this.level === 'member' || this.level === 'officer');
});

User.relationship({ ref: 'Post', path: 'author' });

User.defaultColumns = 'username, email, isAdmin';
User.register();
