var Reflux = require('reflux'),
    request = require('superagent'),
    Immutable = require('immutable'),
    _ = require('lodash'),
    actions = require('../actions');

module.exports = Reflux.createStore({

    listenables: actions,
    
    init: function() {
        this.posts = Immutable.List();
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

    indexOf: function(post) {
        return this.posts.findIndex(function(p) {
            return p.id === post.id;
        });
    },

    deletePost: function(post) {
        this.posts = this.posts.delete(this.indexOf(post));
        this._trigger();
    },

    adjustScore: function(post, amount) {
        this.posts = this.posts.update(this.indexOf(post), function(post) {
            post.score += amount;
            return post;
        });
        this._trigger();
    },

    voteUp: function(post) {
        this.adjustScore(post, 1);
    },

    voteDown: function(post) {
        this.adjustScore(post, -1);
    },


    fetchPostsComplete: function(page, result) {
        this.page = page;
        this.posts = Immutable.List(result.posts);
        this.isFirst = result.isFirst;
        this.isLast = result.isLast;
        this.total = result.total;
        this._trigger();
    },

    getDefaultData: function(defaults) {
        defaults =  _.defaults(
            defaults || {}, {
                posts: this.posts,
                page: this.page,
                total: this.total,
                isFirst: this.isFirst,
                isLast: this.isLast
            });
        defaults.posts = Immutable.List(defaults.posts);
        return defaults;
    }
});
