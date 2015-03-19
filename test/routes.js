import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';
import methodOverride from 'method-override';
import knex from 'knex';
import expressJwt from 'express-jwt';
import {expect} from 'chai';

import jsxRoutes from '../client/Routes';
import {reactify} from '../server/middleware';
import routes, {jwtToken} from '../server/routes';

dotenv.load();

const config = {

    database: {
	 	client: 'pg',
	    debug: false,
	    connection: {
	        user: process.env.DB_USER,
	        password: process.env.DB_PASSWORD,
	        database: "test_" + process.env.DB_NAME
	    }
    },

    pool: {
        min: 1,
        max: 1
    },

    directory: './migrations',
    tableName: 'knex_migrations'

};

const db = knex.initialize(config.database);

const truncateAll = () => {
    let calls = ["users", "posts"].map((table) => {
        return db.raw('TRUNCATE TABLE ' + table + ' CASCADE');
    });
    return Promise.all(calls);
};

const migrate = () => {
    return db.migrate.latest(config);
};

const app = express();

app.use(bodyParser.json());
app.use(methodOverride());

// fake jwt
//
app.use((req, res, next) => {
    var userId = req.header('authToken');
    if (userId) {
        req.authToken = {id: userId};
    }
    next();
});

//app.set('views', __dirname + '/../server/views');
//app.set('view engine', 'ejs');
//app.use(reactify(jsxRoutes));

routes(app, db);

