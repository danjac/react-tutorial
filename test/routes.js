import request from 'supertest';
import koa from 'koa';
import co from 'co';
import body from 'koa-body';
import error from 'koa-error-handler';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ClearDB from 'mocha-mongoose';
import {expect} from 'chai';

import routes from '../config/routes';
import Post from '../lib/models/Post';
import User from '../lib/models/User';

dotenv.load();

const ObjectId = mongoose.Types.ObjectId;
const dbUri = 'mongodb://localhost/react-tutorial-test';

const clearDB = new ClearDB(dbUri);

const app = koa();

app.on('error', (err) => {
    throw err;
});

const req = request.agent(app.listen());

app.use(body());

// fake jwt
//
app.use(function*(next) {
    const userId = this.request.headers.authtoken;
    if (userId) {
        this.authToken = {id: userId};
    }
    yield next;
});

//app.set('views', __dirname + '/../server/views')
//app.set('view engine', 'ejs')
//app.use(reactify(jsxRoutes))

error(app);
routes(app);

const createPost = function*() {

    const user = yield new User({
            name: 'testuser10',
            email: 'teste10r@gmail.com',
            password: 'testpass'
        })
        .save();


    const post = yield new Post({
                title: 'testing something',
                url: 'http://test',
                author: user._id,
                image: 'test.jpg'
            })
            .save();


    return [post, user];
};


describe("DELETE /api/delete", function() {

    let post, user;

    before((done) => {
        if (mongoose.connection.db) {
            return done();
        }
        mongoose.connect(dbUri, done);
    });

    before((done) => {
        clearDB(done);
    });

    before(co.wrap(function* () {
        [post, user] = yield createPost();
    }));

    it('should return a 404 if no user is authenticated', (done) => {
        req
            .delete('/api/auth/' + post._id)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    throw err;
                }
                done();
            });
    });

    it('should return a 404 if no post exists', (done) => {
        req
            .delete('/api/auth/' + new ObjectId())
            .set('authToken', user._id)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    throw err;
                }
                done();
            });
    });

    it('should not delete the post if the post does not belong to the user', co.wrap(function*(done) {
        const other = yield new User({
                name: 'testuser10',
                email: 'teste10r@gmail.com',
                password: 'testpass'
            })
            .save();

        req
            .delete('/api/auth/' + post._id)
            .set('authToken', other._id)
            .expect(404)
            .end(function*(err, res) {
                if (err) {
                    throw err;
                }
                const numPosts = yield Post.count();
                expect(numPosts).to.equal(1);
                done();
            });

    }));

    it('should delete the post if the post belongs to the user', co.wrap(function*(done) {

        req
            .delete('/api/auth/' + post._id)
            .set('authToken', user._id)
            .expect(200)
            .end(function*(err, res) {
                if (err) {
                    throw err;
                }
                const numPosts = yield Post.count();
                expect(numPosts).to.equal(0);
                done();
            });

    }));


});


describe("GET /api/auth", () => {
    it('should return a 401 if no user is authenticated', (done) => {
        done();
    });

    it('should return a 401 if no valid user matches token', (done) => {
        done();
    });

    it('should return some JSON if valid user matches token', (done) => {
        done();
    });

});

describe("PUT /api/upvote", function() {
    it('should not allow upvote if not logged in', (done) => {
        done();
	});

    it('should not allow upvote if post does not exist', (done) => {

        done();
	});

    it('should allow upvote if post does not belong to user', (done) => {

        done();

	});

    it('should not allow upvote if post belongs to user', (done) => {

        done();

	});


    it('should not allow upvote if post if user has already voted', (done) => {

        done();

	});


});

describe("POST /api/submit", function() {


    it('should not allow posting if user not authenticated', (done) => {
        done();
	});

    it('should return errors if missing data', (done) => {
        done();
    });

    it('should allow posting if legit user', (done) => {
        done();
    });

});

describe("GET /api/posts/", function() {

	it('should render a list of posts by score', (done) => {
        done();
    });

	it('should render a list of posts by id', (done) => {
        done();
    });

});
