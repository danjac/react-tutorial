var React = require('react'),
    Posts = require('./Posts'),
    actions = require('../actions');


module.exports = React.createClass({

    fetchPosts: function(page) {
        actions.fetchPosts(page);
    },

    render: function() {
        return <Posts posts={this.props.popularPosts} fetchPosts={this.fetchPosts} />
    }
});
