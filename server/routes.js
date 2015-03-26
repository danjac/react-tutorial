import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import Immutable from 'immutable';
import {authenticate} from './middleware';
import {User, Post} from './models';

const pageSize = 10;

const jwtToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.SECRET_KEY, {
        expiresInMinutes: 60 * 24
    });
};

export default (app) => {

    const auth = authenticate();

    app.get("/", (req, res, next) =>  {

        const result = {},
              page = parseInt(req.query.page || 1),
              offset = (page - 1) * pageSize;

        Post.find({})
            .populate('author', '_id name')
            .sort("-score")
            .limit(pageSize)
            .skip(offset)
            .exec()
            .then((posts) => {
                result.posts = posts;
                return Post.count().exec()
            })
            .then((total) => {

                const numPages = Math.ceil(total / pageSize);

                res.reactify("/", _.assign(result, {
                    numPages: numPages,
                    isFirst: (page === 1),
                    isLast: (page >= numPages),
                    total: total
                }));
            }, (err) => next(err));
    });

    app.get("/api/auth/", [auth], (req, res, next) => {
        res.json(req.user);
    });

    app.post("/api/login/", (req, res, next) =>  {

        const {identity, password} = req.body;

        if (!identity || !password) {
            return res.status(400).send("Missing login credentials");
        }

        User.findOne()
            .or([{ name: identity }, {email: identity}])
            .exec()
            .then((user) => {

                // tbd add as user method
                if (!user || !bcrypt.compareSync(password, authUser.password)) {
                    return res.status(401).send("Invalid login credentials");
                } 
                res.json({
                    token: jwtToken(user.id),
                    user: _.omit(user, 'password')
                });

            }, (err) => next(err));
    });

    app.post("/api/signup/", (req, res, next) =>  {

        // TBD: add this to 'pre' event for user model
        const data = _.assign(req.body, {
            password: bcrypt.hashSync(req.body.password, 10)
        });

        new User(data).save((err, user) => {
            if (err) {
                return next(err);
            }

            res.json({
                token: jwtToken(user.id),
                user: _.omit(user, 'password')
            });
        });

    });


    app.post("/api/submit/", [auth], (req, res, next) => {

        const data = _.assign(req.body, { author: req.user.id });
        new Post(data).save((err, post) => {
            if (err) {
                return next(err);
            }
            res.json(post);
        });

    });

    app.delete("/api/:id", [auth], (req, res, next) =>  {
        Post.findOneAndRemove({
            _id: req.params.id,
            author: req.user.id
        })
        .exec()
        .then(() => res.sendStatus(200),
              (err) => next(err));
    });


    /*
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
    */

    app.get("/login/", (req, res) =>  {
        res.reactify("/login");
    });

    app.get("/signup/", (req, res) =>  {
        res.reactify("/signup");
    });

    app.get("/submit/", (req, res) =>  {
        res.reactify("/submit");
    });

    /*

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

    app.get("/api/search/", (req, res, next) => {
        searchPosts(req.query.page, 
                    req.query.orderBy, 
                    req.query.q)
            .then((result) => {
                res.json(result);
            }, (err) => next(err));
    });
    */
};
