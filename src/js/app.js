var  React = require('react'),
     Router = require('react-router'),
     Routes = require('./Routes');

var data = JSON.parse(document.getElementById("initData").innerHTML);

Router.run(Routes, Router.HistoryLocation, function(Handler) {
    React.render(<Handler />, document.body);
});

