var Reflux = require('reflux'),
    request = require('superagent'),
    _ = require('lodash'),
    actions = require('../actions');

module.exports = Reflux.createStore({

    listenables: actions,
    
    init: function() {
        this.posts = [];
        this.page = 1;
    },

    _trigger: function() {
        this.trigger({
            posts: this.posts,
            page: this.page
        });
    },

    deletePost: function(post) {
        this.posts = _.remove(this.posts, function(p) {
            return p.id !== post.id;
        });
        this._trigger();
    },

    fetchPostsComplete: function(page, posts) {
        this.posts = posts;
        this.page = page;
        this._trigger();
    },

    getDefaultData: function() {
        return {
            posts: this.posts,
            page: this.page
        }
    }
});
