var React = require('react'),
    actions = require('../actions'),
    PostsMixin = require('./PostsMixin');

module.exports = React.createClass({

    mixins: [
        PostsMixin
    ],

    fetchPosts: function(page) {
        actions.fetchLatestPosts(page);
    }

});
