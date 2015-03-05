require('node-jsx').install()
require('dotenv').load()

var express = require('express'),
    http = require('http'),
    path = require('path'),
    _ = require('lodash'),
    errorHandler= require('errorhandler'),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt'),
    React = require('react'),
    Router = require('react-router'),
    Routes = require('./src/js/Routes.jsx'),
    validators = require('./src/js/validators');

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


var authenticate = function(required=false) {

    return function(req, res, next) {

        var unauthenticated = function() {
            if (required) {
                if (req.xhr) {
                    return res.sendStatus(401);
                } 
                return res.redirect("/login");
            } 
            return next();
        }

        if (!req.authToken) {
            return unauthenticated();
        }
        db("users")
            .where("id", req.authToken.id)
            .first().then(function(user) {
                if (!user) {
                    return unauthenticated();
                }
                req.user = user;
                next();
            });
    };

};

var authOnly = authenticate(false);
var authRequire = authenticate(true);

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


app.get("/api/auth/", [authRequire], function(req, res) {
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

app.get("/submit", function(req, res) {
    // the "redirectTo" prop is checked in componentDidMount client
    // side - we need to do this for any components running
    // possible redirects
    res.reactify("/wait", {redirectTo: "/submit"});
});

app.get("/api/posts/", function(req, res) {
    var page = parseInt(req.query.page || 1);
    getPosts(page, req.query.orderBy).then(function(posts) {
        res.json(posts);
    });
});

app.post("/api/submit/", [authRequire], function(req, res) {

    var title = req.body.title,
        url = req.body.url,
        errors = validators.newPost(title, url);

    if (!_.isEmpty(errors)) {
        return res.json(402, errors);
    }

    db("posts")
        .returning("id")
        .insert({
            title: title,
            url:  url,
            user_id: req.user.id,
            created_at: moment.utc()
        }).then(function(ids) {
            return db("posts").where("id", ids[0]).first()
        }).then(function(post) {
            res.json(post);
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
