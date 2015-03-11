var moment = require('moment'),
    jwt = require('jsonwebtoken'),
    _ = require('lodash'),
    bcrypt = require('bcryptjs'),
    Immutable = require('immutable'),
    validators = require('../client/validators');

const pageSize = 10;

var jwtToken = function(userId){
    return jwt.sign({ id: userId }, process.env.SECRET_KEY, {
        expiresInMinutes: 60 * 24
    });
};


module.exports = function(app, db) {

    var auth = function(req, res, next) {

        var unauthenticated = function() {
            return res.sendStatus(401);
        }

        if (!req.authToken) {
            return unauthenticated();
        }
        db("users")
            .where("id", req.authToken.id)
            .first("id", "name", "email")
            .then(function(user) {
                if (!user) {
                    return unauthenticated();
                }
                req.user = user;
                next();
            });
    };

    var getPosts = function(page, orderBy, username=null){

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
        }).then(function(total) {
            result.total = parseInt(total.count);
            var numPages = Math.ceil(result.total / pageSize);
            result.isLast = (!numPages || page == numPages);
            return result;
        });

        return posts;

    };

    app.get("/", function(req, res) {
        getPosts(1, "score").then(function(result) {
            res.reactify("/", result);
        });
    });

    app.get("/latest/", function(req, res) {
        getPosts(1, "id").then(function(result) {
            res.reactify("/latest", result);
        });
    });

    app.get("/user/:name", function(req, res) {
        getPosts(1, "score", req.params.name).then(function(result) {
            res.reactify("/user/" + req.params.name, result);
        });
    });

    app.get("/login/", function(req, res) {
        res.reactify("/login");
    });

    app.get("/signup/", function(req, res) {
        res.reactify("/signup");
    });

    app.get("/submit/", function(req, res) {
        res.reactify("/submit");
    });

    app.get("/api/auth/", [auth], function (req, res) {
        return res.json(req.user);
    });

    app.post("/api/login/", function(req, res) {
        var {identity, password} = req.body;
        if (!identity || !password) {
            return res.sendStatus(400);
        }
        db("users")
            .where("name", identity)
            .orWhere("email", identity)
            .first()
            .then(function(user) {
                // we'll encrypt this password later of course!
                if (!user || !bcrypt.compareSync(password, user.password)) {
                    res.sendStatus(401);
                    return;
                } 
                res.json({
                    token: jwtToken(user.id),
                    user: _.omit(user, 'password')
                });

            });
    });

    app.get("/api/posts/", function(req, res) {
        var page = parseInt(req.query.page || 1);
        getPosts(page, req.query.orderBy).then(function(result) {
            res.json(result);
        });
    });

    app.get("/api/user/:name", function(req, res) {
        var page = parseInt(req.query.page || 1);
        getPosts(page, req.query.orderBy, req.params.name)
            .then(function(result) {
                res.json(result);
            });
    });

    app.post("/api/submit/", [auth], function(req, res) {
        var title = req.body.title,
            url = req.body.url,
            errors = validators.newPost(title, url);

        if (!_.isEmpty(errors)) {
            return res.status(400).json(errors);
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

    var nameExists = function(name) {
        return db("users")
            .count("id")
            .where("name", name)
            .first()
            .then(function(result){
                return parseInt(result.count) > 0;
            });
    };

    var emailExists = function(email) {
        return db("users")
            .count("id")
            .where("email", email)
            .first()
            .then(function(result){
                return parseInt(result.count) > 0;
            });
    };

    app.get("/api/nameexists/", function(req, res) {
        if (!req.query.name) {
            return res.sendStatus(400);
        }
        nameExists(req.query.name).then(function(exists) {
            res.json({ exists: exists });
        });
    });

    app.get("/api/emailexists/", function(req, res) {
        if (!req.query.email) {
            return res.sendStatus(400);
        }
        emailExists(req.query.email).then(function(exists) {
            res.json({ exists: exists });
        });
    });

    app.post("/api/signup/", function(req, res) {

        var {name, email, password} = req.body;

        validators.signup(
            name,
            email, 
            password,
            nameExists,
            emailExists
        ).then(function(errors) {
            if (!_.isEmpty(errors)) {
                return res.status(400).json(errors);
            }
            return db("users")
                .returning("id")
                .insert({
                    name: name,
                    email: email,
                    created_at: moment.utc(),
                    password: bcrypt.hashSync(password, 10)
            }).then(function(ids) {
                return db("users")
                    .where("id", ids[0])
                    .first("id", "name", "email");
            }).then(function(user) {
                return res.json({
                    token: jwtToken(user.id),
                    user: user
                });
            });
        });
    });


};
