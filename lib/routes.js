import router from 'koa-router';
import mount from 'koa-mount';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import {User, Post} from './models';

const pageSize = 20;

const jwtToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.SECRET_KEY, {
        expiresInMinutes: 60 * 24
    });
};

function* authenticate(next) {
    if (!this.authToken || !this.authToken.id) {
        this.throw(401, "No auth token provided");
    }
    this.state.user = yield User
        .findById(this.authToken.id)
        .exec();
    if (!this.state.user) {
        this.throw(401, "Invalid user ID");
    }
    yield next;
};


const vote = function*(route, amount) {

    const user = route.state.user;

    const post = yield Post
        .findById(route.params.id)
        .populate('author')
        .exec();

    if (!post) {
        route.throw(404, "No post found");
    }

    if (post.author._id === user._id ||
        user.votes.includes(post._id)) {
        route.throw(403, "You can't vote on this post");
    }

    user.votes.push(post._id)

    route.status = 200;

    return Promise.all([

        post.update({
            score: post.score + amount
        }).exec(),

        post.author.update({
            totalScore: post.author.totalScore + amount
        }).exec(),

        user.update({
            votes: user.votes
        }).exec()

    ]);
}

const getPosts = function*(page, orderBy, where) {

    const result = {},
          offset = (page * pageSize) - pageSize;

    page = parseInt(page, 10) || 1;
    orderBy = ["score", "created"].includes(orderBy) ? orderBy : "created";

    where = where || {}

    result.total = yield Post.find(where).count();

    const numPages = Math.ceil(result.total / pageSize);

    result.isFirst = (page === 1);
    result.isLast = (page === numPages);

    result.posts = yield Post
        .find(where)
        .populate('author', '_id name')
        .sort("-" + orderBy)
        .limit(pageSize)
        .skip(offset)
        .exec();

    return result;
};


export default (app) => {

    // AUTHENTICATION REQUIRED
    //
    //

    const auth = new router().use(authenticate);

    auth.post("/submit/", function*() {

        const user = this.state.user;

        yield new Post(
            _.assign(this.request.body, {
                author: user
            }))
            .save();

        yield user
            .update({ 
                totalScore: user.totalScore + 1 
            });

        this.status = 204;

    });


    auth.put("/upvote/:id", function*() {
        yield vote(this, 1);
    });

    auth.put("/downvote/:id", function*() {
        yield vote(this, -1);
    });

    auth.delete("/:id", function*() {

        const user = this.state.user;

        const post = yield Post
            .findOneAndRemove({
                _id: this.params.id,
                author: user._id
            })
            .exec();

        if (!post) {
            throw(404, "Post not found");
        }

        yield user.update({
            totalScore: user.totalScore - post.score
        });

        this.status = 204;
    });

    auth.get("/", function*() {
        this.body = this.state.user;
    });

    const api = new router();

    api.get("/posts/", function*() {
        this.body = yield getPosts(this.request.query.page,
                                   this.request.query.orderBy);
    });

    api.post("/login/", function*() {

        const badResult = () => {
            this.throw(400, "Invalid login credentials");
        };

        const {identity, password} = this.request.body

        if (!identity || !password) {
            badResult();
        }

        const user = yield User.authenticate(identity, password);

        if (!user) {
            badResult();
        }

        this.body = {
            token: jwtToken(user._id),
            user: user
        };

        this.status = 204;

    });

    api.post("/signup/", function*() {

        const user = yield User(this.request.body)
            .save();

        this.body = {
            token: jwtToken(user._id),
            user: user
        };

        this.status = 204;

    });

    api.get("/search/", function*(){

        this.body = yield getPosts(this.request.query.page,
                                   this.request.query.orderBy,
                                   {
                                        title: new RegExp(this.request.query.q, "i")
                                   });
    });

    api.get("/user/:name", function*(){

        const user = yield User
            .findOne()
            .where("name", this.params.name)
            .exec();

        if (!user) {
            this.throw(404, "No user found");
        }

        this.body = yield getPosts(this.request.query.page,
                                   this.request.query.orderBy,
                                   {
                                       author: user._id
                                   });

    });

    const main = new router();

    const index = function*() { yield this.render('index'); };

    main.get('/:path', index);
    main.get('/', index);
    
    app.use(mount('/api/auth', auth.routes()));
    app.use(mount('/api', api.routes()));
    app.use(mount('/', main.routes()));

};
