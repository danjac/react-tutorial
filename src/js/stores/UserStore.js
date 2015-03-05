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
        this.trigger();
    },

    loginSuccess: function(user) {
        this.user = user;
        this.trigger();
    },

    logout: function() {
        this.user = null;
        this.trigger();
    },

});
 
