var  React = require('react'),
     Reflux = require('reflux'),
     {RouteHandler} = require('react-router'),
     {Alert, Navbar, Nav} = require('react-bootstrap'),
     {NavItemLink} = require('react-router-bootstrap'),
     MessageStore = require('../stores/MessageStore');

module.exports = React.createClass({

    mixins: [
        Reflux.listenTo(MessageStore, 'onMessagesUpdate')
    ],


    getInitialState: function() {
        return {
            messages: MessageStore.getDefaultData()
        }
    },

    onMessagesUpdate: function() {
        this.setState({ messages: MessageStore.getDefaultData() });
    },

    render: function(){

        var navbar = (
            <Navbar brand="Lobsters" className="navbar navbar-inverse" fixedTop={true} fluid={true}>
              <Nav className="navbar-left">
                <NavItemLink to="popular">Top</NavItemLink>
                <NavItemLink to="latest">New</NavItemLink>
              </Nav>
              <Nav className="navbar-right">
                <NavItemLink to="login">Login</NavItemLink>
              </Nav>
            </Navbar>
        );

        var messages = this.state.messages || [];

        return (
            <div className="container-fluid">
                {navbar}
                {messages.map(function(msg, index) {
                    var onDismiss = function(){
                        actions.dismissAlert(index);
                    };
                    return <Alert onDismiss={onDismiss} key={index} bsStyle={msg.level}>{msg.text}</Alert>;
                })}
               <RouteHandler {...this.props} /> 
            </div>
        );
    }
});
