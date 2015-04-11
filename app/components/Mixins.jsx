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
        return {result: PostStore.getDefaultData() };
    },

    componentDidMount () {
        this.fetchPosts(1);
    },

    onUpdate (data) {
        this.setState({ result: data });
    },

    render () {
        return <Posts fetchPosts={this.fetchPosts}
                      user={this.props.user}
                      result={this.state.result} />;
    }
};




