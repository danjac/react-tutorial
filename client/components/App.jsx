var  React = require('react'),
     Reflux = require('reflux'), 
     {RouteHandler} = require('react-router'), 
     Router = require('react-router'),
     {Alert, Navbar, Nav, NavItem} = require('react-bootstrap'),
     {NavItemLink} = require('react-router-bootstrap'),
     actions = require('../actions'),
     UserStore = require('../stores/UserStore'),
     MessageStore = require('../stores/MessageStore');

module.exports = React.createClass({

    mixins: [
        Router.Navigation,
        Router.State,
        Reflux.listenTo(MessageStore, 'onMessagesUpdate'),
        Reflux.listenTo(UserStore, 'onUserUpdate'),
        Reflux.listenTo(actions.logout, 'onLogout')
    ],

    getInitialState() {
        return {
            messages: MessageStore.getDefaultData(),
            user: UserStore.getDefaultData(),
        }
    },

    onLogout() {
        // reload this page: we should use transitionTo, 
        // but that doesn't call the willTransitionTo authentication.
        window.location.href = this.getPath();
    },

    onMessagesUpdate() {
        this.setState({ messages: MessageStore.getDefaultData() });
    },

    onUserUpdate() {
        this.setState({ user: UserStore.getDefaultData() });
    },

    getRightNav() {
        var className = "navbar-right";
        if (this.state.user) {
            return (
              <Nav className={className}>
                <NavItemLink to={this.makeHref("user", {name: this.state.user.name})}>{this.state.user.name}</NavItemLink>
                <NavItem onClick={actions.logout}>Logout</NavItem>
              </Nav>
            );
        }
        return (
              <Nav className={className}>
                <NavItemLink to={this.makeHref("login")}>Login</NavItemLink>
                <NavItemLink to={this.makeHref("signup")}>Signup</NavItemLink>
              </Nav>
        );
    },

    componentDidMount() {
        actions.getUser();
    },

    render() {

        var navbar = (
            <Navbar brand="ReactNews" className="navbar navbar-inverse" fixedTop={true} fluid={true}>
              <Nav className="navbar-left">
                <NavItemLink to={this.makeHref("popular")}>Top</NavItemLink>
                <NavItemLink to={this.makeHref("latest")}>New</NavItemLink>
                <NavItemLink to={this.makeHref("submit")}>Submit</NavItemLink>
              </Nav>
              {this.getRightNav()}
            </Navbar>
        );

        var messages = this.state.messages || [];

        return (
            <div className="container-fluid">
                {navbar}
                {messages.map((msg, index) => {
                    var onDismiss = () => {
                        actions.dismissAlert(index);
                    };
                    return <Alert onDismiss={onDismiss} key={index} dismissAfter={3000} bsStyle={msg.level}>{msg.text}</Alert>;
                })}
               <RouteHandler user={this.state.user} {...this.props} /> 
            </div>
        );
    }
});
