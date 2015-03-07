var moment = require('moment'),
    _ = require('lodash'),
    validators = require('./src/js/validators');

const pageSize = 10;

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


module.exports = {
    index: function(req, res) {
        getPosts(req.db, 1, "score").then(function(posts) {
            res.reactify("/", {
                popularPosts: posts,
            });
        });
    },

    latest: function(req, res) {
        getPosts(req.db, 1, "id").then(function(posts) {
            res.reactify("/latest", {
                latestPosts: posts,
            });
        });
    },

    login: function(req, res) {
        res.reactify("/login");
    },

    submit: function(req, res) {
        res.reactify("/submit");
    },

    api: {

        auth: function (req, res) {
            return res.json(req.user);
        },

        login: function(req, res) {
            req.db("users")
                .where("name", req.body.identity)
                .orWhere("email", req.body.identity)
                .first().then(function(user) {
                    if (!user || user.password !== req.body.password) {
                        res.sendStatus(401);
                        return;
                    } 

                    var token = req.jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
                        expiresInMinutes: 60 * 24
                    });

                    res.json({
                        token: token,
                        user: user
                    });

                });
        },

        getPosts: function(req, res) {
            var page = parseInt(req.query.page || 1);
            getPosts(req.db, page, req.query.orderBy).then(function(posts) {
                res.json(posts);
            });
        },

        submitPost: function(req, res) {
            var title = req.body.title,
                url = req.body.url,
                errors = validators.newPost(title, url);

            if (!_.isEmpty(errors)) {
                return res.json(400, errors);
            }

            req.db("posts")
                .returning("id")
                .insert({
                    title: title,
                    url: url,
                    user_id: req.user.id,
                    created_at: moment.utc()
                }).then(function(ids) {
                    return req.db("posts").where("id", ids[0]).first()
                }).then(function(post) {
                    res.json(post);
                });
        },

        deletePost: function(req, res) {
            req.db("posts")
                .where({
                    id: req.params.id,
                    user_id: req.user.id
                }).del().then(function(){
                    res.sendStatus(200);
                });
        },

    }

};
