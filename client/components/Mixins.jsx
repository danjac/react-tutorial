var React = require('react'),
    Reflux = require('reflux'),
    Posts = require('./Posts'),
    actions = require('../actions'),
    UserStore = require('../stores/UserStore'),
    PostStore = require('../stores/PostStore');

module.exports = {
    
    Authenticate: {
        statics: {
            willTransitionTo (transition) {
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

        getInitialState () {
            return PostStore.getDefaultData(this.props);
        },

        componentDidMount () {
            this.fetchPosts(1);
        },

        onUpdate (data) {
            this.setState(data);
        },

        render () {
            return <Posts fetchPosts={this.fetchPosts} 
                          user={this.props.user}
                          total={this.state.total}
                          posts={this.state.posts}
                          isFirst={this.state.isFirst}
                          isLast={this.state.isLast} />;
        }
    }
    

};


