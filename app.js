require('node-jsx').install()

var express = require('express'),
    http = require('http'),
    path = require('path'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    errorHandler= require('errorhandler'),
    serveStatic = require('serve-static'),
    React = require('react'),
    Router = require('react-router');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(serveStatic(path.join(__dirname, '../public')));

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}


function render(res, route, props, template) {
    // Routes.jsx should be loaded
    props = props || {};
    template = template || "index";
    Router.run(Routes, route, function(Handler, state) {
        var markup = React.renderToString(Handler(props));
        res.render(template, {
            markup: markup,
            data: props
        });
    });

}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
