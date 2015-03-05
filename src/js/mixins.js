var UserStore = require('./stores/UserStore'),
    actions = require('./actions');

module.exports = {
    
    Authenticate: {
        statics: {
            willTransitionTo: function(transition) {
                if (!UserStore.isLoggedIn()){
                    actions.
                    var nextPath = transition.path;
                    transition.redirect("/login", {}, { nextPath: nextPath });
                }
            }
        }
    }
};