describe("DELETE /api/delete", () => {

    before((done) => {
        migrate().then(() => done());
    });

    beforeEach((done) => {
        truncateAll().then(() => done());
    });

    it('should return a 401 if no user is authenticated', (done) => {

        request(app)
            .del("/api/1")
            .expect(401, done);
    });

    it('should return a 404 if no post exists', (done) => {

        db("users")
			.returning("id")
			.insert({
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"})
		.then((ids) => {
            let userId = parseInt(ids[0]);
            return request(app)
                .del('/api/1')
                .set('authToken', userId)
                .expect(404, done);
        });

    });

    it('should return a 404 if post does not belong to user', (done) => {

        let userId = null;

        db("users")
			.returning("id")
			.insert([{
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"
            }, {
				name: "tester22",
				password: "tester",
				email: "tester2@gmail.com"
            }])
            .then((ids) => {
                userId = parseInt(ids[0]);
                let otherId = ids[1];
                return db("posts")
                    .returning("id")
                    .insert({
                        title: "test",
                        url: "http://",
                        user_id: otherId
                    });
            })
            .then((ids) => {
                let postId = ids[0];
                return request(app)	
                    .delete("/api/" + postId)
                    .set('authToken', userId)
                    .expect(404)
                        .end(() => {
                            db("posts")
                                .count("id")
                                .first()
                                .then((result) => {
                                    expect(parseInt(result.count)).to.equal(1);
                                    done();
                                });
                        });
            });
    });

    it('should delete the post if the post belongs to the user', (done) => {

        let userId = null;

        db("users")
			.returning("id")
			.insert({
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"
            })
            .then((ids) => {
                userId = parseInt(ids[0]);
                return db("posts")
                    .returning("id")
                    .insert({
                        title: "test",
                        url: "http://",
                        user_id: userId
                    });
            })
            .then((ids) => {
                let postId = ids[0];
                return request(app)	
                    .delete("/api/" + postId)
                    .set('authToken', userId)
                    .expect(200)
                        .end(() => {
                            db("posts")
                                .count("id")
                                .first()
                                .then((result) => {
                                    expect(parseInt(result.count)).to.equal(0);
                                    done();
                                });
                        });
            });
    });


});


describe("GET /api/auth", () =>  {

    before((done) => {
        migrate().then(() => done());
    });

    beforeEach((done) => {
        truncateAll().then(() => done());
    });

    it('should return a 401 if no user is authenticated', (done) => {
        request(app)
            .get("/api/auth/")
            .expect(401, done);
    });

    it('should return a 401 if no valid user matches token', (done) => {
        request(app)
            .get('/api/auth/')
            .set('authToken', '4')
            .expect(401, done);
    });

    it('should return some JSON if valid user matches token', (done) => {
        db("users")
			.returning("id")
			.insert({
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"})
		.then((ids) => {
            let userId = parseInt(ids[0]);
            request(app)
                .get('/api/auth/')
                .set('authToken', ids)
                .expect((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.id).to.equal(userId);
                    expect(res.body.totalScore).to.equal(0);
                    expect(res.body.name).to.equal("tester");
                    expect(res.body.email).to.equal("tester@gmail.com");
                }).end(done);
        });
    });
    
});

describe("PUT /api/upvote", function() {
    before((done) => {
        migrate().then(() => done());
    });

    beforeEach((done) => {
        truncateAll().then(() => done());
    });
    
    it('should not allow upvote if not logged in', (done) => {
        request(app)	
            .put("/api/upvote/1")
            .expect(401, done);
	});

    it('should not allow upvote if post does not exist', (done) => {
        db("users")
			.returning("id")
			.insert({
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"})
		.then((ids) => {
            let userId = parseInt(ids[0]);
            return request(app)	
                .put("/api/upvote/1")
                .set('authToken', userId)
                .expect(404, done);
        });

	});

    it('should allow upvote if post does not belong to user', (done) => {

        let userId = null;

        db("users")
			.returning("id")
			.insert([{
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"
            }, {
				name: "tester22",
				password: "tester",
				email: "tester2@gmail.com"
            }])
            .then((ids) => {
                userId = parseInt(ids[0]);
                let otherId = ids[1];
                return db("posts")
                    .returning("id")
                    .insert({
                        title: "test",
                        url: "http://",
                        user_id: otherId
                    });
            })
            .then((ids) => {
                let postId = ids[0];
                return request(app)	
                    .put("/api/upvote/" + postId)
                    .set('authToken', userId)
                    .expect(200)
                    .end(() => {
                        db("posts").first()
                            .then((post) => {
                                expect(post.score).to.equal(2);
                                done();
                            });
                    });

            });


	});

    it('should not allow upvote if post belongs to user', (done) => {

        let userId = null;

        db("users")
			.returning("id")
			.insert({
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"
            })
            .then((ids) => {
                userId = parseInt(ids[0]);
                return db("posts")
                    .returning("id")
                    .insert({
                        title: "test",
                        url: "http://",
                        user_id: userId
                    });
            })
            .then((ids) => {
                let postId = ids[0];
                return request(app)	
                    .put("/api/upvote/" + postId)
                    .set('authToken', userId)
                    .expect(404, done);
            });

	});


    it('should not allow upvote if post if user has already voted', (done) => {

        let userId, postId;

        db("users")
			.returning("id")
			.insert([{
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"
            }, {
				name: "tester22",
				password: "tester",
				email: "tester2@gmail.com"
            }])
            .then((ids) => {
                userId = parseInt(ids[0]);
                let otherId = ids[1];
                return db("posts")
                    .returning("id")
                    .insert({
                        title: "test",
                        url: "http://",
                        user_id: otherId
                    });
            })
            .then((ids) => {
                postId = ids[0];
                return db("users")
                    .where("id", userId)
                    .update({
                        votes: [postId]
                    })
            })
            .then(() => {
                return request(app)	
                    .put("/api/upvote/" + postId)
                    .set('authToken', userId)
                    .expect(404, done);
            });

	});






});

describe("POST /api/submit", function() {

    //this.timeout(0);

    before((done) => {
        migrate().then(() => done());
    });

    beforeEach((done) => {
        truncateAll().then(() => done());
    });
    
    it('should not allow posting if user not authenticated', (done) => {
        request(app)	
            .post("/api/submit/")
            .expect(401, done);
	});

    it('should return errors if missing data', (done) => {
        db("users")
			.returning("id")
			.insert({
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"})
		.then((ids) => {
            let userId = parseInt(ids[0]);
            return request(app)	
                .post("/api/submit/")
                .send({
                    title: '',
                    url: 'foobar'
                })
                .set('authToken', userId)
                .expect(400, done);
        });
    });

    it('should allow posting if legit user', (done) => {

        db("users")
			.returning("id")
			.insert({
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"})
		.then((ids) => {
            let userId = parseInt(ids[0]);
            return request(app)	
                .post("/api/submit/")
                .send({
                    title: 'testing a new post',
                    url: 'http://google.com'
                })
                .set('authToken', userId)
                .expect((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.author_id).to.equal(userId);
                    expect(res.body.title).to.equal("testing a new post");
                })
                .end(done);
        });
    });

});

describe("GET /api/posts/", function() {

    before((done) => {
        migrate().then(() => done());
    });

    beforeEach((done) => {
        truncateAll().then(() => done());
    });

	it('should render a list of posts by score', (done) => {
   	    db("users")
			.returning("id")
			.insert({
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"
        })
        .then((ids) => {
			const userId = ids[0];
			const inserts = [
				{
					title: 'test',
					url: 'http://test',
					user_id: userId
				}
			];
            return db("posts").insert(inserts)
        })
        .then(() => {
            request(app)	
                .get("/api/posts/")
                .expect((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.posts.length).to.equal(1);
                    expect(res.body.total).to.equal(1);
                    expect(res.body.isFirst).to.be.ok;
                    expect(res.body.isLast).to.be.ok;
                }).end(done);
        });

	});

	it('should render a list of posts by id', (done) => {
   	    db("users")
			.returning("id")
			.insert({
				name: "tester",
				password: "tester",
				email: "tester@gmail.com"
        })
        .then((ids) => {
			const userId = ids[0];
			const inserts = [
				{
					title: 'test',
					url: 'http://test',
					user_id: userId
				}
			];
            return db("posts").insert(inserts)
        })
        .then(() => {
            request(app)	
                .get("/api/posts/")
                .query({ orderBy: "id" })
                .expect((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.posts.length).to.equal(1);
                    expect(res.body.total).to.equal(1);
                    expect(res.body.isFirst).to.be.ok;
                    expect(res.body.isLast).to.be.ok;
                }).end(done);
        });

    });

});
