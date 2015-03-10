var React = require('react'),
    Router = require('react-router'),
    Posts = require('./Posts'),
    actions = require('../actions');

module.exports = React.createClass({

    mixins: [Router.State],

    getInitialState: function() {
        return {
            name: this.getParams().name
        };
    },

    fetchPosts: function(page) {
        actions.fetchPostsForUser(page, this.state.name);
    },


    componentWillReceiveProps: function(nextProps) {
        var name = this.getParams().name;
        if (name != this.state.name){
            this.setState({ name: name});
            actions.fetchPostsForUser(1, name);
        }
    },


    render: function() {
        return <Posts fetchPosts={this.fetchPosts} {...this.props} />;
    }
});
