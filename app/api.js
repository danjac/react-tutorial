import request from 'superagent';
import csrf from 'superagent-csrf';
import _ from 'lodash';
import Checkit from 'checkit';
import * as validators from './validators';


// csrf initialization
csrf(request);

const csrfToken = window._csrf;


const isUnique = (field, url) => {

    return (value) => {

        if (!value) {
            return;
        }

        return new Promise((resolve, reject) => {
            request
            .get(url)
            .query({ [field]: value })
            .end((err, res) => {
                if (res && res.body.exists) {
                    reject(new Checkit.ValidationError("The " + field + " field is already in use"));
                }
                resolve();
            });
        });
    };

};

const signupValidator = validators.Signup(
        isUnique('name', '/api/isname'),
        isUnique('email', '/api/isemail')),
      postValidator = validators.NewPost(),
      loginValidator = validators.Login();


const fetchPosts = (page, orderBy) => {

    return new Promise((resolve, reject) => {
        request
            .get('/api/posts/')
            .query({
                page: page,
                orderBy: orderBy
            })
            .end((err, res) =>  {
                if (err) {
                    return reject(err);
                }
                resolve(res.body);
            });
    });
}


export function voteUp(post) {
    return request
        .put("/api/auth/upvote/" + post._id)
        .csrf(csrfToken)
        .end();
}

export function voteDown(post) {
    return request
        .put("/api/auth/downvote/" + post._id)
        .csrf(csrfToken)
        .end();
}

export function signup(data) {
    return new Promise((resolve, reject) => {
        signupValidator
            .run(data)
            .then((clean) => {
                request
                    .post("/api/signup/")
                    .csrf(csrfToken)
                    .send(clean)
                    .end((err, res) => {
                        if (res.badRequest) {
                            return reject(res.body);
                        }
                        resolve(res.body);
                      });
            })
            .catch(Checkit.Error, (err) => {
                return reject(err.toJSON());
            });
    });
}

export function deletePost(post)  {
    return new Promise((resolve, reject) => {
        request
            .del("/api/auth/" + post._id)
            .csrf(csrfToken)
            .end((err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
    });
}

export function submitPost(data) {

    return new Promise((resolve, reject) => {
        postValidator
            .run(data)
            .then((clean) => {
                request
                    .post("/api/auth/submit/")
                    .csrf(csrfToken)
                    .send(clean)
                    .end((err, res) => {

                        if (err) {
                            if (res.badRequest) {
                                return reject(res.body);
                            }
                            return reject();
                        }
                        resolve(res.body);
                    });
            })
            .catch(Checkit.Error, (err) => {
                reject(err.toJSON())
            });
    });
};

export function logout() {
    request.post("/api/auth/logout").end();
};


export function login(data) {

    console.log("logging in...");

    return new Promise((resolve, reject) => {
        loginValidator
            .run(data)
            .then((clean) => {
                request
                    .post('/api/login/')
                    .csrf(csrfToken)
                    .send(clean)
                    .end((err, res) => {
                        if (err) {
                            return reject();
                        }
                        resolve(res.body);

                    });
            })
            .catch(Checkit.Error, (err) => {
                reject(err.toJSON());
            });
    });

};

export function getUser() {
    return new Promise((resolve, reject) => {
        request
            .get("/api/auth/")
            .end((err, res) => {
                if (err) {
                    return reject();
                }
                resolve(res.body);
            });
    });
};

export function searchPosts(page, query){

    if (!query) {
        return fetchPopularPosts(page);
    }
    return new Promise((resolve, reject) => {
        request
            .get('/api/search/')
            .query({
                page: page,
                q: query
            })
            .end((err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res.body); 
            });
    });
}


export function fetchLatestPosts(page) { 
    return fetchPosts(page, "id"); 
}

export function fetchPopularPosts(page) { 
    return fetchPosts(page, "score"); 
}

export function fetchPostsForUser(page, name) {
    return new Promise((resolve, reject) => {
        request
            .get('/api/user/' + name)
            .query({
                page: page,
                orderBy: 'score'
            })
            .end((err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res.body);
            });
    });
}
