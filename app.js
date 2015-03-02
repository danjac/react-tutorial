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

app.get("/", function(req, res) {
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
