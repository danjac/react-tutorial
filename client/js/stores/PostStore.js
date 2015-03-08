var Reflux = require('reflux'),
    request = require('superagent'),
    _ = require('lodash'),
    actions = require('../actions');

module.exports = Reflux.createStore({

    listenables: actions,
    
    init: function() {
        this.posts = [];
        this.page = 1;
        this.total = 0;
        this.isFirst = true;
        this.isLast = true;
    },

    _trigger: function() {
        this.trigger({
            posts: this.posts,
            page: this.page,
            isFirst: this.isFirst,
            isLast: this.isLast
        });
    },

    deletePost: function(post) {
        this.posts = _.remove(this.posts, function(p) {
            return p.id !== post.id;
        });
        this._trigger();
    },

    fetchPostsComplete: function(page, result) {
        this.page = page;
        this.posts = result.posts;
        this.isFirst = result.isFirst;
        this.isLast = result.isLast;
        this.total = result.total;
        this._trigger();
    },

    getDefaultData: function() {
        return {
            posts: this.posts,
            page: this.page,
            total: this.total,
            isFirst: this.isFirst,
            isLast: this.isLast
        }
    }
});
