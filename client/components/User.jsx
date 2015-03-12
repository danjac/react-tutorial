var React = require('react'),
    Router = require('react-router'),
    _ = require('lodash'),
    actions = require('../actions'),
    {PostsPage} = require('./Mixins');


module.exports = React.createClass({

    mixins: [
        Router.State,
        PostsPage
    ],

    getInitialState() {
        return {
            name: this.getParams().name
        };
    },

    fetchPosts(page) {
        actions.fetchPostsForUser(page, this.state.name);
    },

    componentWillReceiveProps(nextProps) {
        var name = this.getParams().name;
        if (name != this.state.name){
            this.setState({ name: name});
            actions.fetchPostsForUser(1, name);
        }
    }

});
