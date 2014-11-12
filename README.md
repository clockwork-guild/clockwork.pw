clockwork.pw
------------

Website/forum thing for WoW guilds

Requirements
------------

* Latest node.js
* Recent mongodb server

Installation
------------

0. Install requirements
1. Check out source: ```git clone <repo>```
2. Install npm modules ```cd path/to/repo && npm install```
3. Edit updates/0.0.1-admin.js - change admin password for the first admin user
4. Edit server.js - change any relevant settings (see http://keystonejs.com/docs/configuration/)
5. Run the server - ```node server.js```
6. Visit localhost:3000 in your browser

TODO
----

* Unfuck hacky shit
  - Application/Forums are copy/pasted
  - Remove the javascript from templates, make mixins, etc

* User profiles
  - email
  - armory link
  - stream link

* Password reset via email

* Easy Wowhead tooltips (wysiwyg plugin?)

* Battle.net API integration
  - Use battle.net oauth/guild rank for permissions? (maybe - how do you handle alts?)
  - Populate character info automatically from armory link
  - Parse activity feeds and keep a log of raid drops/loot
  - Raid roster stats (raid ilevel, etc)

* World of Logs links in the sidebar
  - Better stats
  - ranking leaderboards?
* Stream list in the sidebar
* Calendar System/Event list in the sidebar

* Anonymous notifications about things? Push notifications or SMS?