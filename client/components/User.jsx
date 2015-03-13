import React from 'react';
import Router from 'react-router';
import _ from 'lodash';
import actions from '../actions';
import {PostsPage} from './Mixins';

export default React.createClass({

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
        const name = this.getParams().name;
        if (name != this.state.name){
            this.setState({ name: name});
            actions.fetchPostsForUser(1, name);
        }
    }

});
