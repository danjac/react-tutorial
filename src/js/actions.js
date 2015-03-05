var Reflux = require('reflux'),
    request = require('superagent');

actions = Reflux.createActions([
   "dismissAlert",
   "fetchLatestPosts",
   "fetchPopularPosts",
   "fetchPostsComplete",
   "login",
   "loginSuccess",
   "loginFailure",
   "logout",
   "getUser",
   "getUserComplete"
]);
 

const AUTH_TOKEN = "authToken";

var bearer = function(request) {
    var token = window.localStorage.getItem(AUTH_TOKEN);
    console.log("TOKEN", token);
    if (token) {
        request.set('Authorization', 'Bearer ' + token);
    }
};

actions.logout.preEmit = function() {
    window.localStorage.removeItem(AUTH_TOKEN);
}

actions.login.preEmit = function(identity, password) {

    request.post('/api/login')
        .send({
            identity: identity,
            password: password
        })
        .end(function(res) {
            if (res.unauthorized) {
                actions.loginFailure();
                return;
            }
            window.localStorage.setItem(AUTH_TOKEN, res.body.token);
            actions.loginSuccess(res.body.user);
        });
};

actions.getUser.preEmit = function() {

    request.get("/api/auth")
        .use(bearer)
        .end(function(res) {
            if (res.unauthorized) {
                actions.getUserComplete(null);
                return;
            }
            actions.getUserComplete(res.body);
        });
};

var fetchPosts = function(page, orderBy) {

    request.get('/api/posts')
        .query({
            page: page,
            orderBy: orderBy
        }) 
        .end(function(res) {
            actions.fetchPostsComplete(page, res.body);
        });
};

actions.fetchLatestPosts.preEmit = function(page){
    fetchPosts(page, "id");
};

actions.fetchPopularPosts.preEmit = function(page){
    fetchPosts(page, "score");
};

module.exports = actions;


