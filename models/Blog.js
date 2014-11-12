/* eslint-env node */
var keystone = require('keystone');
var Types = keystone.Field.Types;
var moment = require('moment');

var Post = new keystone.List('Post', {
	map: { name: 'title' },
	autokey: { from: 'name', path: 'key', unique: true }
});


Post.add({
	title: { type: String, required: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true },
	content: { type: Types.Html, wysiwyg: false, height: 400 }
});

Post.schema.virtual('publishedDateFormatted').get(function() {
	return moment(this.publishedDate).format('MMMM Do, YYYY h:mm a');
});

Post.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Post.register();
