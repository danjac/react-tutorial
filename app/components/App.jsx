import React from 'react';
import {PureRenderMixin} from 'react/addons';
import Reflux from 'reflux';
import Router, {RouteHandler, Link} from 'react-router';
import {Alert, Navbar, Nav, NavItem, Input} from 'react-bootstrap';
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
        PureRenderMixin
    ],

    propTypes: {
        user: React.PropTypes.object
    },

    contextTypes: {
        router: React.PropTypes.func
    },

    getLeftNav() {
        const makeHref = this.context.router.makeHref;

        return (
          <Nav className="navbar-left">
            <NavItemLink to={makeHref("latest")}>new</NavItemLink>
            <NavItemLink to={makeHref("submit")}>submit</NavItemLink>
            <form className="navbar-form navbar-left"
                  role="search"
                  onSubmit={this.clearSearch}>
                <Input type="text"
                       placeholder="Search"
                       onKeyUp={this.handleSearch}
                       ref="search" />
            </form>
          </Nav>
        );
    },

    getRightNav() {

        const className = "navbar-right",
              makeHref = this.context.router.makeHref;

        if (this.props.user) {
            return (
              <Nav className={className}>
                <NavItemLink to={makeHref("user", {name: this.props.user.name})}>{this.props.user.name} ({this.props.user.totalScore})</NavItemLink>
                <NavItem href="/logout/">logout</NavItem>
              </Nav>
            );
        }
        return (
              <Nav className={className}>
                <NavItemLink to={makeHref("login")}>login</NavItemLink>
                <NavItemLink to={makeHref("signup")}>signup</NavItemLink>
              </Nav>
        );
    },

    clearSearch(event) {
        event.preventDefault();
        this.refs.search.getInputDOMNode().value = "";
    },

    handleSearch(event) {
        event.preventDefault();
        const q = this.refs.search.getValue().trim();
        this.context.router.transitionTo("search", null, {q: q});
    },

    render() {

        const makeHref = this.context.router.makeHref,
              brand = <Link to={makeHref("popular")}>Pinbook</Link>;

        return (
            <Navbar brand={brand}
                    fixedTop={true}
                    inverse={true}
                    fluid={true}>
              {this.getLeftNav()}
              {this.getRightNav()}
            </Navbar>
        );

    }

});

export default React.createClass({

    mixins: [
        Reflux.connect(MessageStore, 'messages'),
        Reflux.connect(UserStore, 'user'),
        Reflux.listenTo(actions.loginRequired, 'onLoginRequired')
    ],

    contextTypes: {
        router: React.PropTypes.func
    },

    getInitialState() {
        return {
            messages: MessageStore.getDefaultData(),
            user: UserStore.getDefaultData()
        };
    },

    onLoginRequired() {
        this.context.router.transitionTo("login");
    },

    render() {

        return (
            <div className="container-fluid">
                <Navigation user={this.state.user} />
                <Messages messages={this.state.messages} />
                <RouteHandler user={this.state.user} />
            </div>
        );
    }
});
