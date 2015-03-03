var Reflux = require('reflux'),
    request = require('superagent'),
    actions = require('../actions');

module.exports = Reflux.createStore({

    listenables: actions,
    
    init: function() {
        this.posts = [];
        this.page = 1;
    },

    fetchPostsComplete: function(page, posts) {
        this.posts = posts;
        this.page = page;
        this.trigger({
            posts: this.posts,
            page: this.page
        });
    },

    getDefaultData: function() {
        return {
            posts: this.posts,
            page: this.page
        }
    }
});
