import Reflux from 'reflux';
import request from 'superagent';
import _ from 'lodash';
import * as validators from './validators';

const actions = Reflux.createActions([
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
   "signupFailure",
   "voteUp",
   "voteDown"
]);
 

const authToken = "authToken";

const bearer = (request) => {
    const token = window.localStorage.getItem(authToken);
    if (token) {
        request.set('Authorization', 'Bearer ' + token);
    }
    return request;
};


actions.voteUp.preEmit = (post) => {
  request.put("/api/upvote/" + post.id)
    .use(bearer)
    .end();
};

actions.voteDown.preEmit = (post) => {
  request.put("/api/downvote/" + post.id)
    .use(bearer)
    .end();
};

actions.signup.preEmit = (name, email, password) => {

    const validator = new validators.Signup();

    const result = validator.check({
        name: name,
        email: email,
        password: password
    });

    if (!result.ok) {
        return actions.signupFailure(result.errors);
    }

    request.post("/api/signup/")
        .send(result.data)
        .end((res) => {
            if (res.badRequest) {
                return actions.signupFailure(res.body);
            }
            window.localStorage.setItem(authToken, res.body.token);
            actions.signupSuccess(res.body.user);
        });
};

actions.deletePost.preEmit = (post) => {
    request.del("/api/" + post.id)
        .use(bearer)
        .end(() =>  actions.deletePostComplete(post));
};

actions.submitPost.preEmit = (title, url) => {

    const validator = new validators.NewPost();

    const result = validator.check({
        title: title,
        url: url
    });

    if (!result.ok) {
        return actions.submitPostFailure(result.errors);
    }

    request.post("/api/submit/")
        .use(bearer)
        .send({
            title: title,
            url: url
        })
        .end((res) => {
            if (res.unauthorized || res.badRequest) {
                return actions.submitPostFailure(res.body);
            }
            actions.submitPostSuccess(res.body);
        });
}

actions.logout.preEmit = () => {
    window.localStorage.removeItem(authToken);
}

actions.login.preEmit = (identity, password) => {

    request.post('/api/login/')
        .send({
            identity: identity,
            password: password
        })
        .end((res) => {
            if (res.unauthorized) {
                return actions.loginFailure();
            }
            window.localStorage.setItem(authToken, res.body.token);
            actions.loginSuccess(res.body.user);
        });
};

actions.getUser.preEmit = () => {

    request.get("/api/auth/")
        .use(bearer)
        .end((res) => {
            if (res.unauthorized) {
                return actions.getUserComplete(null);
            }
            actions.getUserComplete(res.body);
        });
};

const fetchPosts = (page, orderBy) => {

    request.get('/api/posts/')
        .query({
            page: page,
            orderBy: orderBy
        }) 
        .end((res) =>  actions.fetchPostsComplete(page, res.body));
};

actions.fetchLatestPosts.preEmit = (page) => fetchPosts(page, "id");
actions.fetchPopularPosts.preEmit = (page) =>  fetchPosts(page, "score");

actions.fetchPostsForUser.preEmit = (page, name) => {
    request.get('/api/user/' + name)
        .query({
            page: page,
            orderBy: 'score'
        })
        .end((res) => actions.fetchPostsComplete(page, res.body));
};

export default actions;
