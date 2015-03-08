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


var getPosts = function(db, page, orderBy, username=null){
    // tbd: return a total count of posts
    // { posts: posts, total: total }
    // return as promise

    page = page || 1;
    orderBy = ["score", "id"].includes(orderBy) ? orderBy : "id";

    var offset = ((page - 1) * pageSize);

    var result = {
        isFirst: (page === 1)
    };

    var posts = db.select(
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
    );

    if (username) {
        posts = posts.where("users.name", username);
    }

    posts = posts.orderBy(
        'posts.' + orderBy, 'desc'
    ).limit(pageSize).offset(offset).then(function(posts) {
        return posts;
    }).then(function(posts) {
        result.posts = posts;
        var total = db("posts").count("id");
        if (username) {
            total = total.where("users.name", username);
        }
        return total.first();
    }).then(function(total) {
        result.total = parseInt(total.count);
        var numPages = Math.ceil(result.total / pageSize);
        result.isLast = page == numPages;
        return result;
    });

    return posts;

};


module.exports = function(app, db) {

    var auth = authenticate(db);

    app.get("/", function(req, res) {
        getPosts(db, 1, "score").then(function(result) {
            res.reactify("/", result);
        });
    });

    app.get("/latest/", function(req, res) {
        getPosts(db, 1, "id").then(function(result) {
            res.reactify("/latest", result);
        });
    });

    app.get("/user/:name", function(req, res) {
        getPosts(db, 1, "score", req.params.name).then(function(result) {
            res.reactify("/user/" + req.params.name, result);
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
                // we'll encrypt this password later of course!
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
        getPosts(db, page, req.query.orderBy).then(function(result) {
            res.json(result);
        });
    });

    app.get("/api/user/:name", function(req, res) {
        var page = parseInt(req.query.page || 1);
        getPosts(db, page, req.query.orderBy, req.params.name)
            .then(function(result) {
                res.json(result);
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
