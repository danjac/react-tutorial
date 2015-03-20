import React from 'react';
import Router from 'react-router';
import actions from '../actions';
import {PostsPage} from './Mixins';

export default React.createClass({

    mixins: [
        Router.State,
        PostsPage
    ],

    getInitialState() {
        return {
            search: this.getQuery().q
        };
    },

    fetchPosts(page) {
        actions.searchPosts(page, this.state.search);
    },

    componentWillReceiveProps(nextProps) {
        const q = this.getQuery().q;
        if (q != this.state.search){
            this.setState({ search: q});
            actions.searchPosts(1, q);
        }
    }


});
