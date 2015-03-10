var React = require('react'),
    Router = require('react-router'),
    Posts = require('./Posts'),
    actions = require('../actions');

module.exports = React.createClass({

    mixins: [Router.State],

    fetchPosts: function(page) {
        actions.fetchPostsForUser(page, this.getParams().name);
    },

    render: function() {
        return <Posts fetchPosts={this.fetchPosts} {...this.props} />;
    }
});
