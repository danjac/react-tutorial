var express = require('express'),
    http = require('http'),
    path = require('path'),
    errorHandler= require('errorhandler'),
    jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt'),
    React = require('react'),
    Router = require('react-router'),
    routes = require('./routes.js'),
    {reactify} = require('./middleware');

// import JSX
require('node-jsx').install();
var jsxRoutes = require('./src/js/Routes');

var app = express();

require('dotenv').load()

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '/views'));
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

const port = 3000;

console.log("Running on port", port);
app.server = http.createServer(app);
app.server.listen(port);
