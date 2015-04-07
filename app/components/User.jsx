import React from 'react'
import Router from 'react-router'
import _ from 'lodash'
import actions from '../actions'
import {PostsPage} from './Mixins'

export default React.createClass({

    mixins: [
        PostsPage
    ],

    contextTypes: {
        router: React.PropTypes.func
    },


    getInitialState() {
        return {
            name: this.context.router.getCurrentParams().name
        };
    },

    fetchPosts(page) {
        actions.fetchPostsForUser(page, this.state.name);
    },

    componentWillReceiveProps(nextProps) {
        const name = this.context.router.getCurrentParams().name;
        if (name != this.state.name){
            this.setState({ name: name});
            actions.fetchPostsForUser(1, name);
        }
    }

})
