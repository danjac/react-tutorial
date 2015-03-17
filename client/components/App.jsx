import React from 'react';
import {PureRenderMixin} from 'react/addons';
import Reflux from 'reflux';
import Router, {RouteHandler, Link} from 'react-router';
import {Alert, Navbar, Nav, NavItem}  from 'react-bootstrap';
import {NavItemLink} from 'react-router-bootstrap';
import actions from '../actions';
import UserStore from '../stores/UserStore';
import MessageStore from '../stores/MessageStore';


const Messages = React.createClass({

    mixins: [PureRenderMixin],

    propTypes: {
        messages: React.PropTypes.object
    },

    render() {
        return (
            <div>
            {this.props.messages.map((msg, index) => {
                return <Alert onDismiss={() => actions.dismissAlert(index)} 
                              key={index} 
                              dismissAfter={3000} 
                              bsStyle={msg.level}>{msg.text}</Alert>;
            }).toJS()}
            </div>
        );
    }
});


const Navigation = React.createClass({

    mixins: [
        Router.Navigation,
        PureRenderMixin
    ],

    propTypes: {
        user: React.PropTypes.object
    },

    getRightNav() {

        const className = "navbar-right";

        if (this.props.user) {
            return (
              <Nav className={className}>
                <NavItemLink to={this.makeHref("user", {name: this.props.user.name})}>{this.props.user.name} ({this.props.user.totalScore})</NavItemLink>
                <NavItem onClick={actions.logout}>logout</NavItem>
              </Nav>
            );
        }
        return (
              <Nav className={className}>
                <NavItemLink to={this.makeHref("login")}>login</NavItemLink>
                <NavItemLink to={this.makeHref("signup")}>signup</NavItemLink>
              </Nav>
        );
    },

    render() {

        const brand = <Link to={this.makeHref("popular")}>ReactNews</Link>;

        return (
            <Navbar brand={brand} className="navbar navbar-inverse" fixedTop={true} fluid={true}>
              <Nav className="navbar-left">
                <NavItemLink to={this.makeHref("latest")}>new</NavItemLink>
                <NavItemLink to={this.makeHref("submit")}>submit</NavItemLink>
              </Nav>
              {this.getRightNav()}
            </Navbar>
        );

    }

});

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

    componentDidMount() {
        actions.getUser();
    },

    render() {

        return (
            <div className="container-fluid">
                <Navigation user={this.state.user} />
                <Messages messages={this.state.messages} />
                <RouteHandler user={this.state.user} {...this.props} /> 
            </div>
        );
    }
});
