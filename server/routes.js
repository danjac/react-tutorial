import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import Immutable from 'immutable';
import {NewPost} from '../client/validators';
import {Signup} from './validators';
import * as errors from './errors';
import {authenticate, validates} from './middleware';

const pageSize = 10;

const jwtToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.SECRET_KEY, {
        expiresInMinutes: 60 * 24
    });
};

export default (app, db) => {

    const auth = authenticate(db);

    const getPosts = (page, orderBy, where) => {

        page = parseInt(page || 1);
        orderBy = ["score", "id"].includes(orderBy) ? orderBy : "id";

        const offset = ((page - 1) * pageSize);

        let result = {
            isFirst: (page === 1),
            page: page
        };

        let posts = db.select(
            'posts.id',
            'posts.title',
            'posts.url',
            'posts.score',
            'posts.created_at',
            'users.name AS author',
            'users.id AS author_id'
        )
        .from('posts')
        .innerJoin(
            'users',
            'users.id',
            'posts.user_id'
        );

        if (where) {
            posts = where(posts);
        }

        let counter = db("posts")
                        .count("posts.id")
                        .innerJoin(
                            'users',
                            'users.id',
                            'posts.user_id'
                        );
        if (where) {
            counter = where(counter);
        }

        return posts.orderBy(
            'posts.' + orderBy, 'desc'
        )
        .limit(pageSize)
        .offset(offset)
        .then((posts) => {
            result.posts = Immutable.List(posts);
            return counter.first();
        })
        .then((total) => {
            result.total = parseInt(total.count);
            const numPages = Math.ceil(result.total / pageSize);
            result.isLast = (!numPages || page === numPages);
            return result;
        });

    };

    const searchPosts = (page, orderBy, search) => {
        const q = "%" + (search || '') + "%";
        const where = (posts) => {
            return posts.where("users.name", "ilike", q)
                    .orWhere("title", "ilike", q);
        };
        return getPosts(page, orderBy, where);
    };
 
    const getPostsByUser = (page, orderBy, username) => {
        const where = (posts) => {
            return posts.where("user.name", username);
        };
        return getPosts(page, orderBy, where);
    };

    app.get("/", (req, res) =>  {
        getPosts(1, "score").then((result) => res.reactify("/", result));
    });

    app.get("/latest/", (req, res) =>  {
        getPosts(1, "id").then((result) => res.reactify("/latest", result));
    });

    app.get("/user/:name", (req, res) =>  {
        getPostsByUser(1, "score", req.params.name)
            .then((result) => {
                res.reactify("/user/" + req.params.name, result);
            });
    });

    app.get("/search", (req, res, next) => {
        searchPosts(1, "score", req.query.q)
            .then((result) => {
                res.reactify("/search/", result);
            }, (err) => next(err));
    });

    app.get("/login/", (req, res) =>  {
        res.reactify("/login");
    });

    app.get("/signup/", (req, res) =>  {
        res.reactify("/signup");
    });

    app.get("/submit/", (req, res) =>  {
        res.reactify("/submit");
    });

    app.get("/api/auth/", [auth], (req, res, next) => {
        db("posts")
            .where("user_id", req.user.id)
            .sum("score")
            .first()
            .then((result) => {
               req.user.totalScore = parseInt(result.sum || 0);
               res.json(req.user);
            }, (err) => next(err));
    });

    app.post("/api/login/", (req, res, next) =>  {
        const {identity, password} = req.body;
        let authUser = null;
        if (!identity || !password) {
            return res.sendStatus(400);
        }
        db("users")
            .where("name", identity)
            .orWhere("email", identity)
            .first()
            .then((user) => {
                authUser = user;

                if (!authUser || !bcrypt.compareSync(password, authUser.password)) {
                    throw new errors.NotAuthenticated("Invalid login credentials!");
                } 
                authUser = _.omit(authUser, "password");
                return db("posts")
                        .where("user_id", authUser.id)
                        .sum("score")
                        .first();
            })
            .then((result) => {
                
                authUser.totalScore = parseInt(result.sum || 0);

                res.json({
                    token: jwtToken(authUser.id),
                    user: authUser
                });

            }, (err) => next(err));
    });

    app.get("/api/posts/", (req, res, next) =>  {
        getPosts(req.query.page, req.query.orderBy)
            .then((result) => res.json(result), (err) => next(err));
    });

    app.get("/api/user/:name", (req, res, next) =>  {
        getPostsByUser(req.query.page, 
                       req.query.orderBy, 
                       req.params.name)
            .then((result) => res.json(result), 
                  (err) => next(err));
    });

    const vote = (req, res, next, amount) => {
        
        let status = 200;

        db.transaction((trx) => {

            db("posts")
                .transacting(trx)
                .where("id", req.params.id)
                .whereRaw("user_id != ?", [req.user.id])
                //.whereNot("user_id", req.id) -> add this post 0.7.5?
                .whereNotIn("id", req.user.votes)
                .increment('score', amount)
                .then((result) => {

                    if (result !== 1) {
                        status = 404;
                        return;
                    }

                    req.user.votes.push(req.params.id);

                    return db("users")
                        .transacting(trx)
                        .where("id", req.user.id)
                        .update({
                            votes: req.user.votes
                        });
                })
                .then(trx.commit, trx.rollback);

        })
        .then(() => res.sendStatus(status), (err) => next(err));
    };

    app.put("/api/upvote/:id", [auth], (req, res, next) => {
        vote(req, res, next, 1);
    });

    app.put("/api/downvote/:id", [auth], (req, res, next) => {
        vote(req, res, next, -1);
    });

    app.post("/api/submit/", [
        auth, 
        validates(NewPost)
    ], (req, res, next) =>  {

        db("posts")
            .returning(["id", "created_at"])
            .insert(_.assign(req.clean, {
                user_id: req.user.id
            }))
            .then((posts) => {
                let post = posts[0];
                res.json(_.assign(req.clean, {
                    id: post.id,
                    author: req.user.name,
                    author_id: req.user.id,
                    created_at: post.created_at
                }));
            }, (err) => next(err));
    });

    app.delete("/api/:id", [auth], (req, res, next) =>  {
        db("posts")
            .where({
                id: req.params.id,
                user_id: req.user.id
            })
            .del()
            .then((result) => {
                const status = result === 1 ? 200 : 404;
                res.sendStatus(status);
            }, (err) => next(err));
    });

    app.post("/api/signup/", [
        validates(Signup(db))
    ], (req, res, next) =>  {

        return db("users")
            .returning("id")
            .insert({
                name: req.clean.name,
                email: req.clean.email,
                password: bcrypt.hashSync(req.clean.password, 10)
            })
            .then((ids) => {
                const userId = ids[0];
                res.json({
                    token: jwtToken(userId),
                    user: {
                        id: userId,
                        name: req.clean.name,
                        email: req.clean.email,
                        totalScore: 0,
                        votes: [],
                        created_at: moment.utc()
                    }
                });
            }, (err) => next(err));
    });

    app.get("/api/search/", (req, res, next) => {
        searchPosts(req.query.page, 
                    req.query.orderBy, 
                    req.query.q)
            .then((result) => {
                res.json(result);
            }, (err) => next(err));
    });

};
