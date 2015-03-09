var Reflux = require('reflux'),
    _ = require('lodash'),
    actions = require('../actions');

module.exports = Reflux.createStore({

    listenables: actions,

    init: function() {
        this.user = null;
    },

    getDefaultData: function() {
        return this.user;
    },

    isLoggedIn: function() {
        return !_.isEmpty(this.user);
    },

    getUserComplete: function(user) {
        this.user = user;
        this.user.votes = []; // placeholder
        this.trigger();
    },

    loginSuccess: function(user) {
        this.user = user;
        this.user.votes = []; // placeholder
        this.trigger();
    },

    signupSuccess: function(user) {
        this.user = user;
        this.user.votes = []; // placeholder
        this.trigger();
    },

    logout: function() {
        this.user = null;
        this.trigger();
    },

    tallyVote: function(postId) {
        if (this.user) {
            this.user.votes = this.user.votes || []; // placeholder
        }
        this.user.votes.push(postId);
        this.trigger();
    },

    voteUp: function(postId) {
        this.tallyVote(postId);
    },

    voteDown: function(postId) {
        this.tallyVote(postId);
    }



});
 
