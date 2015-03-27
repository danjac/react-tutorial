import React from 'react';
import Router from 'react-router';
import actions from '../actions';
import {PostsPage} from './Mixins';

export default React.createClass({

    mixins: [
        PostsPage
    ],

    contextTypes: {
        router: React.PropTypes.func
    },

    getInitialState() {
        return {
            search: this.getSearchQuery()
        };
    },

    getSearchQuery() {
        return this.context.router.getCurrentQuery().q;
    },

    fetchPosts(page) {
        actions.searchPosts(page, this.state.search);
    },

    componentWillReceiveProps(nextProps) {
        const q = this.getSearchQuery();
        if (q != this.state.search){
            this.setState({ search: q});
            actions.searchPosts(1, q);
        }
    }


});
