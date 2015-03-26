import React from 'react';
import {PureRenderMixin} from 'react/addons';
import Reflux from 'reflux';
import Router, {RouteHandler, Link} from 'react-router';
import {Alert, Navbar, Nav, NavItem, Input}  from 'react-bootstrap';
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

    handleSearch(event) {
        event.preventDefault();
        const q = this.refs.search.getValue();
        this.refs.search.getInputDOMNode().value = "";
        this.transitionTo("search", null, {q: q});
    },

    render() {

        const brand = <Link to={this.makeHref("popular")}>ReactNews</Link>;

        return (
            <Navbar brand={brand} className="navbar" fixedTop={true} fluid={true}>
              <Nav className="navbar-left">
                <NavItemLink to={this.makeHref("latest")}>new</NavItemLink>
                <NavItemLink to={this.makeHref("submit")}>submit</NavItemLink>
                <form className="navbar-form navbar-left" 
                      role="search" 
                      onSubmit={this.handleSearch}>
                    <Input type="search" 
                           placeholder="Search"
                           ref="search"  />
                </form>
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
        Reflux.listenTo(actions.logout, 'onLogout'),
        Reflux.listenTo(actions.startLoading, 'onLoadingStart'),
        Reflux.listenTo(actions.endLoading, 'onLoadingEnd')
    ],

    getInitialState() {
        return {
            messages: MessageStore.getDefaultData(),
            user: UserStore.getDefaultData(),
            loading: false
        }
    },

    onLogout() {
        this.transitionTo("popular");
    },

    onMessagesUpdate() {
        this.setState({ messages: MessageStore.getDefaultData() });
    },

    onUserUpdate() {
        this.setState({ user: UserStore.getDefaultData() });
    },

    onLoadingStart() {
        this.setState({ loading: true });
    },

    onLoadingEnd() {
        this.setState({ loading: false });
    },

    componentDidMount() {
        actions.getUser();
    },

    render() {

        if (this.state.loading) {
            // replace with loading gif...
            return (
                <div className="container-fluid">
                    <div className="text-center">
                        <h1>Loading....</h1>
                    </div> 
                </div>
            );
        }

        return (
            <div className="container-fluid">
                <Navigation user={this.state.user} />
                <Messages messages={this.state.messages} />
                <RouteHandler user={this.state.user} {...this.props} /> 
            </div>
        );
    }
});
