var React = require('react'),
    Reflux = require('reflux'),
    Router = require('react-router'),
    {Input} = require('react-bootstrap'),
    _ = require('lodash'),
    {Authenticate} = require('../mixins'),
    validators = require('../validators'),
    actions = require('../actions');



module.exports = React.createClass({

    mixins: [
        Router.Navigation,
        Authenticate,
        Reflux.listenTo(actions.submitPostSuccess, "onSubmitPostSuccess"),
        Reflux.listenTo(actions.submitPostFailure, "onSubmitPostFailure")
    ],

    getInitialState: function() {
        return {
            errors: {}
        }
    },

    onSubmitPostFailure: function(errors) {
        if (!_.isEmpty(errors)) {
            this.setState({ errors: errors });
        }
    },

    onSubmitPostSuccess: function() {
        this.transitionTo("latest");
    },

    handleSubmit: function(event) {
        event.preventDefault();
        var title = this.refs.title.getValue(),
            url = this.refs.url.getValue();

        var errors = validators.newPost(title, url);

        if (_.isEmpty(errors)){
            actions.submitPost(title, url);
        }

        this.setState({ errors: errors });
    },

    getInputStyle: function(ref) {
        return this.state.errors[ref] ? 'error': undefined;
    },

    render: function() {
        return (
            <form onSubmit={this.handleSubmit}>
                <Input ref="title" type="text" label="Title" bsStyle={this.getInputStyle('title')} help={this.state.errors.title} />
                <Input ref="url" type="text" label="Link" bsStyle={this.getInputStyle('url')} help={this.state.errors.url} />
                <Input type="submit" value="Submit post" />
            </form>
        );
    }
});
