var express = require('express'),
    http = require('http'),
    path = require('path'),
    errorHandler= require('errorhandler'),
    jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt'),
    React = require('react'),
    Router = require('react-router'),
    routes = require('./server/routes.js'),
    {reactify} = require('./server/middleware');

// import JSX
require('node-jsx').install();
var jsxRoutes = require('./client/js/Routes');

var app = express();

require('dotenv').load()

// all environments

const port = process.env.PORT || 3000

app.set('port', port);
app.set('views', path.join(__dirname, '/server/views'));
app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(require('body-parser').json());
app.use(require('method-override')());
app.use(require('serve-static')(path.join(__dirname, '/public')));

app.use(expressJwt({
    secret: process.env.SECRET_KEY,
    credentialsRequired: false,
    requestProperty: 'authToken'
}).unless({ path: ["/public"]}));


const devMode = 'development' == app.get('env');

// development only
if (devMode) {
    console.log("Using development environment");
    app.use(errorHandler());
}

// database 
//

var db = require('knex')({
    client: 'pg',
    debug: devMode,
    connection: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
});

// Local middleware
//
app.use(reactify(jsxRoutes));

// Set up routes
//
routes(app, db);
   
// run server

console.log("Running on port", port);
app.server = http.createServer(app);
app.server.listen(port);
