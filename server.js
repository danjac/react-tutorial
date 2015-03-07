require('node-jsx').install()
require('dotenv').load()

var express = require('express'),
    http = require('http'),
    path = require('path'),
    errorHandler= require('errorhandler'),
    jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt'),
    React = require('react'),
    Router = require('react-router'),
    jsxRoutes = require('./src/js/Routes'),
    routes = require('./routes.js'),
    {authenticate, reactify, jwtToken, dbConnection} = require('./middleware');

var app = express();

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
const db = require('knex')({
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
app.use(dbConnection(db));
app.use(reactify(jsxRoutes));
app.use(jwtToken(jwt));

const auth = authenticate(db);

// Routes
//

app.get("/", routes.index);
app.get("/latest", routes.latest);
app.get("/login", routes.login);
app.get("/submit", routes.submit);

app.get("/api/auth/", [auth], routes.api.auth);
app.post("/api/login/", routes.api.login);
app.get("/api/posts/", routes.api.getPosts);
app.post("/api/submit/", [auth], routes.api.submitPost);
app.delete("/api/:id", [auth], routes.api.deletePost);

// run server

const port = 3000;

console.log("Running on port", port);
app.server = http.createServer(app);
app.server.listen(port);
