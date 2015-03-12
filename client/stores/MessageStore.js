var Reflux = require('reflux'),
    actions = require('../actions');

module.exports = Reflux.createStore({

    listenables: actions,
    
    init() {
        this.messages = [];
    },

    getDefaultData() {
        return this.messages;
    },

    addMessage(level, msg) {
        this.messages.push({ level: level, text: msg });
        this.trigger();
    },

    dismissAlert(index) {
        this.messages.splice(index, 1);
        this.trigger();
    },

    success(msg){
        this.addMessage("success", msg);
    },

    warning(msg){
        this.addMessage("warning", msg);
    },

    loginSuccess(user) {
        this.success("Welcome back, " + user.name);
    },

    loginFailure() {
        this.warning("Sorry, you have entered incorrect login info");
    },

    logout() {
        this.success("Bye for now");
    },

    submitPostSuccess() {
        this.success("Thank you for your post!");
    },

    loginRequired() {
        this.warning("Please login to continue");
    },

    signupSuccess(user) {
        this.success("Hi " + user.name + "! Welcome to the site!");
    }

});


