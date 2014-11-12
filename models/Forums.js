/* eslint-env node */
var keystone = require('keystone');
var Types = keystone.Field.Types;
var moment = require('moment');

var Thread = new keystone.List('Thread', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true }
});

Thread.add({
	title: { type: String, required: true },
	slug: { type: String, index: true },
	author: { type: Types.Relationship, initial: true, ref: 'User', index: true },
	sticky: { type: Types.Boolean, default: false, initial: false },
	publishedDate: { type: Types.Date, default: Date.now, noedit: true, index: true },
	content: { type: Types.Html, wysiwyg: true, height: 300 },
	type: { type: Types.Select, options: 'forum, application', default: 'forum', index: true }

});

Thread.schema.virtual('publishedDateFormatted').get(function() {
	return moment(this.publishedDate).format('MMMM Do, YYYY h:mm a');
});

Thread.relationship({ path: 'comments', ref: 'Comment', refPath: 'comment' });

Thread.register();

var Comment = new keystone.List('Comment', {});

Comment.add({
	author: { type: Types.Relationship, initial: true, ref: 'User', index: true },
	thread: { type: Types.Relationship, initial: true, ref: 'Thread', index: true },
	publishedDate: { type: Types.Date, default: Date.now, noedit: true, index: true },
	content: { type: Types.Html, wysiwyg: true, height: 300 }
});

Comment.schema.virtual('publishedDateFormatted').get(function() {
	return moment(this.publishedDate).format('MMMM Do, YYYY h:mm a');
});

Comment.register();
