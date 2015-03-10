var React = require('react'),
    Reflux = require('reflux'),
    _ = require('lodash'),
    Posts = require('./Posts'),
    actions = require('../actions'),
    UserStore = require('../stores/UserStore'),
    PostStore = require('../stores/PostStore');

module.exports = {
    
    Authenticate: {
        statics: {
            willTransitionTo: function(transition) {
                if (!UserStore.isLoggedIn()){
                    var nextPath = transition.path;
                    transition.redirect("/login", {}, { nextPath: nextPath });
                }
            }
        }
    },

    PostsPage: {

        mixins: [
            Reflux.listenTo(PostStore, 'onUpdate')
        ],

        getInitialState: function() {
            return _.defaults(this.props, PostStore.getDefaultData());
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
                          total={this.state.total}
                          posts={this.state.posts}
                          isFirst={this.state.isFirst}
                          isLast={this.state.isLast} />;
        }
    }
    

};

