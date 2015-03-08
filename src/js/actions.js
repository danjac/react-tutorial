var Reflux = require('reflux'),
    request = require('superagent'),
    _ = require('lodash'),
    validators = require('./validators');

actions = Reflux.createActions([
   "dismissAlert",
   "fetchLatestPosts",
   "fetchPopularPosts",
   "fetchPostsForUser",
   "fetchPostsComplete",
   "login",
   "loginSuccess",
   "loginFailure",
   "loginRequired",
   "logout",
   "getUser",
   "getUserComplete",
   "submitPost",
   "submitPostSuccess",
   "submitPostFailure",
   "deletePost",
   "deletePostComplete",
   "signup",
   "signupSuccess",
   "signupFailure"
]);
 

const authToken = "authToken";

var bearer = function(request) {
    var token = window.localStorage.getItem(authToken);
    if (token) {
        request.set('Authorization', 'Bearer ' + token);
    }
    return request;
};

actions.signup.preEmit = function(name, email, password) {

    var nameExists = function(name) {
        return new Promise(function(resolve, reject) {
            request.get("/api/nameexists/")
                .query({ name: name })
                .end(function(res) {
                    resolve(res.body.exists);
                });
        });
    };

    var emailExists = function(email) {
        return new Promise(function(resolve, reject) {
            request.get("/api/emailexists/")
                .query({ email: email })
                .end(function(res) {
                    resolve(res.body.exists);
                });
        });
    };

    validators.signup(name, email, password, nameExists, emailExists).then(function(errors) {
        if (!_.isEmpty(errors)) {
            return actions.signupFailure(errors);
        }
        request.post("/api/signup/")
            .send({
                name: name,
                email: email,
                password: password
            }).end(function(res) {
                if (res.badRequest) {
                    return actions.signupFailure(res.body);
                }

                window.localStorage.setItem(authToken, res.body.token);
                actions.signupSuccess(res.body.user);
            });
    });
};

actions.deletePost.preEmit = function(post) {
    request.del("/api/" + post.id)
        .use(bearer)
        .end(function() {
            actions.deletePostComplete(post);
        });
};

actions.submitPost.preEmit = function(title, url) {
    request.post("/api/submit/")
        .use(bearer)
        .send({
            title: title,
            url: url
        })
        .end(function(res) {
            if (res.unauthorized || res.badRequest) {
                // we probably want a generic "unauthed" action
                actions.submitPostFailure();
                return; 
            }
            actions.submitPostSuccess(res.body);
        });
}

actions.logout.preEmit = function() {
    window.localStorage.removeItem(authToken);
}

actions.login.preEmit = function(identity, password) {

    request.post('/api/login/')
        .send({
            identity: identity,
            password: password
        })
        .end(function(res) {
            if (res.unauthorized) {
                actions.loginFailure();
                return;
            }
            window.localStorage.setItem(authToken, res.body.token);
            actions.loginSuccess(res.body.user);
        });
};

actions.getUser.preEmit = function() {

    request.get("/api/auth/")
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

    request.get('/api/posts/')
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

actions.fetchPostsForUser.preEmit = function(page, name) {
    request.get('/api/user/' + name)
        .query({
            page: page,
            orderBy: 'score'
        })
        .end(function(res) {
            actions.fetchPostsComplete(page, res.body);
        });
};

module.exports = actions;
