/* eslint-env node */
var keystone = require('keystone');
var Types = keystone.Field.Types;
var moment = require('moment');

// Application template to show new applicants
var BaseApplication = new keystone.List('BaseApplication', {});

BaseApplication.add({
	content: { type: Types.Html, wysiwyg: true, height: 400 }
});

BaseApplication.register();


// Represents an application in-progress
var Application = new keystone.List('Application', {
	autokey: { from: 'applicant', path: 'username', unique: true }
});

Application.add({
	state: { type: Types.Select, options: 'in review, accepted, denied, other', default: 'in review', index: true },
	applicant: { type: Types.Relationship, ref: 'User', index: true },
	date: { type: Types.Date, index: true, default: Date.now, noedit: true },
	thread: { type: Types.Relationship, initial: true, ref: 'Thread', index: true }
});

Application.schema.virtual('formattedDate').get(function() {
	return moment(this.publishedDate).format('MMMM Do, YYYY h:mm a');
});

Application.defaultColumns = 'applicant, state|20%, date|20%';
Application.register();
