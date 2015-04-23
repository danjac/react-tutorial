import request from 'superagent';
import csrf from 'superagent-csrf';
import _ from 'lodash';
import Checkit from 'checkit';
import * as validators from './validators';


// csrf initialization
csrf(request);


const isUnique = (field, url) => {

    return (value) => {

        if (!value) {
            return false;
        }

        return new Promise((resolve, reject) => {
            request
            .get(url)
            .query({ [field]: value })
            .end((err, res) => {
                if (err) {
                  return reject(err);
                }
                if (res && res.body.exists) {
                    reject(new Checkit.ValidationError("The " + field + " field is already in use"));
                }
                resolve();
            });
        });
    };

};


const signupValidator = validators.signup(
        isUnique('name', '/isname'),
        isUnique('email', '/isemail')),
      postValidator = validators.newPost(true),
      loginValidator = validators.login();


const fetchPosts = (page, orderBy) => {

    return new Promise((resolve, reject) => {
        request
            .get('/posts/')
            .type('json')
            .accept('json')
            .query({
                page: page,
                orderBy: orderBy
            })
            .end((err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res.body.result);
            });
    });
};


export function voteUp(post) {
    return request
        .put("/auth/upvote/" + post.id)
        .csrf()
        .end();
}

export function voteDown(post) {
    return request
        .put("/auth/downvote/" + post.id)
        .csrf()
        .end();
}

export function signup(data) {
    return new Promise((resolve, reject) => {
        signupValidator
            .run(data)
            .then((clean) => {
                request
                    .post("/signup/")
                    .csrf()
                    .send(clean)
                    .end((err, res) => {
                        if (err) {
                            return reject(err);
                        }
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

export function deletePost(post) {
    return new Promise((resolve, reject) => {
        request
            .del("/auth/" + post.id)
            .csrf()
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
                    .post("/auth/submit/")
                    .csrf()
                    .send(clean)
                    .end((err, res) => {

                        if (err) {
                            if (res.badRequest) {
                                console.log("error", res.body);
                                return reject(res.body);
                            }
                            console.log(err);
                            return reject();
                        }
                        resolve(res.body);
                    });
            })
            .catch(Checkit.Error, (err) => {
                reject(err.toJSON());
            });
    });
}

export function login(data) {

    return new Promise((resolve, reject) => {
        loginValidator
            .run(data)
            .then((clean) => {
                request
                    .post('/login/')
                    .csrf()
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

}

export function searchPosts(page, query){

    if (!query) {
        return fetchPopularPosts(page);
    }
    return new Promise((resolve, reject) => {
        request
            .get('/search/')
            .type('json')
            .accept('json')
            .query({
                page: page,
                q: query
            })
            .end((err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res.body.result);
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
            .get('/user/' + name)
            .type('json')
            .accept('json')
            .query({
                page: page,
                orderBy: 'score'
            })
            .end((err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res.body.result);
            });
    });
}
