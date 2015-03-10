var React = require('react'),
    Posts = require('./Posts'),
    actions = require('../actions');


module.exports = React.createClass({

    fetchPosts: function(page) {
        actions.fetchLatestPosts(page);
    },

    render: function() {
        return <Posts fetchPosts={this.fetchPosts} {...this.props} />;
    }
});
