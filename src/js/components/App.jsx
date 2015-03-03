var  React = require('react'),
     {RouteHandler} = require('react-router'),
     {Navbar, Nav} = require('react-bootstrap'),
     {NavItemLink} = require('react-router-bootstrap');

module.exports = React.createClass({
    render: function(){

        var navbar = (
            <Navbar brand="Lobsters" className="navbar navbar-inverse" fixedTop={true} fluid={true}>
              <Nav className="navbar-left">
                <NavItemLink to="popular">Lobsters</NavItemLink>
                <NavItemLink to="latest">Latest</NavItemLink>
              </Nav>
            </Navbar>
        );

        return (
            <div className="container-fluid">
                {navbar}
               <RouteHandler {...this.props} /> 
            </div>
        );
    }
});
