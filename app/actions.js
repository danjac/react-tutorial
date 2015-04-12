import Reflux from 'reflux';
import * as api from './api';


const actions = Reflux.createActions([
    "dismissAlert",
    "loginRequired",
    "permissionDenied"
]);


const asyncActions = [
    "fetchLatestPosts",
    "fetchPopularPosts",
    "searchPosts",
    "fetchPosts",
    "fetchPostsForUser",
    "login",
    "submitPost",
    "deletePost",
    "signup",
    "voteUp",
    "voteDown"
];


asyncActions.forEach((name) => {
    actions[name] = Reflux.createAction({ asyncResult: true });
});

actions.voteUp.listen((post) => {
    api.voteUp(post);
});

actions.voteDown.listen((post) => {
    api.voteDown(post);
});

actions.signup.listen((data) => {

    api.signup(data)
        .then((user) => {
            actions.signup.completed(user);
        })
        .catch((err) => {
            actions.signup.failed(err);
        });

});


actions.deletePost.listen((post) => {
    api.deletePost(post);
});

actions.submitPost.listen((data) => {
    api.submitPost(data)
        .then((post) => {
            actions.submitPost.completed(post);
        })
        .catch((err) => {
            actions.submitPost.failed(err);
        });
});

actions.login.listen((data) => {
    api.login(data)
        .then((user) => {
            actions.login.completed(user);
        })
        .catch((err) => {
            actions.login.failed(err);
        });
});

actions.searchPosts.listen((page, query) => {

    api.searchPosts(page, query)
        .then((result) => {
            actions.fetchPosts.completed(page, result);
        });
});

actions.fetchLatestPosts.listen((page) => {

    api.fetchLatestPosts(page)
        .then((result) => {
            actions.fetchPosts.completed(page, result);
        });
});

actions.fetchPopularPosts.listen((page) => {

    api.fetchPopularPosts(page)
        .then((result) => {
            actions.fetchPosts.completed(page, result);
        });
});


actions.fetchPostsForUser.listen((page, name) => {
    api.fetchPostsForUser(page, name)
        .then((result) => {
            actions.fetchPosts.completed(page, result);
        });
});

export default actions;
