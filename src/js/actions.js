var Reflux = require('reflux'),
    request = require('superagent');

actions = Reflux.createActions([
   "fetchPosts",
   "fetchPostsComplete"
]);
 

actions.fetchPosts.preEmit = function(page){
    request('GET', '/api/posts')
        .query({page: page}) 
        .end(function(res) {
            actions.fetchPostsComplete(page, res.body);
        });
};

module.exports = actions;


