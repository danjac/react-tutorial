var React = require('react'),
    Posts = require('./Posts'),
    actions = require('../actions');


module.exports = React.createClass({

    fetchPosts: function(page) {
        actions.fetchPopularPosts(page);
    },

    render: function() {
        return <Posts fetchPosts={this.fetchPosts} {...this.props} />;
    }
});
