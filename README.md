React learning site
===================

This is a very simple Hacker News/Reddit clone I've made to teach myself React. Therefore don't expect anything is going to work!

It's built with the following tech:

- ES6 + Babel
- NodeJS
- Express
- React
- React-router
- Reflux
- Bootstrap
- Knex+Postgresql
- Jest

Setup
-----

1. *npm install*
1. Create a .env file with the following settings:

    NODE_ENV=development

    DB_USER=postgres
    DB_PASSWORD=mypassword
    DB_NAME=mydatabasename

    SECRET_KEY=seekret

1. Create a *knexfile.js* migrations script (see http://knexjs.org/#Migrations on how to do this)
1. Run knex migrate:latest
1. Run babel-node server.js 
1. Open a browser at localhost:3000 and you should be good to go.

