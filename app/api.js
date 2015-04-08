import request from 'superagent';
import _ from 'lodash';
import Checkit from 'checkit';
import * as validators from './validators';


class TokenStore {

    constructor() {
        this.name  = "authToken";
    }

    get empty() {
        return this.token === null;
    }

    get token() {
        return window.localStorage.getItem(this.name);
    }

    set token(token) {
        window.localStorage.setItem(this.name, token);
    }

    get bearer() {

        return (request) => {
            if (this.empty) {
                return request;
            }
            request.set('Authorization', 'Bearer ' + this.token);
            return request;
        }
    }

    clear() {
        window.localStorage.removeItem(this.name);
    }

}

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
                if (res.body.exists) {
                    reject(new Checkit.ValidationError("The " + field + " field is already in use"));
                }
                resolve();
            });
        });
    };

};

validators.Signup.name.push(isUnique('name', '/api/isname'));
validators.Signup.email.push(isUnique('email', '/api/isemail'));


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


const tokenStore = new TokenStore(),
      bearer = tokenStore.bearer;


export function voteUp(post) {
    return request
        .put("/api/auth/upvote/" + post._id)
        .use(tokenStore.bearer)
        .end();
}

export function voteDown(post) {
    return request
        .put("/api/auth/downvote/" + post._id)
        .use(tokenStore.bearer)
        .end();
}

export function signup(data) {
    return new Promise((resolve, reject) => {
        Checkit(validators.Signup).run(data)
        .then((clean) => {
            request
                .post("/api/signup/")
                .send(clean)
                .end((err, res) => {
                    if (res.badRequest) {
                        return reject(res.body);
                    }
                    tokenStore.token = res.body.token;
                    resolve(res.body.user);
                  });
        })
        .catch(Checkit.Error, (err) => {
            reject(err.toJSON());
        });
    });
}

export function deletePost(post)  {
    return new Promise((resolve, reject) => {
        request
            .del("/api/auth/" + post._id)
            .use(tokenStore.bearer)
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
        Checkit(validators.NewPost)
            .run(data)
            .then((clean) => {
                //actions.startLoading()
                request
                    .post("/api/auth/submit/")
                    .use(tokenStore.bearer)
                    .send(clean)
                    .end((err, res) => {
                        //actions.endLoading()

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
    tokenStore.clear();
};

export function login(data) {

    return new Promise((resolve, reject) => {
        Checkit(validators.Login)
            .run(data)
            .then((clean) => {
                //actions.startLoading()
                request
                    .post('/api/login/')
                    .send(clean)
                    .end((err, res) => {
                        //actions.endLoading()
                        if (err) {
                            return reject();
                        }
                        tokenStore.token = res.body.token;
                        resolve(res.body.user);
                    });
            })
            .catch(Checkit.Error, (err) => {
                reject(err.toJSON());
            });
    });

};

export function getUser() {
    return new Promise((resolve, reject) => {
        if (tokenStore.empty){
            return reject();
        };
        request
            .get("/api/auth/")
            .use(tokenStore.bearer)
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
