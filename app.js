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
    Routes = require('./src/js/Routes.jsx');

var app = express();

const PAGE_SIZE = 10;
const DEV_ENV = 'development' == app.get('env');
const SECRET_KEY = process.env.SECRET_KEY || "secret"; 

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(require('morgan')('dev'));
app.use(require('body-parser').json());
app.use(require('method-override')());
app.use(require('serve-static')(path.join(__dirname, '/public')));

app.use(expressJwt({
    secret: SECRET_KEY,
    credentialsRequired: false,
    requestProperty: 'authToken'
}).unless({ path: ["/public"]}));


app.use(function(req, res, next) {

    res.reactify = function(route, props={}, template="index") {
        Router.run(Routes, route, function(Handler, state) {
            if (req.user) {
                props.user = req.user;
            }
            res.render(template, {
                markup: React.renderToString(Handler(props)),
                data: JSON.stringify(props)
            });
        });
    };

    return next();

});


app.use(function(req, res, next) {
    if (!req.authToken) {
        return next();
    }
    db("users")
        .where("id", req.authToken.id)
        .first().then(function(user) {
            req.user = user;
            return next();
        });
});

var authRequired = function(req, res, next) {
    if (!req.user) {
        res.sendStatus(401);
    }
    next();
};

// development only
if (DEV_ENV) {
    console.log("Using development environment");
    app.use(errorHandler());
}

// database 
var db = require('knex')({
    client: 'pg',
    debug: DEV_ENV,
    connection: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
});

// authentication


app.get("/api/auth/", [authRequired], function(req, res) {
    return res.json(req.user);
});

app.post("/api/login/", function(req, res) {

    db("users")
        .where("name", req.body.identity)
        .orWhere("email", req.body.identity)
        .first().then(function(user) {
            if (!user || user.password !== req.body.password) {
                res.sendStatus(401);
                return;
            } 

            var token = jwt.sign({ id: user.id }, SECRET_KEY, {
                expiresInMinutes: 60 * 24
            });

            res.json({
                token: token,
                user: user
            });

        });
        
});

app.get("/", function(req, res) {
    getPosts(1, "score").then(function(posts) {
        res.reactify("/", {
            popularPosts: posts,
        });
    });
});

app.get("/latest", function(req, res) {
    getPosts(1, "id").then(function(posts) {
        res.reactify("/latest", {
            latestPosts: posts,
        });
    });
});

app.get("/login", function(req, res) {
    res.reactify("/login");
});

app.get("/api/posts/", function(req, res) {
    var page = parseInt(req.query.page || 1);
    getPosts(page, req.query.orderBy).then(function(posts) {
        res.json(posts);
    });
});

function getPosts(page, orderBy){

    page = page || 1;
    orderBy = ["score", "id"].includes(orderBy) ? orderBy : "id";

    var offset = ((page - 1) * PAGE_SIZE);

    return db.select(
        'posts.id',
        'posts.title',
        'posts.url',
        'posts.score',
        'users.name AS author',
        'users.id AS author_id'
    ).from('posts').innerJoin(
        'users',
        'users.id',
        'posts.user_id'
    ).orderBy(
        'posts.' + orderBy, 'desc'
    ).limit(PAGE_SIZE).offset(offset);
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
