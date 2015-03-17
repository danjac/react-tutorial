import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import Immutable from 'immutable';
import * as validators from '../client/validators';
import * as errors from './errors';
import {authenticate, validate} from './middleware';

const pageSize = 10;

const jwtToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.SECRET_KEY, {
        expiresInMinutes: 60 * 24
    });
};

export default (app, db) => {

    const auth = authenticate(db);

    const nameExists = (name, resolve, reject) => {
        return db("users")
            .count("id")
            .where("name", name)
            .first()
            .then((result) => {
                if (parseInt(result.count) > 0){
                    reject("This username already exists!")
                } 
                resolve(name);
            });
    };

    const emailExists = (email, resolve, reject) => {
        return db("users")
            .count("id")
            .where("email", email)
            .first()
            .then((result) => {
                if (parseInt(result.count) > 0){
                    reject("This email address already exists!")
                }
                resolve(email);
            });
    };

    const signupValidator = new validators.Signup();

    signupValidator.validate("name", nameExists, {async: true});
    signupValidator.validate("email", emailExists, {async: true});

    const validateSignup = validate(signupValidator);
    const validateNewPost = validate(new validators.NewPost());

    const getPosts = (page, orderBy, username=null) => {

        page = page || 1;
        orderBy = ["score", "id"].includes(orderBy) ? orderBy : "id";

        const offset = ((page - 1) * pageSize);

        var result = {
            isFirst: (page === 1),
            page: page
        };

        var posts = db.select(
            'posts.id',
            'posts.title',
            'posts.url',
            'posts.score',
            'posts.created_at',
            'users.name AS author',
            'users.id AS author_id'
        )
        .from('posts').innerJoin(
            'users',
            'users.id',
            'posts.user_id'
        );

        if (username) {
            posts = posts.where("users.name", username);
        }

        return posts.orderBy(
            'posts.' + orderBy, 'desc'
        )
        .limit(pageSize).offset(offset).then((posts) => {
            return posts;
        })
        .then((posts) => {
            result.posts = Immutable.List(posts);
            var q = db("posts").count("posts.id");
            if (username) {
                q = q.innerJoin(
                        'users',
                        'users.id',
                        'posts.user_id'
                    ).where("users.name", username)
            }
            return q.first();
        })
        .then((total) => {
            result.total = parseInt(total.count);
            const numPages = Math.ceil(result.total / pageSize);
            result.isLast = (!numPages || page === numPages);
            return result;
        });

    };

    app.get("/", (req, res) =>  {
        getPosts(1, "score").then((result) => res.reactify("/", result));
    });

    app.get("/latest/", (req, res) =>  {
        getPosts(1, "id").then((result) => res.reactify("/latest", result));
    });

    app.get("/user/:name", (req, res) =>  {
        getPosts(1, "score", req.params.name)
            .then((result) => {
                res.reactify("/user/" + req.params.name, result);
            });
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

    app.get("/api/auth/", [auth], (req, res) => {
        return res.json(req.user);
    });

    app.post("/api/login/", (req, res, next) =>  {
        const {identity, password} = req.body;
        if (!identity || !password) {
            return res.sendStatus(400);
        }
        db("users")
            .where("name", identity)
            .orWhere("email", identity)
            .first()
            .then((user) => {
                if (!user || !bcrypt.compareSync(password, user.password)) {
                    return res.sendStatus(401);
                } 
                res.json({
                    token: jwtToken(user.id),
                    user: _.omit(user, 'password')
                });

            }, (err) => next(err));
    });

    app.get("/api/posts/", (req, res, next) =>  {
        const page = parseInt(req.query.page || 1);
        getPosts(page, req.query.orderBy)
            .then((result) => res.json(result), (err) => next(err));
    });

    app.get("/api/user/:name", (req, res, next) =>  {
        const page = parseInt(req.query.page || 1);
        getPosts(page, req.query.orderBy, req.params.name)
            .then((result) => res.json(result), (err) => next(err));
    });

    const vote = (req, res, next, amount) => {

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
                        throw new errors.NotAllowed("You cannot vote on this post!");
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
        .then(() => res.sendStatus(200), (err) => next(err));
    };

    app.put("/api/upvote/:id", [auth], (req, res, next) => {
        vote(req, res, next, 1);
    });

    app.put("/api/downvote/:id", [auth], (req, res, next) => {
        vote(req, res, next, -1);
    });

    app.post("/api/submit/", [auth, validateNewPost], (req, res, next) =>  {

        let {title: title, url: url} = req.clean;

        db("posts")
            .returning("id")
            .insert({
                title: title,
                url: url,
                user_id: req.user.id
            })
            .then((ids) => {
                res.json({
                    id: ids[0],
                    title: title,
                    url: url,
                    author: req.user.name,
                    author_id: req.user.id,
                    created_at: moment.utc()
                });
            }, (err) => next(err));
    });

    app.delete("/api/:id", [auth], (req, res, next) =>  {
        db("posts")
            .where({
                id: req.params.id,
                user_id: req.user.id
            })
            .del().then((result) => {
                const status = result === 1 ? 200 : 403;
                res.sendStatus(status);
                }, (err) => next(err));
    });

    app.post("/api/signup/", [validateSignup], (req, res, next) =>  {

        let {name: name, email: email, password: password} = req.clean;

        return db("users")
            .returning("id")
            .insert({
                name: name,
                email: email,
                password: bcrypt.hashSync(password, 10)
        })
        .then((ids) => {
            const userId = ids[0];
            res.json({
                token: jwtToken(userId),
                user: {
                    id: userId,
                    name: name,
                    email: email,
                    created_at: moment.utc()
                }
            });
        }, (err) => next(err));
    });

};
