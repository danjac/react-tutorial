var moment = require('moment'),
    jwt = require('jsonwebtoken'),
    _ = require('lodash'),
    {auth} = require('./middleware'),
    validators = require('./src/js/validators');

const pageSize = 10;

var authenticate = function(db) {
    return function(req, res, next) {
        var unauthenticated = function() {
            if (required) {
                return res.sendStatus(401);
            } 
            return next();
        }

        if (!req.authToken) {
            return unauthenticated();
        }
        db("users")
            .where("id", req.authToken.id)
            .first().then(function(user) {
                if (!user) {
                    return unauthenticated();
                }
                req.user = user;
                next();
            });
    };
};


var getPosts = function(db, page, orderBy){
    // tbd: return a total count of posts
    // { posts: posts, total: total }
    // return as promise

    page = page || 1;
    orderBy = ["score", "id"].includes(orderBy) ? orderBy : "id";

    var offset = ((page - 1) * pageSize);

    return db.select(
        'posts.id',
        'posts.title',
        'posts.url',
        'posts.score',
        'users.name AS author',
        'users.id AS author_id'
    ).from('posts').innerJoin(
        'users',
        'users.id',
        'posts.user_id'
    ).orderBy(
        'posts.' + orderBy, 'desc'
    ).limit(pageSize).offset(offset);
};


module.exports = function(app, db) {

    var auth = authenticate(db);

    app.get("/", function(req, res) {
        getPosts(db, 1, "score").then(function(posts) {
            res.reactify("/", {
                popularPosts: posts,
            });
        });
    });

    app.get("/latest/", function(req, res) {
        getPosts(db, 1, "id").then(function(posts) {
            res.reactify("/latest", {
                latestPosts: posts,
            });
        });
    });

    app.get("/login/", function(req, res) {
        res.reactify("/login");
    });

    app.get("/submit/", function(req, res) {
        res.reactify("/submit");
    });

    app.get("/api/auth/", [auth], function (req, res) {
            return res.json(req.user);
    });

    app.post("/api/login/", function(req, res) {
        db("users")
            .where("name", req.body.identity)
            .orWhere("email", req.body.identity)
            .first().then(function(user) {
                if (!user || user.password !== req.body.password) {
                    res.sendStatus(401);
                    return;
                } 

                var token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
                    expiresInMinutes: 60 * 24
                });

                res.json({
                    token: token,
                    user: user
                });

            });
    });

    app.get("/api/posts/", function(req, res) {
        var page = parseInt(req.query.page || 1);
        getPosts(db, page, req.query.orderBy).then(function(posts) {
            res.json(posts);
        });
    });

    app.post("/api/submit/", [auth], function(req, res) {
        var title = req.body.title,
            url = req.body.url,
            errors = validators.newPost(title, url);

        if (!_.isEmpty(errors)) {
            return res.json(400, errors);
        }

        db("posts")
            .returning("id")
            .insert({
                title: title,
                url: url,
                user_id: req.user.id,
                created_at: moment.utc()
            }).then(function(ids) {
                return db("posts").where("id", ids[0]).first();
            }).then(function(post) {
                res.json(post);
            });
    });

    app.delete("/api/:id", [auth], function(req, res) {
        db("posts")
            .where({
                id: req.params.id,
                user_id: req.user.id
            }).del().then(function(){
                res.sendStatus(200);
            });
    });

};
