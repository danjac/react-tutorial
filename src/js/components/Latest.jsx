var React = require('react'),
    Posts = require('./Posts'),
    actions = require('../actions');


module.exports = React.createClass({

    fetchPosts: function(page) {
        actions.fetchLatestPosts(page);
    },

    render: function() {
        return <Posts posts={this.props.latestPosts} fetchPosts={this.fetchPosts} user={this.props.user}/>
    }
});
