import jwt from 'jsonwebtoken';
import _ from 'lodash';
import {auth} from './middleware';
import {User, Post} from './models';

const pageSize = 10;

const jwtToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.SECRET_KEY, {
        expiresInMinutes: 60 * 24
    });
};

const vote = (req, res, next, amount) => {

    Post.findById(req.params.id)
        .populate('author')
        .exec()
        .then((post) => {

            if (!post) {
                return res.sendStatus(404);
            }

            if (post.author._id === req.user._id || 
                req.user.votes.includes(post._id)) {
                return res.sendStatus(403);
            }

            req.user.votes.push(post._id);

            return Promise.all([

                post.update({
                    score: post.score + amount
                }).exec(),

                post.author.update({
                    totalScore: post.author.totalScore + amount
                }).exec(),

                req.user.save()

            ])
            .then(() => res.sendStatus(200),
                  (err) => next(err));
            
        });
};

const getPosts = (page, orderBy, where) => {
    const result = {},
          page = parseInt(page, 10) || 1,
          orderBy = ["score", "created"].includes(orderBy) ? orderBy : "created",
          offset = (page * pageSize) - pageSize,
          q = Post.find(where || {});

    return q.populate('author', '_id name')
        .sort("-" + orderBy)
        .limit(pageSize)
        .skip(offset)
        .exec()
        .then((posts) => {
            result.posts = posts;
            return q.count()
        })
        .then((total) => {

            const numPages = Math.ceil(total / pageSize);

            return _.assign(result, {
                numPages: numPages,
                isFirst: (page === 1),
                isLast: (page >= numPages),
                total: total
            });
        });
};

const searchPosts = (page, orderBy, q) => {
    return getPosts(page, orderBy, { title: new RegExp(q, "i") });
};


export default (app) => {

    app.get("/api/auth/", [auth], (req, res, next) => {
        res.json(req.user);
    });

    app.post("/api/login/", (req, res, next) =>  {

        const badResult = () => res.status(400).send("Invalid login credentials");

        const {identity, password} = req.body;

        if (!identity || !password) {
            return badResult();
        }

        User.authenticate(identity, password)
            .then((user) => {

                if (!user) {
                    return badResult();
                }

                res.json({
                    token: jwtToken(user._id),
                    user: user
                });

            }, (err) => next(err));
    });

    app.post("/api/signup/", (req, res, next) =>  {

        new User(req.body)
            .save()
            .then((user) => {
                res.json({
                    token: jwtToken(user._id),
                    user: user
                });
            }, (err) => next(err));

    });

    app.post("/api/submit/", [auth], (req, res, next) => {

        new Post(_.assign(req.body, { 
                author: req.user.id 
            }))
            .save()
            .then((post) => res.json(post),
                  (err) => next(err))
    });

    app.delete("/api/:id", [auth], (req, res, next) =>  {
        Post.findOneAndRemove({
            _id: req.params.id,
            author: req.user.id
        })
        .exec()
        .then((post) => {
            if (!post) {
                return res.sendStatus(404);
            }
            return req.user.update({
                totalScore: req.user.totalScore - post.score
            }).exec();
        })
        .then(() => res.sendStatus(200),
              (err) => next(err));
    });

    app.get("/api/search", (req, res, next) => {

        searchPosts(req.query.page,
                    req.query.orderBy,
                    req.query.q)
        .then((result) => res.json(result),
              (err) => next(err));

    });

    app.get("/api/posts/", (req, res, next) =>  {
        getPosts(req.query.page, req.query.orderBy)
            .then((result) => res.json(result), 
                  (err) => next(err));
    });

    app.get("/api/user/:name", (req, res, next) =>  {
        User.findOne()
            .where("name", req.params.name)
            .exec()
            .then((user) => {
                if (!user) {
                    return res.sendStatus(404);
                }
            
                return getPosts(req.query.page, 
                                req.query.orderBy, 
                                {author: user._id});
            })
            .then((result) => res.json(result),
                  (err) => next(err));
    });

    app.put("/api/upvote/:id", [auth], (req, res, next) => {
        vote(req, res, next, 1);
    });

    app.put("/api/downvote/:id", [auth], (req, res, next) => {
        vote(req, res, next, -1);
    });

    app.get("/*", (req, res, next) =>  {
        res.render("index");
    });



};
