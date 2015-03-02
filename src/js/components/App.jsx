import React from 'react';
import Router from 'react-router';

const Route = Router.Route,
      RouteHandler = Router.RouteHandler;


export default React.createClass({
    render: function(){
        return (
        <div>
            <div className="container-fluid">
               <RouteHandler /> 
            </div>
        </div>
        );
    }
});
