var  React = require('react'),
     Reflux = require('reflux'),
     {RouteHandler} = require('react-router'),
     {Alert, Navbar, Nav, NavItem} = require('react-bootstrap'),
     {NavItemLink} = require('react-router-bootstrap'),
     UserStore = require('../stores/UserStore'),
     MessageStore = require('../stores/MessageStore');

module.exports = React.createClass({

    mixins: [
        Reflux.listenTo(MessageStore, 'onMessagesUpdate'),
        Reflux.listenTo(UserStore, 'onUserUpdate')
    ],


    getInitialState: function() {
        return {
            messages: MessageStore.getDefaultData(),
            user: UserStore.getDefaultData()
        }
    },

    onMessagesUpdate: function() {
        this.setState({ messages: MessageStore.getDefaultData() });
    },

    onUserUpdate: function() {
        this.setState({ user: UserStore.getDefaultData() });
    },

    getRightNav: function () {
        var className = "navbar-right";
        var logout = function() {
            actions.logout();
        };
        if (this.state.user) {
            return (
              <Nav className={className}>
                <NavItemLink to="popular">{this.state.user.name}</NavItemLink>
                <NavItem onClick={logout}>Logout</NavItem>
              </Nav>
            );
        }
        return (
              <Nav className={className}>
                <NavItemLink to="login">Login</NavItemLink>
              </Nav>
        );
    },

    componentWillUpdate: function () {
        if (this.props.user) {
            this.setState({ user: this.props.user });
        }
    },

    componentDidMount: function () {
        console.log("check if loggedin");
        actions.getUser();
    },

    render: function(){

        var navbar = (
            <Navbar brand="Lobsters" className="navbar navbar-inverse" fixedTop={true} fluid={true}>
              <Nav className="navbar-left">
                <NavItemLink to="popular">Top</NavItemLink>
                <NavItemLink to="latest">New</NavItemLink>
              </Nav>
              {this.getRightNav()}
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
               <RouteHandler user={this.state.user} {...this.props} /> 
            </div>
        );
    }
});
