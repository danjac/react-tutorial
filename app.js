require('node-jsx').install()
require('dotenv').load()

var express = require('express'),
    http = require('http'),
    path = require('path'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    errorHandler= require('errorhandler'),
    serveStatic = require('serve-static'),
    knex = require('knex'),
    React = require('react'),
    Router = require('react-router'),
    Routes = require('./src/js/Routes.jsx');

var app = express();

const PAGE_SIZE = 10;
const DEV_ENV = 'development' == app.get('env');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(serveStatic(path.join(__dirname, '/public')));

// development only
if (DEV_ENV) {
    console.log("Using development environment");
    app.use(errorHandler());
}

var db = knex({
    client: 'pg',
    debug: DEV_ENV,
    connection: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
});


app.get("/", function(req, res) {
    getPosts(1, "score").then(function(posts) {
        renderReact(res, "/", {
            popularPosts: posts,
        });
    });
});

app.get("/latest", function(req, res) {
    getPosts(1, "id").then(function(posts) {
        renderReact(res, "/latest", {
            latestPosts: posts,
        });
    });
});

app.get("/login", function(req, res) {
    renderReact(res, "/login");
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

function renderReact(res, route, props={}, template="index") {
    Router.run(Routes, route, function(Handler, state) {
        var markup = React.renderToString(Handler(props));
        res.render(template, {
            markup: markup,
            data: JSON.stringify(props)
        });
    });

}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
