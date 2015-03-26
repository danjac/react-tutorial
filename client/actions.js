import Reflux from 'reflux';
import request from 'superagent';
import _ from 'lodash';
import Checkit from 'checkit';
import * as validators from './validators';


const actions = Reflux.createActions([
   "dismissAlert",
   "fetchLatestPosts",
   "fetchPopularPosts",
   "searchPosts",
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
   "voteDown",
   "startLoading",
   "endLoading"
]);
 

const authToken = "authToken";

const parseServerErrors = (errors) => {
    // errors return in form of [name] -> {message: ...}
    return _.mapValues(errors, (e) => e.message);
};


const bearer = (request) => {
  const token = window.localStorage.getItem(authToken);
  if (!token) {
    return request;
  }
  request.set('Authorization', 'Bearer ' + token);
  return request;
};


actions.voteUp.preEmit = (post) => {
  request.put("/api/upvote/" + post._id)
    .use(bearer)
    .end();
};

actions.voteDown.preEmit = (post) => {
  request.put("/api/downvote/" + post._id)
    .use(bearer)
    .end();
};

actions.signup.preEmit = (data) => {
    validators.Signup.run(data)
    .then((clean) => {
        request.post("/api/signup/")
            .send(clean)
            .end((res) => {
                if (res.badRequest) {
                    return actions.signupFailure(parseServerErrors(res.body));
                }
                window.localStorage.setItem(authToken, res.body.token);
                actions.signupSuccess(res.body.user);
              });
    })
    .catch(Checkit.Error, (err) => {
        actions.signupFailure(err.toJSON());
    });
};

actions.deletePost.preEmit = (post) => {
    request.del("/api/" + post._id)
        .use(bearer)
        .end(() =>  actions.deletePostComplete(post));
};

actions.submitPost.preEmit = (data) => {

    validators.NewPost.run(data)
    .then((clean) => {
        actions.startLoading();
        request.post("/api/submit/")
            .use(bearer)
            .send(clean)
            .end((res) => {
                actions.endLoading();
                if (res.badRequest) {
                    return actions.submitPostFailure(parseServerErrors(res.body));
                }
                actions.submitPostSuccess(res.body);
            });
    })
    .catch(Checkit.Error, (err) => {
        actions.submitPostFailure(err.toJSON());
    });
}

actions.logout.preEmit = () => {
    window.localStorage.removeItem(authToken);
}

actions.login.preEmit = (data) => {

    validators.Login.run(data)
    .then((clean) => {
        //actions.startLoading();
        request.post('/api/login/')
            .send(clean)
            .end((res) => {
                //actions.endLoading();
                if (res.badRequest) {
                    return actions.loginFailure();
                }
                window.localStorage.setItem(authToken, res.body.token);
                actions.loginSuccess(res.body.user);
            });
    })
    .catch(Checkit.Error, (err) => {
        actions.loginFailure(err.toJSON());
    });

};

actions.getUser.preEmit = () => {

    actions.startLoading();

    request.get("/api/auth/")
        .use(bearer)
        .end((res) => {
            actions.endLoading();
            if (res.unauthorized) {
                return actions.getUserComplete(null);
            }
            actions.getUserComplete(res.body);
        });
};

actions.searchPosts.preEmit = (page, query) => {

    if (!query) {
        return;
    }
    request.get('/api/search/')
        .query({
            page: page,
            q: query
        })
        .end((res) => actions.fetchPostsComplete(page, res.body));
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
