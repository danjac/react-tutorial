import React from 'react';
import Reflux from 'reflux';
import Posts from './Posts';
import actions from '../actions';
import UserStore from '../stores/UserStore';
import PostStore from '../stores/PostStore';


export const Authenticate = {
    statics: {
        willTransitionTo (transition) {
            if (!UserStore.isLoggedIn()){
                var nextPath = transition.path;
                transition.redirect("/login", {}, { nextPath: nextPath });
            }
        }
    }
};

export const PostsPage = {

    mixins: [
        Reflux.listenTo(PostStore, 'onUpdate')
    ],

    getInitialState () {
        return PostStore.getDefaultData();
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
                      page={this.state.page}
                      total={this.state.total}
                      posts={this.state.posts}
                      isFirst={this.state.isFirst}
                      isLast={this.state.isLast} />;
    }
};
    



