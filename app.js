require('node-jsx').install()
require('dotenv').load()

const express = require('express'),
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

let app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(serveStatic(path.join(__dirname, '/public')));

// development only
if ('development' == app.get('env')) {
    console.log("Using development environment");
    app.use(errorHandler());
}

let db = knex({
    client: 'pg',
    connection: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
});


app.get("/", function(req, res) {

    db.first().from('users') 
        .where('email', 'danjac354@gmail.com')
        .then(function(user) {
            console.log(user);
        });

    res.render("index", {
        markup: '',
        data: '{}'
    });
});

function renderReact(res, route, props, template) {
    props = props || {};
    template = template || "index.html";
    Router.run(Routes, route, function(Handler, state) {
        let markup = React.renderToString(Handler(props));
        res.render(template, {
            markup: markup,
            data: props
        });
    });

}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
