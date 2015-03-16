import React from 'react';
import Reflux from 'reflux';
import Router, {RouteHandler} from 'react-router';
import {Alert, Navbar, Nav, NavItem}  from 'react-bootstrap';
import {NavItemLink} from 'react-router-bootstrap';
import actions from '../actions';
import UserStore from '../stores/UserStore';
import MessageStore from '../stores/MessageStore';

export default React.createClass({

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
        this.transitionTo(this.makeHref("popular"));
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

        return (
            <div className="container-fluid">
                {navbar}
                {this.state.messages.map((msg, index) => {
                    return <Alert onDismiss={() => actions.dismissAlert(index)} 
                                  key={index} 
                                  dismissAfter={3000} 
                                  bsStyle={msg.level}>{msg.text}</Alert>;
                }).toJS()}
               <RouteHandler user={this.state.user} {...this.props} /> 
            </div>
        );
    }
});
