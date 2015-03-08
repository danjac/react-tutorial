var React = require('react'),
    Reflux = require('reflux'),
    Router = require('react-router'),
    {Input} = require('react-bootstrap'),
    validator = require('validator'),
    _ = require('lodash'),
    UserStore = require('../stores/UserStore'),
    actions = require('../actions');

module.exports = React.createClass({

    mixins: [
        Router.Navigation,
        Router.State,
        Reflux.listenTo(UserStore, 'onLoginSuccess'),
    ],

    getInitialState: function() {
        return {
            errors: {}
        }
    },

    redirect: function() {
        var nextPath = this.getQuery().nextPath || "/";
        this.transitionTo(nextPath);
    },
    
    onLoginSuccess: function() {
        var user = UserStore.getDefaultData();
        if (user) {
            this.redirect();
        }
    },

    handleSubmit: function(event) {
        event.preventDefault();

        var identity = this.refs.identity.getValue(),
            password = this.refs.password.getValue();

        var errors = this.validate(identity, password);

        this.setState({ errors: errors });

        if (_.isEmpty(errors)) {
            actions.login(identity, password);
        }

    },

    validate: function(identity, password) {
        var errors = {};

        if (!validator.isLength(identity, 1)) {
            errors.identity = 'Username or email address required';
        }

        if (!validator.isLength(password, 1)) {
            errors.password = 'Password required';
        }

        return errors;
    },

    getInputStyle: function(ref) {
        if (this.state.errors[ref]) return 'error';
    },

    render: function() {

        return (

        <form onSubmit={this.handleSubmit}>
            <Input ref="identity" 
                   type="text" 
                   label="Email or username" 
                   help={this.state.errors.identity} 
                   bsStyle={this.getInputStyle('identity')} />
            <Input ref="password" 
                   type="password" 
                   label="Password" 
                   help={this.state.errors.password} 
                   bsStyle={this.getInputStyle('password')} />
            <Input type="submit" value="Login" />
        </form>
        );
    }
});
