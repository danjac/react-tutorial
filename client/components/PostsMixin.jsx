var React = require('react'),
    Reflux = require('reflux'),
    Posts = require('./Posts'),
    actions = require('../actions'),
    PostStore = require('../stores/PostStore');

module.exports = {

    mixins: [
        Reflux.listenTo(PostStore, 'onUpdate')
    ],

    getInitialState: function() {
        return PostStore.getDefaultData();
    },

    componentDidMount: function() {
        this.fetchPosts(1);
    },

    onUpdate: function(data) {
        this.setState(data);
    },

    render: function() {
        return <Posts fetchPosts={this.fetchPosts} 
                      user={this.props.user}
                      {...this.state} />;
    }
};
