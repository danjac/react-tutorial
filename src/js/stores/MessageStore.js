var Reflux = require('reflux'),
    actions = require('../actions');

module.exports = Reflux.createStore({

    listenables: actions,
    
    init: function() {
        this.messages = [];
    },

    getDefaultData: function() {
        return this.messages;
    },

    addMessage: function(level, msg) {
        this.messages.push({ level: level, text: msg });
        this.trigger();
    },

    dismissAlert: function(index) {
        this.messages.splice(index, 1);
        this.trigger();
    },

    success: function(msg){
        this.addMessage("success", msg);
    },

    warning: function(msg){
        this.addMessage("error", msg);
    },

    loginSuccess: function(user) {
        this.success("Welcome back, " + user.name);
    },

    loginFailure: function() {
        this.warning("Sorry, you have entered incorrect login info");
    }

});


