var React = require('react'),
    Reflux = require('reflux'),
    Router = require('react-router'),
    {Input} = require('react-bootstrap'),
    actions = require('../actions');

module.exports = React.createClass({

    mixins: [
        Router.Navigation,
        Reflux.listenTo(actions.signupFailure, "onSignupFailure"),
        Reflux.listenTo(actions.signupSuccess, "onSignupSuccess")
    ],

    getInitialState: function() {
        return {
            errors: {}
        };
    },

    onSignupSuccess: function() {
        this.transitionTo(this.makeHref("submit"));
    },

    onSignupFailure: function(errors) {
        this.setState({ errors: errors });
    },

    handleSubmit: function(event) {
        event.preventDefault();
        
        var name = this.refs.name.getValue(),
            email = this.refs.email.getValue(),
            password = this.refs.password.getValue();

        actions.signup(name, email, password);
    },

    getInputStyle: function(ref) {
        if (this.state.errors[ref]) {
            return 'error';
        }
        return null;
    },

    render: function() {

        return (
            <form onSubmit={this.handleSubmit}>
               <Input ref="name" 
                      type="text" 
                      label="Name" 
                      bsStyle={this.getInputStyle("name")}  
                      help={this.state.errors.name} />
               <Input ref="email" 
                      type="email" 
                      label="Email address" 
                      bsStyle={this.getInputStyle("email")}  
                      help={this.state.errors.email} />
               <Input ref="password" 
                      type="password" 
                      label="Password" 
                      bsStyle={this.getInputStyle("password")}  
                      help={this.state.errors.password} />
               <Input type="submit" value="Signup" />
            </form>
        );
    }

});
