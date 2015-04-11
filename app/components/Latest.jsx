import React from 'react';
import actions from '../actions';
import {PostsPage} from './Mixins';

export default React.createClass({

    mixins: [
        PostsPage
    ],

    fetchPosts(page) {
        actions.fetchLatestPosts(page);
    }

});
