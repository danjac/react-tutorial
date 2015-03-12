var React = require('react'),
    actions = require('../actions'),
    {PostsPage} = require('./Mixins');

module.exports = React.createClass({

    mixins: [
        PostsPage
    ],

    fetchPosts (page) {
        actions.fetchPopularPosts(page);
    }

});
