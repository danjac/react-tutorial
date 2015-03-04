var Reflux = require('reflux'),
    request = require('superagent');

actions = Reflux.createActions([
   "dismissAlert",
   "fetchLatestPosts",
   "fetchPopularPosts",
   "fetchPostsComplete",
   "login",
   "loginSuccess",
   "loginFailure"
]);
 
actions.login.preEmit = function(identity, password) {

    // we'll do an API call here
    //
    console.log("LOGIN", identity);

    if (identity === "danjac") {
        var user = {
            id: 2,
            name: "danjac",
            email: "danjac354@gmail.com"
        }
        actions.loginSuccess(user);
    } else {
        console.log("fail");
        actions.loginFailure();
    }
};

function fetchPosts(page, orderBy) {

    request('GET', '/api/posts')
        .query({
            page: page,
            orderBy: orderBy
        }) 
        .end(function(res) {
            actions.fetchPostsComplete(page, res.body);
        });
}

actions.fetchLatestPosts.preEmit = function(page){
    fetchPosts(page, "id");
};

actions.fetchPopularPosts.preEmit = function(page){
    fetchPosts(page, "score");
};

module.exports = actions;


